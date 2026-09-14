/*
  Every tunable number in the simulator.

  These were previously scattered as literals through components and physics.
  Collecting them here means the QBER bound the adversory page quotes is the
  same value the verification page enforces, and changing it changes both.
*/

/**
 * Error rate above which a channel is treated as compromised.
 *
 * Chosen against the physics rather than picked for roundness. Intercept-resend
 * always lands on at least one basis where the receiver disagrees a quarter of
 * the time or more, so any value comfortably under 25 separates a probed
 * channel from an honest one. Two to three percent of drift is realistic for
 * a free-space link, so the bound sits above that and well below the attack.
 */
export const QBER_THRESHOLD = 12;

/** Deviation below which a basis is treated as agreeing with prediction. */
export const NOISE_FLOOR = 2.5;

/** A basis counts as disturbed once its deviation clears this many percent. */
export const BASIS_DEVIATION_LIMIT = 4.0;

/** Above this multiple of the bound, a deviating channel is called tampered. */
export const TAMPER_MULTIPLE = 2;

/** Measurement shots used for the standard histogram. */
export const DEFAULT_SHOTS = 1024;

/** Shots used for the three-basis consistency check during verification. */
export const VERIFICATION_SHOTS = 4096;

/** Noise intensities offered on the attack page, 0–1. */
export const NOISE_LEVELS = [0, 0.05, 0.15, 0.35] as const;

/** Phase angles offered for the dephasing attack, in degrees. */
export const PHASE_ANGLES = [15, 45, 90, 180] as const;

/** Replay becomes detectable past this packet age, in seconds. */
export const REPLAY_WINDOW_SECONDS = 30;

/** Decoy-state intensities for the photon-number-splitting analysis. */
export const DECOY_SIGNAL_INTENSITY = 0.5;
export const DECOY_WEAK_INTENSITY = 0.1;

/** Fraction of pulses lost in transit, standing in for fibre attenuation. */
export const CHANNEL_LOSS = 0.2;

/** Sampling rate of the induced-phase animation, in milliseconds. */
export const ANIMATION_INTERVAL_MS = 40;

/** Bound on stored experiment records before the oldest are dropped. */
export const MAX_EXPERIMENTS = 50;

/** Initial seed. Deterministic so two fresh loads agree. */
export const DEFAULT_SEED = 0x5f3759df;
