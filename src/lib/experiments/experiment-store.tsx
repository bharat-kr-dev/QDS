'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { simulateAttack } from '../quantum/attacks';
import { BELL_STATES } from '../quantum/bell';
import { StateVector } from '../quantum/statevector';
import { runTeleportation, TeleportationRunResult } from '../quantum/teleportation';
import {
  AttackConfig,
  BellStateKey,
  ExperimentRecord,
  QubitState,
  TeleportationStepIndex,
  VerificationResult,
} from '../quantum/types';
import { verifySignature } from '../security/verification';

interface QuantumContextType {
  // Input State (Alice)
  inputState: StateVector;
  inputQubit: QubitState;
  setInputFromAngles: (theta: number, phi: number) => void;
  setInputPreset: (preset: 'zero' | 'one' | 'plus' | 'minus' | 'plusI' | 'minusI' | 'custom70_30') => void;

  // Bell State
  bellKey: BellStateKey;
  setBellKey: (key: BellStateKey) => void;

  // Teleportation Flow
  teleportStep: TeleportationStepIndex;
  setTeleportStep: (step: TeleportationStepIndex) => void;
  teleportResult: TeleportationRunResult;
  isPlaying: boolean;
  playTeleportation: () => void;
  pauseTeleportation: () => void;
  resetTeleportation: () => void;
  stepNext: () => void;
  stepPrev: () => void;

  // Attack Configuration
  attackConfig: AttackConfig;
  setAttackConfig: (config: Partial<AttackConfig>) => void;
  resetAttack: () => void;

  // Manual Pauli Correction & Verification
  manualCorrection: 'I' | 'X' | 'Z' | 'XZ';
  setManualCorrection: (corr: 'I' | 'X' | 'Z' | 'XZ') => void;
  autoCorrectionMode: boolean;
  setAutoCorrectionMode: (auto: boolean) => void;
  qberThreshold: number;
  setQberThreshold: (val: number) => void;
  shotsCount: number;
  setShotsCount: (shots: number) => void;

  // Computed Final States & Results
  receivedState: StateVector;
  verificationResult: VerificationResult;

  // Experiment Management
  experiments: ExperimentRecord[];
  saveCurrentExperiment: (name?: string) => ExperimentRecord;
  deleteExperiment: (id: string) => void;
  clearExperiments: () => void;
  exportExperimentsJson: () => void;
  exportExperimentsCsv: () => void;
}

const QuantumContext = createContext<QuantumContextType | undefined>(undefined);

const DEFAULT_ATTACK: AttackConfig = {
  type: 'none',
  name: 'No Adversary (Clean Channel)',
  enabled: false,
  interceptBasis: 'RANDOM',
  phaseAngleDeg: 45,
  noiseLevel: 0.1,
  forgeryStrategy: 'random_state',
  replayDelaySeconds: 60,
  nonceValid: true,
};

export function QuantumProvider({ children }: { children: React.ReactNode }) {
  // Initial state: cos(pi/6)|0> + sin(pi/6)|1> = sqrt(3)/2 |0> + 1/2 |1> (75% / 25%)
  const [inputState, setInputState] = useState<StateVector>(() =>
    StateVector.fromAngles(Math.PI / 3, 0)
  );
  const [bellKey, setBellKey] = useState<BellStateKey>('PHI_PLUS');
  const [teleportStep, setTeleportStep] = useState<TeleportationStepIndex>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [attackConfig, setAttackConfigState] = useState<AttackConfig>(DEFAULT_ATTACK);

  const [manualCorrection, setManualCorrection] = useState<'I' | 'X' | 'Z' | 'XZ'>('I');
  const [autoCorrectionMode, setAutoCorrectionMode] = useState<boolean>(true);
  const [qberThreshold, setQberThreshold] = useState<number>(5.0);
  const [shotsCount, setShotsCount] = useState<number>(1000);

  const [experiments, setExperiments] = useState<ExperimentRecord[]>([]);

  // Load experiments from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('qds_experiments');
      if (saved) {
        setExperiments(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save experiments to localStorage
  const persistExperiments = (newList: ExperimentRecord[]) => {
    setExperiments(newList);
    try {
      localStorage.setItem('qds_experiments', JSON.stringify(newList));
    } catch {
      // ignore
    }
  };

  // Run teleportation simulation whenever input state or Bell key changes
  const teleportResult = useMemo(() => {
    return runTeleportation(inputState, bellKey);
  }, [inputState, bellKey]);

  // Synchronize auto correction
  useEffect(() => {
    if (autoCorrectionMode) {
      setManualCorrection(teleportResult.pauliCorrectionRequired);
    }
  }, [autoCorrectionMode, teleportResult.pauliCorrectionRequired]);

  // Compute attacked/channel-perturbed state
  const attackSimulation = useMemo(() => {
    return simulateAttack(teleportResult.bobIntermediateState, attackConfig);
  }, [teleportResult.bobIntermediateState, attackConfig]);

  // Apply Bob's correction on the (possibly attacked) state
  const receivedState = useMemo(() => {
    const stateToCorrect = attackConfig.enabled
      ? attackSimulation.disturbedState
      : teleportResult.bobIntermediateState;

    const corr = autoCorrectionMode ? teleportResult.pauliCorrectionRequired : manualCorrection;
    return stateToCorrect.applyPauliCorrection(corr);
  }, [
    attackConfig.enabled,
    attackSimulation.disturbedState,
    teleportResult.bobIntermediateState,
    autoCorrectionMode,
    teleportResult.pauliCorrectionRequired,
    manualCorrection,
  ]);

  // Compute Verification Result
  const verificationResult = useMemo(() => {
    const applied = autoCorrectionMode ? teleportResult.pauliCorrectionRequired : manualCorrection;
    const freshness = attackConfig.type === 'replay' ? attackConfig.nonceValid ?? false : true;

    return verifySignature(
      inputState,
      receivedState,
      teleportResult.classicalBits,
      applied,
      qberThreshold,
      freshness
    );
  }, [
    inputState,
    receivedState,
    teleportResult.classicalBits,
    autoCorrectionMode,
    teleportResult.pauliCorrectionRequired,
    manualCorrection,
    qberThreshold,
    attackConfig,
  ]);

  // Step player animation
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTeleportStep((prev) => {
        if (prev >= 9) {
          setIsPlaying(false);
          return 9;
        }
        return (prev + 1) as TeleportationStepIndex;
      });
    }, 1200);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const playTeleportation = () => {
    if (teleportStep >= 9) {
      setTeleportStep(1);
    }
    setIsPlaying(true);
  };

  const pauseTeleportation = () => setIsPlaying(false);

  const resetTeleportation = () => {
    setIsPlaying(false);
    setTeleportStep(1);
  };

  const stepNext = () => {
    setIsPlaying(false);
    setTeleportStep((prev) => (prev < 9 ? ((prev + 1) as TeleportationStepIndex) : 9));
  };

  const stepPrev = () => {
    setIsPlaying(false);
    setTeleportStep((prev) => (prev > 1 ? ((prev - 1) as TeleportationStepIndex) : 1));
  };

  const setInputFromAngles = (theta: number, phi: number) => {
    setInputState(StateVector.fromAngles(theta, phi));
  };

  const setInputPreset = (
    preset: 'zero' | 'one' | 'plus' | 'minus' | 'plusI' | 'minusI' | 'custom70_30'
  ) => {
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
      case 'custom70_30':
        // cos(theta/2)^2 = 0.70 -> theta = 2 * acos(sqrt(0.70))
        setInputState(StateVector.fromAngles(2 * Math.acos(Math.sqrt(0.7)), 0));
        break;
    }
  };

  const setAttackConfig = (cfg: Partial<AttackConfig>) => {
    setAttackConfigState((prev) => ({ ...prev, ...cfg }));
  };

  const resetAttack = () => {
    setAttackConfigState(DEFAULT_ATTACK);
  };

  const saveCurrentExperiment = (name?: string): ExperimentRecord => {
    const record: ExperimentRecord = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      name: name || `Experiment Run #${experiments.length + 1} (${attackConfig.enabled ? attackConfig.type : 'Clean'})`,
      inputState: {
        name: 'Signature Qubit',
        alpha: inputState.amplitudes[0].toObject(),
        beta: inputState.amplitudes[1].toObject(),
        bloch: inputState.getSingleQubitBloch(),
      },
      bellState: bellKey,
      attackConfig: { ...attackConfig },
      shots: shotsCount,
      classicalBits: teleportResult.classicalBits,
      pauliCorrection: autoCorrectionMode ? teleportResult.pauliCorrectionRequired : manualCorrection,
      fidelity: verificationResult.fidelity,
      qber: verificationResult.qber,
      verdict: verificationResult.verdict,
    };

    const updated = [record, ...experiments];
    persistExperiments(updated);
    return record;
  };

  const deleteExperiment = (id: string) => {
    const updated = experiments.filter((e) => e.id !== id);
    persistExperiments(updated);
  };

  const clearExperiments = () => {
    persistExperiments([]);
  };

  const exportExperimentsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(experiments, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `qds_experiments_${Date.now()}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const exportExperimentsCsv = () => {
    if (experiments.length === 0) return;
    const headers = ['ID', 'Timestamp', 'Name', 'BellState', 'AttackType', 'Fidelity', 'QBER', 'Verdict', 'ClassicalBits', 'PauliCorrection'];
    const rows = experiments.map((e) => [
      e.id,
      new Date(e.timestamp).toISOString(),
      `"${e.name}"`,
      e.bellState,
      e.attackConfig.type,
      e.fidelity,
      e.qber,
      e.verdict,
      `"${e.classicalBits[0]}${e.classicalBits[1]}"`,
      e.pauliCorrection,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.setAttribute('href', encodeURI(csvContent));
    a.setAttribute('download', `qds_experiments_${Date.now()}.csv`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const inputQubit = useMemo(() => {
    return inputState.toQubitState(
      'alice_sig_qubit',
      'Alice Signature Qubit',
      'Cryptographic quantum state to be transferred via Bell teleportation protocol.'
    );
  }, [inputState]);

  return (
    <QuantumContext.Provider
      value={{
        inputState,
        inputQubit,
        setInputFromAngles,
        setInputPreset,
        bellKey,
        setBellKey,
        teleportStep,
        setTeleportStep,
        teleportResult,
        isPlaying,
        playTeleportation,
        pauseTeleportation,
        resetTeleportation,
        stepNext,
        stepPrev,
        attackConfig,
        setAttackConfig,
        resetAttack,
        manualCorrection,
        setManualCorrection,
        autoCorrectionMode,
        setAutoCorrectionMode,
        qberThreshold,
        setQberThreshold,
        shotsCount,
        setShotsCount,
        receivedState,
        verificationResult,
        experiments,
        saveCurrentExperiment,
        deleteExperiment,
        clearExperiments,
        exportExperimentsJson,
        exportExperimentsCsv,
      }}
    >
      {children}
    </QuantumContext.Provider>
  );
}

export function useQuantum() {
  const ctx = useContext(QuantumContext);
  if (!ctx) {
    throw new Error('useQuantum must be used within a QuantumProvider');
  }
  return ctx;
}
