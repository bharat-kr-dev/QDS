'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { simulateAttack, analyseDecoyStates, type AttackSimulation } from '../quantum/attacks';
import { getBellStateVector } from '../quantum/bell';
import { makeRng, seedFromString } from '../quantum/prng';
import { StateVector } from '../quantum/statevector';
import { runTeleportation, correctionScheduleFor, type TeleportationRunResult } from '../quantum/teleportation';
import type { StateMixture } from '../security/qber';
import { verifySignature } from '../security/verification';
import {
  AttackConfig,
  AttackType,
  BasisType,
  BellStateKey,
  ExperimentRecord,
  ForgeryStrategy,
  PauliCorrection,
  QubitState,
  TeleportationStepIndex,
  VerificationResult,
} from '../quantum/types';
import {
  DEFAULT_SEED,
  DEFAULT_SHOTS,
  MAX_EXPERIMENTS,
  PHASE_ANGLES,
  QBER_THRESHOLD,
  REPLAY_WINDOW_SECONDS,
} from '../config';

/*
  Application state.

  Two things here are deliberate and worth stating, because they are what the
  earlier version got wrong.

  First, everything random is seeded. The teleportation outcome and every
  attack derive their draws from one seed through separate streams, so a run
  is reproducible: the same seed, state and attack always produce the same
  numbers. Before, `Math.random()` was called during render, which meant the
  histogram changed every time a component re-rendered and a client and
  server render could disagree.

  Second, the received state is carried as a *mixture*, not a single vector.
  An intercept-resend adversary prepares a fresh qubit from a measurement
  outcome she drew at random, so what arrives at Bob is one branch of a
  distribution. Collapsing that to a single vector — as the previous version
  did — throws away the ensemble and makes the reported error rate depend on
  which branch happened to be drawn.
*/

export type PresetKey = 'zero' | 'one' | 'plus' | 'minus' | 'plusI' | 'minusI' | 'weighted';

export interface Preset {
  key: PresetKey;
  label: string;
  ket: string;
}

export const PRESETS: readonly Preset[] = [
  { key: 'zero', label: '|0⟩', ket: '|0⟩' },
  { key: 'one', label: '|1⟩', ket: '|1⟩' },
  { key: 'plus', label: '|+⟩', ket: '(|0⟩ + |1⟩)/√2' },
  { key: 'minus', label: '|−⟩', ket: '(|0⟩ − |1⟩)/√2' },
  { key: 'plusI', label: '|i⟩', ket: '(|0⟩ + i|1⟩)/√2' },
  { key: 'minusI', label: '|−i⟩', ket: '(|0⟩ − i|1⟩)/√2' },
  { key: 'weighted', label: '70/30', ket: '0.837|0⟩ + 0.548|1⟩' },
];

const DEFAULT_ATTACK: AttackConfig = {
  type: 'none',
  interceptBasis: 'RANDOM',
  phaseAngleDeg: 45,
  noiseLevel: 0.15,
  forgeryStrategy: 'random_state',
  replayDelaySeconds: REPLAY_WINDOW_SECONDS * 2,
  nonceValid: false,
};

/**
 * Independent streams from one seed, so changing the attack does not shift
 * the teleportation outcome and vice versa. The constants are the usual
 * golden-ratio and Mersenne mixers for decorrelated seed expansion.
 */
function teleportSeed(seed: number): number {
  return seed;
}
function attackSeed(seed: number): number {
  return (seed ^ 0x9e3779b9) >>> 0;
}

function mixtureFrom(state: StateVector): StateMixture {
  return { branches: [{ probability: 1, state }] };
}

/** Applies a Pauli correction to every branch of a mixture. */
function correctMixture(mixture: StateMixture, correction: PauliCorrection): StateMixture {
  return {
    branches: mixture.branches.map((b) => ({
      probability: b.probability,
      state: b.state.applyCorrection(correction),
    })),
  };
}

/** Most probable branch — what actually gets displayed. */
function representativeOf(mixture: StateMixture): StateVector {
  let best = mixture.branches[0];
  for (const b of mixture.branches) if (b.probability > best.probability) best = b;
  return best.state;
}

interface QuantumContextValue {
  /* Input */
  inputState: StateVector;
  inputQubit: QubitState;
  setInputFromAngles: (theta: number, phi: number) => void;
  setInputPreset: (preset: PresetKey) => void;

  /* Resource */
  bellKey: BellStateKey;
  setBellKey: (key: BellStateKey) => void;

  /* Flow */
  step: TeleportationStepIndex;
  setStep: (step: TeleportationStepIndex) => void;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  reset: () => void;
  next: () => void;
  previous: () => void;

  /* Adversary */
  attack: AttackConfig;
  setAttack: (config: Partial<AttackConfig>) => void;
  resetAttack: () => void;

  /* Controls */
  autoCorrection: boolean;
  setAutoCorrection: (auto: boolean) => void;
  manualCorrection: PauliCorrection;
  setManualCorrection: (correction: PauliCorrection) => void;
  threshold: number;
  setThreshold: (value: number) => void;
  shots: number;
  setShots: (value: number) => void;

  /* Reproducibility */
  seed: number;
  setSeed: (value: number) => void;
  reseed: (label?: string) => void;

  /* Results */
  teleportation: TeleportationRunResult;
  correctionSchedule: Record<string, PauliCorrection>;
  appliedCorrection: PauliCorrection;
  attackSimulation: AttackSimulation;
  receivedMixture: StateMixture;
  receivedState: StateVector;
  verification: VerificationResult;

  /* Records */
  experiments: ExperimentRecord[];
  saveExperiment: (name?: string) => ExperimentRecord;
  deleteExperiment: (id: string) => void;
  clearExperiments: () => void;
  exportJson: () => void;
  exportCsv: () => void;
}

const QuantumContext = createContext<QuantumContextValue | undefined>(undefined);

const STORAGE_KEY = 'qds.experiments.v2';

export function QuantumProvider({ children }: { children: React.ReactNode }) {
  // cos²(π/6) = 0.75 — a superposition with unequal weights, so the Z
  // histogram is visibly asymmetric and the Bloch vector is off-axis.
  const [inputState, setInputState] = useState<StateVector>(() => StateVector.fromAngles(Math.PI / 3, 0));
  const [bellKey, setBellKey] = useState<BellStateKey>('PHI_PLUS');
  const [step, setStep] = useState<TeleportationStepIndex>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [attack, setAttackState] = useState<AttackConfig>(DEFAULT_ATTACK);
  const [autoCorrection, setAutoCorrection] = useState(true);
  const [manualCorrection, setManualCorrection] = useState<PauliCorrection>('I');
  const [threshold, setThreshold] = useState<number>(QBER_THRESHOLD);
  const [shots, setShots] = useState<number>(DEFAULT_SHOTS);
  const [seed, setSeed] = useState<number>(DEFAULT_SEED);
  const [experiments, setExperiments] = useState<ExperimentRecord[]>([]);

  /* ---- Persistence --------------------------------------------------- */

  useEffect(() => {
    // Reading storage after mount, not during render, so the server and the
    // first client render agree. The earlier version read it in a
    // `useState` initialiser, which produced a hydration mismatch whenever
    // a record had been saved.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) setExperiments(parsed as ExperimentRecord[]);
    } catch {
      // A corrupt or unavailable store is not worth failing the page over.
    }
  }, []);

  const persist = useCallback((list: ExperimentRecord[]) => {
    setExperiments(list);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Quota exceeded or storage disabled — the in-memory list still works.
    }
  }, []);

  /* ---- Simulation ---------------------------------------------------- */

  // Deterministic: same seed, state and resource give the same outcome.
  const teleportation = useMemo(
    () => runTeleportation(inputState, { bellKey, rng: makeRng(teleportSeed(seed)) }),
    [inputState, bellKey, seed],
  );

  const correctionSchedule = useMemo(() => teleportation.correctionSchedule, [teleportation]);

  const appliedCorrection: PauliCorrection = autoCorrection
    ? teleportation.pauliCorrectionRequired
    : manualCorrection;

  const attackSimulation = useMemo(
    () => simulateAttack(teleportation.intermediateState, attack, { rng: makeRng(attackSeed(seed)) }),
    [teleportation.intermediateState, attack, seed],
  );

  // Bob corrects every branch of whatever arrived, not just the one shown.
  const receivedMixture = useMemo(
    () => correctMixture(attackSimulation.received, appliedCorrection),
    [attackSimulation.received, appliedCorrection],
  );

  const receivedState = useMemo(() => representativeOf(receivedMixture), [receivedMixture]);

  const freshnessValid =
    attack.type === 'replay' ? attack.nonceValid && attack.replayDelaySeconds <= REPLAY_WINDOW_SECONDS : true;

  const verification = useMemo(
    () =>
      verifySignature({
        expected: inputState,
        received: receivedMixture,
        classicalBits: teleportation.classicalBits,
        appliedCorrection,
        correctionSchedule,
        threshold,
        freshnessValid,
      }),
    [
      inputState,
      receivedMixture,
      teleportation.classicalBits,
      appliedCorrection,
      correctionSchedule,
      threshold,
      freshnessValid,
    ],
  );

  /* ---- Player -------------------------------------------------------- */

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setStep((prev) => {
        if (prev >= 9) {
          setIsPlaying(false);
          return 9;
        }
        return (prev + 1) as TeleportationStepIndex;
      });
    }, 1400);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const play = useCallback(() => {
    setStep((prev) => (prev >= 9 ? 1 : prev));
    setIsPlaying(true);
  }, []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const reset = useCallback(() => {
    setIsPlaying(false);
    setStep(1);
  }, []);
  const next = useCallback(() => {
    setIsPlaying(false);
    setStep((prev) => (prev < 9 ? ((prev + 1) as TeleportationStepIndex) : 9));
  }, []);
  const previous = useCallback(() => {
    setIsPlaying(false);
    setStep((prev) => (prev > 1 ? ((prev - 1) as TeleportationStepIndex) : 1));
  }, []);

  /* ---- Input --------------------------------------------------------- */

  const setInputFromAngles = useCallback((theta: number, phi: number) => {
    setInputState(StateVector.fromAngles(theta, phi));
  }, []);

  const setInputPreset = useCallback((preset: PresetKey) => {
    switch (preset) {
      case 'zero':
        setInputState(StateVector.zero());
        break;
      case 'one':
        setInputState(StateVector.one());
        break;
      case 'plus':
        setInputState(StateVector.plus());
        break;
      case 'minus':
        setInputState(StateVector.minus());
        break;
      case 'plusI':
        setInputState(StateVector.plusI());
        break;
      case 'minusI':
        setInputState(StateVector.minusI());
        break;
      case 'weighted':
        // cos²(θ/2) = 0.70
        setInputState(StateVector.fromAngles(2 * Math.acos(Math.sqrt(0.7)), 0));
        break;
    }
  }, []);

  const inputQubit = useMemo(
    () => inputState.toQubitState('signature', 'Signature qubit'),
    [inputState],
  );

  /* ---- Adversary ----------------------------------------------------- */

  const setAttack = useCallback((config: Partial<AttackConfig>) => {
    setAttackState((prev) => ({ ...prev, ...config }));
  }, []);
  const resetAttack = useCallback(() => setAttackState(DEFAULT_ATTACK), []);

  const reseed = useCallback((label?: string) => {
    setSeed(label ? seedFromString(label) : (Math.floor(Date.now() % 1e9) ^ DEFAULT_SEED) >>> 0);
  }, []);

  /* ---- Records ------------------------------------------------------- */

  const saveExperiment = useCallback(
    (name?: string): ExperimentRecord => {
      const record: ExperimentRecord = {
        id: `run-${Date.now().toString(36)}-${seed.toString(16)}`,
        timestamp: Date.now(),
        name: name?.trim() || `${attack.type === 'none' ? 'Clean' : ATTACK_LABELS[attack.type]} #${experiments.length + 1}`,
        seed,
        input: {
          alpha: inputState.amplitudes[0].toObject(),
          beta: inputState.amplitudes[1].toObject(),
          bloch: inputState.getBloch(),
        },
        bellKey,
        attack: { ...attack },
        shots,
        classicalBits: teleportation.classicalBits,
        pauliCorrection: appliedCorrection,
        fidelity: verification.fidelity,
        qber: verification.qber,
        verdict: verification.verdict,
      };

      persist([record, ...experiments].slice(0, MAX_EXPERIMENTS));
      return record;
    },
    [
      seed,
      attack,
      experiments,
      inputState,
      bellKey,
      shots,
      teleportation.classicalBits,
      appliedCorrection,
      verification,
      persist,
    ],
  );

  const deleteExperiment = useCallback(
    (id: string) => persist(experiments.filter((e) => e.id !== id)),
    [experiments, persist],
  );

  const clearExperiments = useCallback(() => persist([]), [persist]);

  const download = (filename: string, mime: string, content: string) => {
    // A Blob rather than a data: URI — large exports exceed the URL length
    // browsers accept, and the earlier version silently failed past a few
    // hundred records.
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportJson = useCallback(() => {
    download(`qds-runs-${Date.now()}.json`, 'application/json', JSON.stringify(experiments, null, 2));
  }, [experiments]);

  const exportCsv = useCallback(() => {
    if (experiments.length === 0) return;
    const headers = [
      'id',
      'timestamp',
      'name',
      'seed',
      'bell_state',
      'attack',
      'shots',
      'syndrome',
      'correction',
      'fidelity',
      'qber',
      'verdict',
    ];
    const escape = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
    const rows = experiments.map((e) =>
      [
        e.id,
        new Date(e.timestamp).toISOString(),
        e.name,
        String(e.seed),
        e.bellKey,
        e.attack.type,
        String(e.shots),
        `${e.classicalBits[0]}${e.classicalBits[1]}`,
        e.pauliCorrection,
        e.fidelity.toFixed(6),
        e.qber.toFixed(4),
        e.verdict,
      ].map(escape).join(','),
    );
    download(`qds-runs-${Date.now()}.csv`, 'text/csv', [headers.join(','), ...rows].join('\n'));
  }, [experiments]);

  const value: QuantumContextValue = {
    inputState,
    inputQubit,
    setInputFromAngles,
    setInputPreset,
    bellKey,
    setBellKey,
    step,
    setStep,
    isPlaying,
    play,
    pause,
    reset,
    next,
    previous,
    attack,
    setAttack,
    resetAttack,
    autoCorrection,
    setAutoCorrection,
    manualCorrection,
    setManualCorrection,
    threshold,
    setThreshold,
    shots,
    setShots,
    seed,
    setSeed,
    reseed,
    teleportation,
    correctionSchedule,
    appliedCorrection,
    attackSimulation,
    receivedMixture,
    receivedState,
    verification,
    experiments,
    saveExperiment,
    deleteExperiment,
    clearExperiments,
    exportJson,
    exportCsv,
  };

  return <QuantumContext.Provider value={value}>{children}</QuantumContext.Provider>;
}

export function useQuantum(): QuantumContextValue {
  const ctx = useContext(QuantumContext);
  if (!ctx) throw new Error('useQuantum must be used inside <QuantumProvider>.');
  return ctx;
}

export const ATTACK_LABELS: Record<AttackType, string> = {
  none: 'No adversary',
  intercept_resend: 'Intercept–resend',
  forgery: 'Forgery',
  replay: 'Replay',
  phase_shift: 'Phase shift',
  noise: 'Channel noise',
};

export const FORGERY_LABELS: Record<ForgeryStrategy, string> = {
  random_state: 'Random state',
  orthogonal_guess: 'Orthogonal guess',
  phase_guess: 'Phase-inverted guess',
};

export const BASIS_CHOICES: readonly (BasisType | 'RANDOM')[] = ['RANDOM', 'Z', 'X', 'Y'];

export { analyseDecoyStates };
