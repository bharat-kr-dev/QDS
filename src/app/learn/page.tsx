'use client';

import React, { useState } from 'react';
import {
  IconLearn,
  IconInfo,
  IconChevronRight,
} from '../../components/icons/Icons';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

interface TheoryTopic {
  id: string;
  title: string;
  category: 'foundations' | 'teleportation' | 'cryptography' | 'threats';
  simpleExplanation: string;
  equation: string;
  example: string;
  whyItMatters: string;
}

const THEORY_TOPICS: TheoryTopic[] = [
  {
    id: 'qubit',
    title: '1. The Qubit',
    category: 'foundations',
    simpleExplanation:
      'The fundamental unit of quantum information. While a classical bit is strictly 0 or 1, a qubit exists in a two-dimensional complex Hilbert space.',
    equation: '|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle, \\quad |\\alpha|^2 + |\\beta|^2 = 1',
    example: 'A photon’s horizontal/vertical polarization or an electron’s spin up/down.',
    whyItMatters: 'Forms the basic building block of our digital signature state payload.',
  },
  {
    id: 'superposition',
    title: '2. Quantum Superposition',
    category: 'foundations',
    simpleExplanation:
      'The linear combination of basis states simultaneously before observation occurs.',
    equation: 'c_0|0\\rangle + c_1|1\\rangle \\in \\mathcal{H}_2',
    example: 'Equal superposition state |+⟩ = (|0⟩ + |1⟩)/√2 gives a 50/50 chance for 0 or 1.',
    whyItMatters: 'Enables quantum states to encode secret phase information that cannot be read non-destructively.',
  },
  {
    id: 'measurement',
    title: '3. Projective Measurement',
    category: 'foundations',
    simpleExplanation:
      'The irreversible physical process where a quantum state collapses onto one of the eigenstates of the measurement operator.',
    equation: 'M_m = |m\\rangle\\langle m|, \\quad \\sum_m M_m^\\dagger M_m = I',
    example: 'Measuring |+⟩ in the computational Z-basis forces it into either |0⟩ or |1⟩.',
    whyItMatters: 'Explains why measuring Alice’s qubits collapses the teleportation system and generates classical bits.',
  },
  {
    id: 'born_rule',
    title: '4. The Born Rule',
    category: 'foundations',
    simpleExplanation:
      'The foundational postulate stating that the probability of measuring an eigenvalue is the absolute square of the probability amplitude.',
    equation: 'P(m) = |\\langle m|\\psi\\rangle|^2 = \\text{Tr}(M_m \\rho)',
    example: 'If α = √3/2, then P(|0⟩) = (√3/2)² = 75%.',
    whyItMatters: 'Governs all shot-count statistics and empirical histogram distributions in our simulator.',
  },
  {
    id: 'entanglement',
    title: '5. Quantum Entanglement',
    category: 'foundations',
    simpleExplanation:
      'A quantum mechanical phenomenon where two or more particles share an inseparable joint wavefunction, such that the state of one cannot be described independently of the other.',
    equation: '|\\psi_{AB}\\rangle \\neq |\\psi_A\\rangle \\otimes |\\psi_B\\rangle',
    example: 'Measuring one half of an EPR pair instantly defines the potential measurement outcome of the other.',
    whyItMatters: 'The non-local resource that bridges Alice and Bob across space without transmitting the physical qubit.',
  },
  {
    id: 'bell_states',
    title: '6. The Four Bell States',
    category: 'teleportation',
    simpleExplanation:
      'The four maximally entangled orthonormal basis states of two qubits spanning the 4D Hilbert space.',
    equation: '|\\Phi^\\pm\\rangle = \\frac{|00\\rangle \\pm |11\\rangle}{\\sqrt{2}}, \\quad |\\Psi^\\pm\\rangle = \\frac{|01\\rangle \\pm |10\\rangle}{\\sqrt{2}}',
    example: '|Φ⁺⟩ has perfect 100% correlation in both Z and X bases.',
    whyItMatters: 'Selected as the quantum EPR resource link during step 2 of our protocol.',
  },
  {
    id: 'pauli_operators',
    title: '7. Pauli Operators (I, X, Y, Z)',
    category: 'teleportation',
    simpleExplanation:
      'A set of three 2x2 complex Hermitian and unitary matrices that form a basis for single-qubit operators.',
    equation: 'X = \\begin{pmatrix}0&1\\\\1&0\\end{pmatrix}, \\quad Y = \\begin{pmatrix}0&-i\\\\i&0\\end{pmatrix}, \\quad Z = \\begin{pmatrix}1&0\\\\0&-1\\end{pmatrix}',
    example: 'X flips bit amplitudes (|0⟩ ↔ |1⟩); Z flips relative phase (|+⟩ ↔ |-⟩).',
    whyItMatters: 'Bob uses Pauli operators in step 7 to undo the syndrome rotation and restore Alice’s exact signature state.',
  },
  {
    id: 'teleportation_protocol',
    title: '8. Quantum Teleportation Protocol',
    category: 'teleportation',
    simpleExplanation:
      'A protocol published by Bennett et al. (1993) to transmit an arbitrary quantum state using an entangled Bell pair and 2 classical bits.',
    equation: '|\\psi\\rangle_1 \\otimes |\\Phi^+\\rangle_{23} = \\frac{1}{2} \\sum_{i=0}^3 |\\beta_i\\rangle_{12} \\otimes (\\sigma_i |\\psi\\rangle)_3',
    example: 'Alice performs Bell measurement → sends 2 bits → Bob applies σ_i → Bob recovers |ψ⟩.',
    whyItMatters: 'The central engine of our entire signature distribution infrastructure.',
  },
  {
    id: 'no_cloning',
    title: '9. No-Cloning Theorem',
    category: 'cryptography',
    simpleExplanation:
      'Wootters, Zurek, and Dieks (1982) proved that an unknown quantum state cannot be copied perfectly by any unitary transformation.',
    equation: 'U(|\\psi\\rangle|e\\rangle) \\neq |\\psi\\rangle|\\psi\\rangle \\quad \\forall |\\psi\\rangle',
    example: 'An eavesdropper cannot tap an optical fiber, copy the quantum signature, and send a duplicate.',
    whyItMatters: 'Guarantees that a forged or stolen quantum signature cannot be duplicated without detection.',
  },
  {
    id: 'mub',
    title: '10. Mutually Unbiased Bases (MUB)',
    category: 'cryptography',
    simpleExplanation:
      'Orthonormal bases where knowing the state in one basis gives completely uniform probability (1/d) across states in the other bases.',
    equation: '|\\langle \\psi_i^{(A)} | \\psi_j^{(B)} \\rangle|^2 = \\frac{1}{2} \\quad (d=2)',
    example: 'Measuring Z-basis eigenstate |0⟩ in the X-basis yields |+⟩ or |-⟩ with equal 50% probability.',
    whyItMatters: 'Enables the Threat Detection Engine to catch eavesdroppers measuring in unauthorized bases.',
  },
  {
    id: 'qber',
    title: '11. Quantum Bit Error Rate (QBER)',
    category: 'cryptography',
    simpleExplanation:
      'The statistical ratio of erroneous bits received to total compared test bits across the quantum transmission link.',
    equation: '\\text{QBER} = \\frac{N_{\\text{errors}}}{N_{\\text{total}}}',
    example: 'Comparing 1,000 bits with 32 mismatches gives QBER = 3.2%.',
    whyItMatters: 'The primary numerical metric evaluated against safety thresholds (e.g. 5.0%).',
  },
  {
    id: 'decoy_states',
    title: '12. Decoy-State Protocol',
    category: 'cryptography',
    simpleExplanation:
      'A security enhancement developed by Hwang, Lo, Ma, and Wang where Alice randomly intersperses weak decoy pulses with signal pulses.',
    equation: 'Y_n(\\mu) = Y_n(\\nu), \\quad Q_\\mu = \\sum_n Y_n \\frac{\\mu^n e^{-\\mu}}{n!}',
    example: 'Decoy pulses expose multi-photon beam splitting attacks.',
    whyItMatters: 'Prevents Photon Number Splitting (PNS) attacks on practical weak laser sources.',
  },
  {
    id: 'quantum_noise',
    title: '13. Quantum Noise & Decoherence',
    category: 'threats',
    simpleExplanation:
      'The loss of quantum coherence caused by unwanted environmental coupling, thermal fluctuations, and fiber birefringence.',
    equation: '\\rho(t) = \\sum_k E_k \\rho(0) E_k^\\dagger, \\quad \\sum_k E_k^\\dagger E_k = I',
    example: 'Optical fiber thermal expansion introduces stochastic phase drift θ.',
    whyItMatters: 'Demonstrates why we differentiate ambient channel noise from deliberate active tampering.',
  },
  {
    id: 'intercept_resend',
    title: '14. Intercept-Resend Attack',
    category: 'threats',
    simpleExplanation:
      'An adversary (Eve) measures each in-flight qubit in a chosen basis and sends a newly prepared eigenstate to Bob.',
    equation: '\\text{Eavesdropping QBER} = \\frac{1}{2} \\times \\frac{1}{2} = 25\\% \\quad (\\text{in conjugate bases})',
    example: 'Eve measures in Z while Alice sent in X → collapses state → 25% errors induced.',
    whyItMatters: 'Simulated in our Red Team lab to prove how wavefunction collapse inevitably betrays eavesdroppers.',
  },
  {
    id: 'qds_framework',
    title: '15. Quantum Digital Signatures (QDS)',
    category: 'cryptography',
    simpleExplanation:
      'A cryptographic scheme providing non-repudiation, authentication, and integrity guarantees rooted in the laws of quantum physics rather than computational difficulty.',
    equation: '\\text{Security} = 1 - \\mathcal{O}(2^{-n})',
    example: 'Alice signs a message using teleported quantum states; Bob and Charlie can verify authenticity without forgery.',
    whyItMatters: 'The overarching product purpose and mission of this entire platform.',
  },
];

export default function LearnPage() {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('teleportation_protocol');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredTopics = THEORY_TOPICS.filter(
    (t) => categoryFilter === 'all' || t.category === categoryFilter
  );

  const selectedTopic = THEORY_TOPICS.find((t) => t.id === selectedTopicId) || THEORY_TOPICS[0];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 border border-quantum bg-quantum-tint text-[10px] font-mono font-bold text-quantum uppercase tracking-wider mb-2">
            <IconLearn size={12} />
            15 Interactive Quantum & Cryptographic Modules
          </div>
          <h1 className="text-xl lg:text-2xl font-bold text-ink tracking-tight uppercase font-sans">
            Theory & Learning Knowledge Base
          </h1>
          <p className="text-xs text-ink-muted mt-1 font-medium">
            Learn the foundational physics, mathematical formalisms, and security proofs behind teleportation-based QDS.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider">
          {[
            { id: 'all', label: 'All Topics' },
            { id: 'foundations', label: 'Physics' },
            { id: 'teleportation', label: 'Teleportation' },
            { id: 'cryptography', label: 'QDS Crypto' },
            { id: 'threats', label: 'Attacks' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 border transition-colors cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-quantum border-quantum text-white'
                  : 'bg-face border-rule text-ink hover:bg-well'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Topic Index & Detailed Interactive Lesson */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Topic List */}
        <div className="lg:col-span-4 panel p-4 space-y-2 max-h-[680px] overflow-y-auto">
          <div className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider px-2 py-1 border-b border-rule pb-2">
            Topic Curriculum ({filteredTopics.length})
          </div>

          <div className="space-y-1 pt-2">
            {filteredTopics.map((topic) => {
              const isSelected = topic.id === selectedTopicId;

              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`w-full p-3 text-left flex items-center justify-between transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-quantum-tint border-quantum text-quantum font-bold'
                      : 'bg-face border-transparent hover:border-rule text-ink hover:bg-well'
                  }`}
                >
                  <span className="text-xs truncate uppercase tracking-wider font-bold">{topic.title}</span>
                  <IconChevronRight
                    size={14}
                    className={isSelected ? 'text-quantum' : 'text-ink-muted'}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Topic View with Progressive Disclosure */}
        <div className="lg:col-span-8 panel p-6 space-y-6">
          <div className="space-y-1 border-b border-rule pb-4">
            <div className="text-[10px] font-mono font-bold text-quantum uppercase tracking-wider">
              Selected Curriculum Module
            </div>
            <h2 className="text-xl font-bold text-ink uppercase tracking-wider font-sans">{selectedTopic.title}</h2>
          </div>

          {/* 1. Simple Plain-English Explanation */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider">
              1. Intuitive Explanation
            </span>
            <div className="bg-well border border-rule p-4 text-xs sm:text-sm text-ink font-medium leading-relaxed">
              {selectedTopic.simpleExplanation}
            </div>
          </div>

          {/* 2. Mathematical Formalism */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider">
              2. Mathematical Representation
            </span>
            <div className="bg-face border border-rule p-4 font-mono text-sm sm:text-base font-bold text-quantum overflow-x-auto text-center">
              <BlockMath math={selectedTopic.equation} />
            </div>
          </div>

          {/* 3. Concrete Physical Example */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-ink-muted uppercase tracking-wider">
              3. Physical / Real-World Example
            </span>
            <div className="bg-well border border-rule p-4 text-xs text-ink font-medium">
              {selectedTopic.example}
            </div>
          </div>

          {/* 4. Why it matters in this simulator */}
          <div className="bg-pass-tint border border-pass p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-pass font-bold font-mono uppercase tracking-wider text-[10px]">
              <IconInfo size={14} />
              Why It Matters in This Simulator:
            </div>
            <p className="text-ink font-medium leading-relaxed">{selectedTopic.whyItMatters}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
