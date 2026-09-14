import type { ReactNode, SVGProps } from 'react';

/*
  The QDS icon set.

  Drawn as one system: a 24-unit grid, 1.6 stroke, square caps and mitred
  joins. The square terminals are a deliberate departure from the round-capped
  house style of most icon libraries — they read as engraved panel markings
  rather than as UI furniture.

  Icons are geometric statements of what the thing *is* (a double line is a
  classical channel because that is how a classical wire is drawn in a circuit
  diagram; a barrier with a threshold line is a QBER reading), so they stay
  legible when a label is missing.
*/

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** Rendered edge length in px. */
  size?: number;
}

function Svg({ size = 18, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ---- Protocol stages -------------------------------------------------- */

/** The signature payload: a key. */
export const IconSignature = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="8.5" cy="15.5" r="3.5" />
    <path d="M11 13 L19.5 4.5" />
    <path d="M15.6 8.4 L17.8 10.6" />
    <path d="M18 6 L19.7 7.7" />
  </Svg>
);

/** An entangled pair: two distant qubits joined by one correlation. */
export const IconEntangle = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="12" r="2.5" />
    <path d="M8.5 12 C10.5 7.5 13.5 16.5 15.5 12" />
  </Svg>
);

/** Teleportation: the state leaves one site and arrives at the other. */
export const IconTeleport = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="4.5" cy="16.5" r="2" />
    <circle cx="19.5" cy="16.5" r="2" />
    <path d="M6.5 16.5 Q12 4 17.5 16.5" strokeDasharray="3 2.5" />
  </Svg>
);

/** Projective measurement: a meter needle against a scale. */
export const IconMeter = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 17.5 A8.5 8.5 0 0 1 20.5 17.5" />
    <path d="M12 17.5 L16.2 11.4" />
    <path d="M12 16.4 L12 18.6" />
  </Svg>
);

/** A classical channel, drawn as the double wire of a circuit diagram. */
export const IconClassical = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.8 9.5 H21.2" />
    <path d="M2.8 14.5 H21.2" />
    <path d="M8 9.5 V14.5" strokeDasharray="2 2" />
    <path d="M16 9.5 V14.5" strokeDasharray="2 2" />
  </Svg>
);

/** A Pauli gate, drawn as a labelled gate box. */
export const IconPauli = (p: IconProps) => (
  <Svg {...p}>
    <rect x="4.5" y="4.5" width="15" height="15" />
    <path d="M8.6 8.6 L15.4 15.4" />
    <path d="M15.4 8.6 L8.6 15.4" />
  </Svg>
);

/** Arrival at the receiver. */
export const IconReceive = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 4.5 H20.5 V19.5 H3.5 Z" />
    <path d="M3.5 13 H8.5 L10 16 H14 L15.5 13 H20.5" />
  </Svg>
);

/** Verification: a shield that has been checked. */
export const IconVerify = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.2 L19.6 6.2 V11.6 C19.6 16.2 16.4 19.4 12 21.2 C7.6 19.4 4.4 16.2 4.4 11.6 V6.2 Z" />
    <path d="M8.6 11.8 L11 14.2 L15.6 9.4" />
  </Svg>
);

/** Threat: a fault in the channel. */
export const IconThreat = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5 L21.2 19.5 H2.8 Z" />
    <path d="M12 9.6 V14.2" />
    <path d="M12 16.6 V17.6" />
  </Svg>
);

/** QBER against its threshold. */
export const IconQber = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 6.6 H21" strokeDasharray="3 2.5" />
    <path d="M4.5 19.5 V13" />
    <path d="M9.5 19.5 V9.6" />
    <path d="M14.5 19.5 V15.4" />
    <path d="M19.5 19.5 V11" />
  </Svg>
);

/* ---- Laboratory ------------------------------------------------------- */

/** The Bloch sphere with a state vector. */
export const IconBloch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8" />
    <ellipse cx="12" cy="12" rx="8" ry="3.2" />
    <path d="M12 12 L16.6 7.4" />
    <path d="M14 7.7 L16.8 7.3 L16.4 10.1" />
  </Svg>
);

/** An adversary injecting into the channel. */
export const IconIntrusion = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.8 15.2 H8.2" />
    <path d="M15.8 15.2 H21.2" />
    <path d="M8.2 15.2 L12 5 L15.8 15.2" />
  </Svg>
);

/** A pulse train — the shape of a decoy state. */
export const IconPulse = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.8 12 H6.5 L9 5.5 L13 18.5 L15.5 12 H21.2" />
  </Svg>
);

/** Phase drift / channel noise. */
export const IconDrift = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.8 12 Q5.8 5.6 8.8 12 T14.8 12 T20.8 12" />
  </Svg>
);

/** Replay: a captured packet re-injected after its nonce expired. */
export const IconReplay = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19.8 9.4 A8 8 0 1 0 20 14.6" />
    <path d="M20.4 5.4 V9.8 H16" />
    <path d="M12 8.4 V12 L14.9 13.7" />
  </Svg>
);

/** Forgery: a signature that was not written by the holder. */
export const IconForgery = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5.5 3.5 H14.5 L18.5 7.5 V20.5 H5.5 Z" />
    <path d="M14.5 3.5 V7.5 H18.5" />
    <path d="M8.2 15.4 C9.2 13.2 10.4 13.2 11.4 15.4 C12.4 17.6 13.6 17.6 14.6 15.4" />
  </Svg>
);

/** A beam splitter, the source of the entangled pair. */
export const IconSplitter = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5.2" y="5.2" width="13.6" height="13.6" transform="rotate(45 12 12)" />
    <path d="M7.4 16.6 L16.6 7.4" />
  </Svg>
);

/** A single qubit. */
export const IconQubit = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="7.6" />
    <path d="M12 4.4 V19.6" />
  </Svg>
);

/* ---- Navigation ------------------------------------------------------- */

export const IconOverview = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.3 12 H9.2" strokeDasharray="2 2" />
    <path d="M14.8 12 H17.7" strokeDasharray="2 2" />
    <circle cx="4.5" cy="12" r="1.9" />
    <circle cx="12" cy="12" r="1.9" />
    <circle cx="19.5" cy="12" r="1.9" />
  </Svg>
);

export const IconExperiments = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9.5 3.5 V9 L4.8 17.6 A1.8 1.8 0 0 0 6.4 20.4 H17.6 A1.8 1.8 0 0 0 19.2 17.6 L14.5 9 V3.5" />
    <path d="M7.6 3.5 H16.4" />
    <path d="M7.3 14.6 H16.7" />
  </Svg>
);

export const IconLearn = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 7 C10 5.3 7 5 4 5.7 V18.3 C7 17.6 10 17.9 12 19.6 C14 17.9 17 17.6 20 18.3 V5.7 C17 5 14 5.3 12 7 Z" />
    <path d="M12 7 V19.6" />
  </Svg>
);

export const IconSettings = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 7.5 H6.8" />
    <circle cx="9" cy="7.5" r="2.2" />
    <path d="M11.2 7.5 H20.5" />
    <path d="M3.5 16.5 H13.8" />
    <circle cx="16" cy="16.5" r="2.2" />
    <path d="M18.2 16.5 H20.5" />
  </Svg>
);

/* ---- Transport controls ---------------------------------------------- */

export const IconPlay = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7.5 4.8 L19 12 L7.5 19.2 Z" />
  </Svg>
);

export const IconPause = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8.6 5 V19" />
    <path d="M15.4 5 V19" />
  </Svg>
);

export const IconStepForward = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 5.2 L15.5 12 L6.5 18.8 Z" />
    <path d="M18 5 V19" />
  </Svg>
);

export const IconStepBack = (p: IconProps) => (
  <Svg {...p}>
    <path d="M17.5 5.2 L8.5 12 L17.5 18.8 Z" />
    <path d="M6 5 V19" />
  </Svg>
);

export const IconRestart = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19.4 12 A7.4 7.4 0 1 1 12 4.6" />
    <path d="M8.6 4.6 H12 V1.9" />
  </Svg>
);

/* ---- Actions ---------------------------------------------------------- */

export const IconSave = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5 V14.5" />
    <path d="M7.8 10.3 L12 14.5 L16.2 10.3" />
    <path d="M4 16.5 V20.5 H20 V16.5" />
  </Svg>
);

export const IconReset = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9.5 6.5 L4 12 L9.5 17.5" />
    <path d="M4 12 H13.6 A4.4 4.4 0 0 1 13.6 20.8" />
  </Svg>
);

export const IconExport = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 4.5 H13.5 V20.5 H3.5 Z" />
    <path d="M3.5 10 H13.5" />
    <path d="M8.5 10 V20.5" />
    <path d="M16.5 12 H21.5" />
    <path d="M19 9.5 L21.5 12 L19 14.5" />
  </Svg>
);

export const IconTrash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 7 H19.5" />
    <path d="M9.5 7 V4.5 H14.5 V7" />
    <path d="M6.5 7 L7.6 20.5 H16.4 L17.5 7" />
  </Svg>
);

export const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 6.6 V12 L16 14.4" />
  </Svg>
);

/* ---- Marks ------------------------------------------------------------ */

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.8 12.6 L9.6 17.4 L19.2 6.6" />
  </Svg>
);

export const IconCross = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 6 L18 18" />
    <path d="M18 6 L6 18" />
  </Svg>
);

export const IconInfo = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 11.2 V16.6" />
    <path d="M12 7.6 V8.6" />
  </Svg>
);

export const IconChevronRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9.5 5.5 L16 12 L9.5 18.5" />
  </Svg>
);

export const IconChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5.5 9.5 L12 16 L18.5 9.5" />
  </Svg>
);

/* ---- Canonical stage marks -------------------------------------------
   Indexed by protocol stage so the rail, the overview diagram and any
   legend all draw the same glyph for the same stage.                     */

export const STAGE_MARKS = {
  signature: IconSignature,
  entangle: IconEntangle,
  teleport: IconTeleport,
  meter: IconMeter,
  classical: IconClassical,
  pauli: IconPauli,
  receive: IconReceive,
  verify: IconVerify,
  threat: IconThreat,
} as const;

export type StageMark = keyof typeof STAGE_MARKS;
