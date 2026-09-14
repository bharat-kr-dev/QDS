import type { AttackType, BellStateKey, TeleportationStepIndex } from '../lib/quantum/types';

/*
  Protocol prose.

  The copy that describes what each stage of the protocol *means* lives here,
  separated from the code that computes what it *does*. Pages read these
  entries rather than carrying their own paragraphs, so the nine stages are
  described once, in one voice, wherever they appear.

  Deliberately free of imports from the component tree: this is data, and the
  physics modules import from it. A React import here would drag the whole UI
  into anything that wanted to reason about the protocol, including a test
  run under plain Node.
*/

/** The nine stages of Bennett–Brassard teleportation, in order. */
export const PROTOCOL_STAGES: Record<
  TeleportationStepIndex,
  { title: string; summary: string; note: string }
> = {
  1: {
    title: 'Prepare the signature state',
    summary: 'Alice holds the unknown state she needs to convey.',
    note: 'The state encodes the signature. It cannot be copied, so it cannot simply be sent twice or held in reserve.',
  },
  2: {
    title: 'Establish an entangled pair',
    summary: 'A source emits a Bell pair and splits it between the two sites.',
    note: 'The pair is the channel. Its entanglement is the resource that will carry the state, and it is consumed by the transfer.',
  },
  3: {
    title: 'Join the state to the pair',
    summary: 'Alice’s qubit and her half of the pair are treated as one system.',
    note: 'Three qubits now share a single joint state. Writing that state out is what makes the next step tractable.',
  },
  4: {
    title: 'Measure in the Bell basis',
    summary: 'Alice projects her two qubits onto one of four maximally entangled outcomes.',
    note: 'This is the only irreversible step. It destroys Alice’s copy of the state, which is why the protocol does not violate no-cloning.',
  },
  5: {
    title: 'Read off two classical bits',
    summary: 'The measurement yields one of four outcomes, recorded as two bits.',
    note: 'Two bits carry no information about the state itself — only which of four rotations Bob will need.',
  },
  6: {
    title: 'Send the two bits',
    summary: 'The outcome travels to Bob over an ordinary classical channel.',
    note: 'No quantum information moves here. Nothing Bob can do before these bits arrive will recover the state, which is what keeps the protocol causal.',
  },
  7: {
    title: 'Apply the correction',
    summary: 'Bob applies the Pauli operation the two bits call for.',
    note: 'Each outcome corresponds to a known rotation. Undoing it is what aligns Bob’s qubit with the state Alice began with.',
  },
  8: {
    title: 'Recover the state',
    summary: 'Bob’s qubit now matches Alice’s original.',
    note: 'The state has moved without traversing the space between them. Only the two classical bits did.',
  },
  9: {
    title: 'Verify',
    summary: 'Bob measures the recovered state and compares it against expectation.',
    note: 'Any interception between steps 2 and 6 shows up here as a drop in fidelity or a rise in the error rate.',
  },
};

/** One-line descriptions of each Bell state, for the state selector. */
export const BELL_STATE_NOTES: Record<BellStateKey, { usage: string }> = {
  PHI_PLUS: {
    usage: 'The conventional teleportation resource. Both qubits read the same in Z, and the same in X.',
  },
  PHI_MINUS: {
    usage: 'Differs from Φ⁺ by a relative phase. The Z reads still agree; the X reads invert.',
  },
  PSI_PLUS: {
    usage: 'Anti-correlated in Z: a 0 on one side implies a 1 on the other.',
  },
  PSI_MINUS: {
    usage: 'The singlet. Its correlations invert along every axis, which makes it the state used to test Bell inequalities.',
  },
};

/* ---- Attack catalogue ------------------------------------------------- */

export interface AttackProfile {
  type: AttackType;
  name: string;
  /** What the adversary does, in one sentence. */
  action: string;
  /** What the defender should expect to observe. */
  signature: string;
}

export const ATTACK_PROFILES: readonly AttackProfile[] = [
  {
    type: 'none',
    name: 'No adversary',
    action: 'The channel is left alone.',
    signature: 'Fidelity at 1.000 and an error rate at the sampling floor.',
  },
  {
    type: 'intercept_resend',
    name: 'Intercept and resend',
    action:
      'Eve measures the travelling qubit in a basis of her choosing, then sends on the state her measurement produced.',
    signature:
      'Error rate rises in proportion to how often her basis disagrees with the encoding. Dephasing alone is enough to expose her.',
  },
  {
    type: 'forgery',
    name: 'Forgery',
    action: 'A party without the signature state submits a state of their own construction.',
    signature:
      'Fidelity collapses toward 0.5 for a blind guess, and the deficiency is spread evenly across all three bases.',
  },
  {
    type: 'replay',
    name: 'Replay',
    action: 'A previously valid transcript is captured and submitted again later.',
    signature:
      'The state matches perfectly — fidelity 1.000 and a clean error rate — and the packet is caught only because its nonce has expired.',
  },
  {
    type: 'phase_shift',
    name: 'Phase rotation',
    action:
      'A unitary rotation is applied to the relative phase of the superposition in transit.',
    signature:
      'Z-basis populations are untouched while the X and Y bases shift. Rotations of a full turn are invisible to the comparison.',
  },
  {
    type: 'noise',
    name: 'Channel noise',
    action: 'Thermal drift and imperfect optics perturb the channel without an adversary present.',
    signature:
      'A low error rate spread across every basis, consistent with environmental decoherence rather than a deliberate probe.',
  },
];

/** Copy for the three mutually unbiased bases. */
export const BASIS_NOTES = {
  Z: { name: 'Computational', measures: 'whether the qubit reads 0 or 1' },
  X: { name: 'Diagonal', measures: 'whether the superposition is in phase or inverted' },
  Y: { name: 'Circular', measures: 'the same distinction as the diagonal basis, rotated a quarter turn' },
} as const;
