# Quantum Digital Signature (QDS) Workstation

Welcome to the Quantum Digital Signature (QDS) Workstation! This platform is an interactive, browser-based quantum simulator designed to demonstrate the end-to-end process of generating, transmitting, and verifying unforgeable digital signatures using the principles of quantum mechanics. 

Built with a "light scientific instrument" aesthetic, this tool avoids black-box abstractions and instead exposes the raw mathematical formalisms, [Dirac ket notation](#dirac-ket-notation), [Bloch sphere](#bloch-sphere) geometries, and state vectors driving the protocol.

---

## 🧭 Navigation & Features Guide

The workstation is divided into specialized tabs (accessible via the left sidebar) that walk you through the lifecycle of a quantum signature.

### 1. Dashboard / Overview
**What it is:** The command center of the workstation.
**What to look for:**
- High-level telemetry of the current quantum channel (clean vs. under attack).
- Quick launch buttons to jump into specific stages of the signature protocol.
- The global health metrics, ensuring the environment is properly configured.
**How to use:** Start here to get a bird's-eye view of your session before diving into the mathematical laboratories.

### 2. Qubit Preparation Lab
**What it is:** A single-[qubit](#qubit) interactive laboratory where Alice creates her digital signature payload.
**What to look for:**
- **3D [Bloch Sphere](#bloch-sphere):** Watch the state vector $|\\psi\\rangle$ dynamically update as you apply quantum logic gates (Hadamard, X, Z).
- **[Dirac Ket Notation](#dirac-ket-notation):** Observe the complex probability amplitudes ($\\alpha$ and $\\beta$) and how they satisfy normalization ($|\\alpha|^2 + |\\beta|^2 = 1$).
- **Histogram Chart:** Run simulated projective measurements to see the empirical probability distributions of collapsing into $|0\\rangle$ or $|1\\rangle$.
**How to use:** Use the preset buttons (e.g., $|+\\rangle$, $|-i\\rangle$) or apply sequential quantum gates to engineer the exact quantum state you want to use as your signature.

### 3. Bell State Generator
**What it is:** The engine that generates maximally entangled [EPR (Einstein-Podolsky-Rosen) pairs](#epr-pairs--entanglement), which act as the communication channel between Alice and Bob.
**What to look for:**
- **Spatial [Entanglement](#epr-pairs--entanglement) Distribution:** Visualizes the non-local connection between Alice's and Bob's separated qubits.
- **[CHSH Bell Inequality](#chsh-bell-inequality):** Verifies that the generated states violate classical [local hidden variable](#local-hidden-variable) bounds ($S = 2\\sqrt{2}$).
- **State Vector & Circuit:** Displays the computational basis amplitudes and generation circuits for the four canonical [Bell states](#bell-states) ($\\Phi^{\\pm}$, $\\Psi^{\\pm}$).
**How to use:** Select one of the four Bell states to act as the entangled resource bridging the [teleportation channel](#teleportation-protocol).

### 4. Teleportation Pipeline
**What it is:** The core [teleportation protocol](#teleportation-protocol) (Bennett et al., 1993) executing the transfer of the signature state from Alice to Bob without physically moving the payload particle.
**What to look for:**
- **9-Step Interactive Pipeline:** An end-to-end flow from State Preparation to [Fidelity](#quantum-fidelity) Verification. 
- **Live State Inspection:** Click on any node in the pipeline to reveal the mathematical formalism, live telemetry, and purpose of that specific stage.
**How to use:** Step through the pipeline sequentially to understand how the signature payload is entangled with the channel, measured in the Bell basis, and reconstructed by Bob using classical [syndrome bits](#syndrome-bits).

### 5. Signature Verification
**What it is:** The culmination of the teleportation protocol where Bob checks if the received signature matches the expected payload.
**What to look for:**
- **[Quantum Fidelity](#quantum-fidelity) Score:** Represents the overlap $|\\langle\\psi_{original}|\\psi_{received}\\rangle|^2$. A score of 100% means the signature is perfectly verified.
- **Side-by-Side [Bloch Spheres](#bloch-sphere):** Visually compares Alice's original signature state with Bob's reconstructed state.
**How to use:** Use this tab to mathematically prove the integrity of the signature transfer.

### 6. Threat Detection & QBER
**What it is:** The security analysis engine monitoring the quantum channel for eavesdroppers (Eve).
**What to look for:**
- **[QBER Gauge](#qber-quantum-bit-error-rate):** Tracks the error percentage across the channel.
- **[Mutually Unbiased Bases (MUB)](#mutually-unbiased-bases-mub) Analyzer:** Detects eavesdroppers by comparing expected vs. observed measurement probabilities across non-commuting Z, X, and Y bases.
- **[Decoy-State PNS Analysis](#photon-number-splitting-pns--decoy-states):** Checks for multi-[photon number splitting](#photon-number-splitting-pns--decoy-states) attacks by comparing the attenuation ratios of signal vs. decoy pulses.
**How to use:** Adjust the statistical security threshold (e.g., 5% or 11%). If QBER exceeds this threshold, the channel is deemed compromised.

### 7. Adversarial Red Team
**What it is:** A sandbox for executing active attacks against the teleportation channel.
**What to look for:**
- **Attack Scenarios:** Choose from [Intercept-Resend](#intercept-resend-attack), [Entanglement Forgery](#entanglement-forgery), or [Ambient Decoherence](#ambient-decoherence).
- **Wavefunction Collapse Visualizer:** See exactly how Eve's unauthorized measurement destroys the delicate quantum superposition.
**How to use:** Initiate an attack and immediately return to the **Signature Verification** or **Threat Detection** tabs to observe the resulting fidelity drop and QBER spike.

### 8. Experiments & Analytics
**What it is:** A data store for logging and benchmarking simulation runs.
**What to look for:**
- **Differential Benchmark:** A side-by-side comparison table showing the $\\Delta$ (difference) in QBER and fidelity between a clean run and an attacked run.
- **Export Options:** Save the raw telemetry as CSV or JSON for offline academic analysis.
**How to use:** After running a simulation, save the experiment. Run another scenario (e.g., an attack) and compare the two datasets to understand the statistical footprint of the attack.

### 9. Theory & Learning
**What it is:** The interactive knowledge base explaining the physics and cryptography of QDS.
**What to look for:**
- **15 Curriculum Modules:** Covering topics from Qubits and Superposition to the No-Cloning Theorem and Decoy States.
- **Mathematical Formularies:** Beautifully rendered LaTeX equations utilizing KaTeX.
**How to use:** Refer to this section whenever you need a plain-English explanation or the rigorous mathematical proof for any concept encountered in the simulator.

### 10. System Settings
**What it is:** Configuration center for the simulation engine.
**What to look for:**
- Adjust shot counts for measurements.
- Toggle deterministic (seeded) vs. stochastic PRNG calculations.

---

## 📖 Glossary & Definitions

The following terms represent the core quantum mechanical abstractions utilized throughout the QDS workstation.

### Qubit
The fundamental unit of quantum information. Unlike a classical bit (strictly 0 or 1), a qubit exists in a two-dimensional complex Hilbert space and can represent a superposition of both states simultaneously.

### Bloch Sphere
A geometric, 3D spherical representation of the pure state space of a two-level quantum mechanical system (qubit). The north and south poles typically represent the $|0\\rangle$ and $|1\\rangle$ states, allowing for visual intuition of quantum operations.

### Dirac Ket Notation
Also known as bra-ket notation, this is the standard mathematical notation for quantum states. A "ket" $|\\psi\\rangle$ represents a column vector denoting the state of the quantum system.

### EPR Pairs / Entanglement
Einstein-Podolsky-Rosen (EPR) pairs are particles exhibiting quantum entanglement—a phenomenon where the state of one particle cannot be described independently of the other. Measuring one particle instantly determines the state of its entangled partner, regardless of spatial distance.

### CHSH Bell Inequality
A specific statistical test (Clauser-Horne-Shimony-Holt) that establishes a mathematical upper bound for correlations produced by classical systems. Quantum entangled states violate this bound, proving the presence of non-local quantum correlations.

### Local Hidden Variable
A classical physics theory proposing that entangled particles contain unobserved, pre-determined properties ("hidden variables") that dictate their measurement outcomes. The violation of the Bell inequality disproves local hidden variable theories.

### Bell States
The four specific maximally entangled quantum states of two qubits ($\\Phi^+$, $\\Phi^-$, $\\Psi^+$, $\\Psi^-$). They form an orthonormal basis for the four-dimensional Hilbert space of two qubits and act as the "channel" in quantum teleportation.

### Teleportation Protocol
A technique to transfer unknown quantum information from a sender to a receiver using a pre-shared entangled Bell state and a classical communication channel.

### Syndrome Bits
In teleportation, the sender performs a joint Bell-basis measurement on the payload and their half of the entangled pair. This yields two classical bits of information (the "syndrome"), which are sent to the receiver to instruct them on which Pauli rotations to apply to reconstruct the payload.

### Quantum Fidelity
A measure of the "closeness" or overlap between two quantum states. A fidelity of 100% (or 1.0) means the states are identical, while 0% means they are perfectly orthogonal (distinguishable).

### Mutually Unbiased Bases (MUB)
A set of bases (like the Z, X, and Y bases) where measuring a state prepared in one basis using another basis results in completely random outcomes. Monitoring MUBs is crucial for detecting eavesdroppers.

### QBER (Quantum Bit Error Rate)
The statistical ratio of erroneous bits to total bits transmitted over a quantum channel. It is the primary metric used to determine if a channel is secure or compromised.

### Photon Number Splitting (PNS) / Decoy States
In practical quantum cryptography using weak laser pulses, some pulses emit multiple photons. An eavesdropper could split one photon off and let the other proceed undetected (PNS attack). **Decoy States** are random pulses of varying intensities mixed into the signal to detect this specific splitting behavior.

### Intercept-Resend Attack
A scenario where an eavesdropper intercepts a traveling qubit, measures it, and forwards a new qubit based on their measurement. Because measurement collapses quantum states (No-Cloning Theorem), this attack invariably leaves detectable errors.

### Entanglement Forgery
An attack where an adversary attempts to substitute the legitimate entangled Bell pair with their own, aiming to hijack the teleportation channel.

### Ambient Decoherence
The natural, unintentional loss of quantum information (coherence) due to the qubit interacting with its environment (e.g., thermal fluctuations, magnetic fields, or fiber optic noise). It is a form of passive error, distinct from active eavesdropping.

---

## 🚀 Getting Started Locally

1. **Install Dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Run the Development Server:**
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser to start generating quantum signatures!
