# Quantum Digital Signature (QDS) Workstation

Welcome to the Quantum Digital Signature (QDS) Workstation! This platform is an interactive, browser-based quantum simulator designed to demonstrate the end-to-end process of generating, transmitting, and verifying unforgeable digital signatures using the principles of quantum mechanics. 

Built with a "light scientific instrument" aesthetic, this tool avoids black-box abstractions and instead exposes the raw mathematical formalisms, Dirac ket notation, Bloch sphere geometries, and state vectors driving the protocol.

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
**What it is:** A single-qubit interactive laboratory where Alice creates her digital signature payload.
**What to look for:**
- **3D Bloch Sphere:** Watch the state vector $|\\psi\\rangle$ dynamically update as you apply quantum logic gates (Hadamard, X, Z).
- **Dirac Ket Notation:** Observe the complex probability amplitudes ($\\alpha$ and $\\beta$) and how they satisfy normalization ($|\\alpha|^2 + |\\beta|^2 = 1$).
- **Histogram Chart:** Run simulated projective measurements to see the empirical probability distributions of collapsing into $|0\\rangle$ or $|1\\rangle$.
**How to use:** Use the preset buttons (e.g., $|+\\rangle$, $|-i\\rangle$) or apply sequential quantum gates to engineer the exact quantum state you want to use as your signature.

### 3. Bell State Generator
**What it is:** The engine that generates maximally entangled EPR (Einstein-Podolsky-Rosen) pairs, which act as the communication channel between Alice and Bob.
**What to look for:**
- **Spatial Entanglement Distribution:** Visualizes the non-local connection between Alice's and Bob's separated qubits.
- **CHSH Bell Inequality:** Verifies that the generated states violate classical local hidden variable bounds ($S = 2\\sqrt{2}$).
- **State Vector & Circuit:** Displays the computational basis amplitudes and generation circuits for the four canonical Bell states ($\\Phi^\\pm$, $\\Psi^\\pm$).
**How to use:** Select one of the four Bell states to act as the entangled resource bridging the teleportation channel.

### 4. Teleportation Pipeline
**What it is:** The core protocol (Bennett et al., 1993) executing the transfer of the signature state from Alice to Bob without physically moving the payload particle.
**What to look for:**
- **9-Step Interactive Pipeline:** An end-to-end flow from State Preparation to Fidelity Verification. 
- **Live State Inspection:** Click on any node in the pipeline to reveal the mathematical formalism, live telemetry, and purpose of that specific stage.
**How to use:** Step through the pipeline sequentially to understand how the signature payload is entangled with the channel, measured in the Bell basis, and reconstructed by Bob using classical syndrome bits.

### 5. Signature Verification
**What it is:** The culmination of the teleportation protocol where Bob checks if the received signature matches the expected payload.
**What to look for:**
- **Quantum Fidelity Score:** Represents the overlap $|\\langle\\psi_{original}|\\psi_{received}\\rangle|^2$. A score of 100% means the signature is perfectly verified.
- **Side-by-Side Bloch Spheres:** Visually compares Alice's original signature state with Bob's reconstructed state.
**How to use:** Use this tab to mathematically prove the integrity of the signature transfer.

### 6. Threat Detection & QBER
**What it is:** The security analysis engine monitoring the quantum channel for eavesdroppers (Eve).
**What to look for:**
- **QBER Gauge (Quantum Bit Error Rate):** Tracks the error percentage across the channel.
- **Mutually Unbiased Bases (MUB) Analyzer:** Detects eavesdroppers by comparing expected vs. observed measurement probabilities across non-commuting Z, X, and Y bases.
- **Decoy-State PNS Analysis:** Checks for multi-photon splitting attacks by comparing the attenuation ratios of signal vs. decoy pulses.
**How to use:** Adjust the statistical security threshold (e.g., 5% or 11%). If QBER exceeds this threshold, the channel is deemed compromised.

### 7. Adversarial Red Team
**What it is:** A sandbox for executing active attacks against the teleportation channel.
**What to look for:**
- **Attack Scenarios:** Choose from Intercept-Resend, Entanglement Forgery, or Ambient Decoherence.
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
