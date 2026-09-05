import { Chapter, Formula, RoutineTemplate, TodoItem, BacklogItem, ErrorLog } from '../types';

export const HARD_QUOTES = [
  "Sleepless nights today, IIT Bombay tomorrow.",
  "Either you run the day, or JEE runs you. Solve one more PYQ.",
  "Pain of discipline is far lighter than the pain of regret on result day.",
  "Your competition is solving 50 problems while you are scrolling. Lock in.",
  "AIR 1 isn't a miracle; it's a thousand hours of unseen sacrifice.",
  "Turn doubts into derivations, and stress into speed."
];

export const INITIAL_CHAPTERS: Chapter[] = [
  // --- PHYSICS CLASS 11 ---
  { id: 1, subject: 'Physics', classGrade: 'Class 11', name: 'Units and Measurements', weightage: 'Core', isCompleted: false },
  { id: 2, subject: 'Physics', classGrade: 'Class 11', name: 'Kinematics: 1D & 2D Motion', weightage: 'High', isCompleted: false },
  { id: 3, subject: 'Physics', classGrade: 'Class 11', name: 'Laws of Motion & Friction', weightage: 'High', isCompleted: false },
  { id: 4, subject: 'Physics', classGrade: 'Class 11', name: 'Work, Energy and Power', weightage: 'High', isCompleted: false },
  { id: 5, subject: 'Physics', classGrade: 'Class 11', name: 'Center of Mass & Collisions', weightage: 'High', isCompleted: false },
  { id: 6, subject: 'Physics', classGrade: 'Class 11', name: 'Rotational Dynamics', weightage: 'High', isCompleted: false },
  { id: 7, subject: 'Physics', classGrade: 'Class 11', name: 'Gravitation', weightage: 'Medium', isCompleted: false },
  { id: 8, subject: 'Physics', classGrade: 'Class 11', name: 'Mechanical Properties of Solids & Fluids', weightage: 'Medium', isCompleted: false },
  { id: 9, subject: 'Physics', classGrade: 'Class 11', name: 'Thermal Properties of Matter', weightage: 'Medium', isCompleted: false },
  { id: 10, subject: 'Physics', classGrade: 'Class 11', name: 'Thermodynamics & Heat Engines', weightage: 'High', isCompleted: false },
  { id: 11, subject: 'Physics', classGrade: 'Class 11', name: 'Kinetic Theory of Gases (KTG)', weightage: 'Medium', isCompleted: false },
  { id: 12, subject: 'Physics', classGrade: 'Class 11', name: 'Simple Harmonic Motion (SHM)', weightage: 'High', isCompleted: false },
  { id: 13, subject: 'Physics', classGrade: 'Class 11', name: 'Waves & Sound (Doppler Effect)', weightage: 'High', isCompleted: false },

  // --- PHYSICS CLASS 12 ---
  { id: 14, subject: 'Physics', classGrade: 'Class 12', name: 'Electrostatics & Gauss\'s Law', weightage: 'High', isCompleted: false },
  { id: 15, subject: 'Physics', classGrade: 'Class 12', name: 'Capacitance & Dielectrics', weightage: 'High', isCompleted: false },
  { id: 16, subject: 'Physics', classGrade: 'Class 12', name: 'Current Electricity & Circuits', weightage: 'High', isCompleted: false },
  { id: 17, subject: 'Physics', classGrade: 'Class 12', name: 'Magnetic Effects of Current', weightage: 'High', isCompleted: false },
  { id: 18, subject: 'Physics', classGrade: 'Class 12', name: 'Magnetism & Matter', weightage: 'Medium', isCompleted: false },
  { id: 19, subject: 'Physics', classGrade: 'Class 12', name: 'Electromagnetic Induction (EMI)', weightage: 'High', isCompleted: false },
  { id: 20, subject: 'Physics', classGrade: 'Class 12', name: 'Alternating Current (AC & LCR)', weightage: 'High', isCompleted: false },
  { id: 21, subject: 'Physics', classGrade: 'Class 12', name: 'Electromagnetic Waves', weightage: 'Medium', isCompleted: false },
  { id: 22, subject: 'Physics', classGrade: 'Class 12', name: 'Ray Optics & Optical Instruments', weightage: 'High', isCompleted: false },
  { id: 23, subject: 'Physics', classGrade: 'Class 12', name: 'Wave Optics & Interference', weightage: 'High', isCompleted: false },
  { id: 24, subject: 'Physics', classGrade: 'Class 12', name: 'Dual Nature & Photoelectric Effect', weightage: 'High', isCompleted: false },
  { id: 25, subject: 'Physics', classGrade: 'Class 12', name: 'Atomic Structure & Bohr Model', weightage: 'High', isCompleted: false },
  { id: 26, subject: 'Physics', classGrade: 'Class 12', name: 'Nuclear Physics & Radioactivity', weightage: 'High', isCompleted: false },
  { id: 27, subject: 'Physics', classGrade: 'Class 12', name: 'Semiconductors & Logic Gates', weightage: 'High', isCompleted: false },

  // --- CHEMISTRY CLASS 11 ---
  { id: 28, subject: 'Chemistry', classGrade: 'Class 11', name: 'Mole Concept & Stoichiometry', weightage: 'High', isCompleted: false },
  { id: 29, subject: 'Chemistry', classGrade: 'Class 11', name: 'Atomic Structure & Quantum Numbers', weightage: 'High', isCompleted: false },
  { id: 30, subject: 'Chemistry', classGrade: 'Class 11', name: 'Periodic Table & Periodicity', weightage: 'High', isCompleted: false },
  { id: 31, subject: 'Chemistry', classGrade: 'Class 11', name: 'Chemical Bonding & Molecular Structure', weightage: 'High', isCompleted: false },
  { id: 32, subject: 'Chemistry', classGrade: 'Class 11', name: 'Chemical Thermodynamics & Thermochemistry', weightage: 'High', isCompleted: false },
  { id: 33, subject: 'Chemistry', classGrade: 'Class 11', name: 'Chemical Equilibrium & Le Chatelier', weightage: 'High', isCompleted: false },
  { id: 34, subject: 'Chemistry', classGrade: 'Class 11', name: 'Ionic Equilibrium (pH & Buffer)', weightage: 'High', isCompleted: false },
  { id: 35, subject: 'Chemistry', classGrade: 'Class 11', name: 'Redox Reactions', weightage: 'Medium', isCompleted: false },
  { id: 36, subject: 'Chemistry', classGrade: 'Class 11', name: 'General Organic Chemistry (GOC)', weightage: 'High', isCompleted: false },
  { id: 37, subject: 'Chemistry', classGrade: 'Class 11', name: 'Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)', weightage: 'High', isCompleted: false },

  // --- CHEMISTRY CLASS 12 ---
  { id: 38, subject: 'Chemistry', classGrade: 'Class 12', name: 'Solutions & Colligative Properties', weightage: 'High', isCompleted: false },
  { id: 39, subject: 'Chemistry', classGrade: 'Class 12', name: 'Electrochemistry & Nernst Equation', weightage: 'High', isCompleted: false },
  { id: 40, subject: 'Chemistry', classGrade: 'Class 12', name: 'Chemical Kinetics & Rate Laws', weightage: 'High', isCompleted: false },
  { id: 41, subject: 'Chemistry', classGrade: 'Class 12', name: 'd- and f-Block Elements', weightage: 'Medium', isCompleted: false },
  { id: 42, subject: 'Chemistry', classGrade: 'Class 12', name: 'Coordination Compounds & CFT', weightage: 'High', isCompleted: false },
  { id: 43, subject: 'Chemistry', classGrade: 'Class 12', name: 'Haloalkanes and Haloarenes (SN1/SN2)', weightage: 'High', isCompleted: false },
  { id: 44, subject: 'Chemistry', classGrade: 'Class 12', name: 'Alcohols, Phenols and Ethers', weightage: 'High', isCompleted: false },
  { id: 45, subject: 'Chemistry', classGrade: 'Class 12', name: 'Aldehydes, Ketones & Carboxylic Acids', weightage: 'High', isCompleted: false },
  { id: 46, subject: 'Chemistry', classGrade: 'Class 12', name: 'Amines & Diazonium Salts', weightage: 'High', isCompleted: false },
  { id: 47, subject: 'Chemistry', classGrade: 'Class 12', name: 'Biomolecules & Polymers', weightage: 'Medium', isCompleted: false },

  // --- MATHEMATICS CLASS 11 ---
  { id: 48, subject: 'Mathematics', classGrade: 'Class 11', name: 'Sets, Relations & Functions', weightage: 'High', isCompleted: false },
  { id: 49, subject: 'Mathematics', classGrade: 'Class 11', name: 'Trigonometric Functions & Identities', weightage: 'High', isCompleted: false },
  { id: 50, subject: 'Mathematics', classGrade: 'Class 11', name: 'Complex Numbers & Argand Plane', weightage: 'High', isCompleted: false },
  { id: 51, subject: 'Mathematics', classGrade: 'Class 11', name: 'Quadratic Equations & Roots', weightage: 'High', isCompleted: false },
  { id: 52, subject: 'Mathematics', classGrade: 'Class 11', name: 'Permutations and Combinations (P&C)', weightage: 'High', isCompleted: false },
  { id: 53, subject: 'Mathematics', classGrade: 'Class 11', name: 'Binomial Theorem & Expansions', weightage: 'High', isCompleted: false },
  { id: 54, subject: 'Mathematics', classGrade: 'Class 11', name: 'Sequences & Series (AP, GP, AGP)', weightage: 'High', isCompleted: false },
  { id: 55, subject: 'Mathematics', classGrade: 'Class 11', name: 'Straight Lines & Pair of Lines', weightage: 'High', isCompleted: false },
  { id: 56, subject: 'Mathematics', classGrade: 'Class 11', name: 'Circles & System of Circles', weightage: 'High', isCompleted: false },
  { id: 57, subject: 'Mathematics', classGrade: 'Class 11', name: 'Parabola, Ellipse & Hyperbola', weightage: 'High', isCompleted: false },
  { id: 58, subject: 'Mathematics', classGrade: 'Class 11', name: 'Introduction to 3D Coordinates', weightage: 'Medium', isCompleted: false },
  { id: 59, subject: 'Mathematics', classGrade: 'Class 11', name: 'Limits and Derivatives Basics', weightage: 'High', isCompleted: false },
  { id: 60, subject: 'Mathematics', classGrade: 'Class 11', name: 'Probability Basics', weightage: 'Medium', isCompleted: false },

  // --- MATHEMATICS CLASS 12 ---
  { id: 61, subject: 'Mathematics', classGrade: 'Class 12', name: 'Functions, Domain & Range', weightage: 'High', isCompleted: false },
  { id: 62, subject: 'Mathematics', classGrade: 'Class 12', name: 'Inverse Trigonometric Functions (ITF)', weightage: 'High', isCompleted: false },
  { id: 63, subject: 'Mathematics', classGrade: 'Class 12', name: 'Matrices and Determinants', weightage: 'High', isCompleted: false },
  { id: 64, subject: 'Mathematics', classGrade: 'Class 12', name: 'Continuity & Differentiability', weightage: 'High', isCompleted: false },
  { id: 65, subject: 'Mathematics', classGrade: 'Class 12', name: 'Application of Derivatives (AOD & Max-Min)', weightage: 'High', isCompleted: false },
  { id: 66, subject: 'Mathematics', classGrade: 'Class 12', name: 'Indefinite Integration & Techniques', weightage: 'High', isCompleted: false },
  { id: 67, subject: 'Mathematics', classGrade: 'Class 12', name: 'Definite Integrals & Properties', weightage: 'High', isCompleted: false },
  { id: 68, subject: 'Mathematics', classGrade: 'Class 12', name: 'Area Under Curves (AUC)', weightage: 'High', isCompleted: false },
  { id: 69, subject: 'Mathematics', classGrade: 'Class 12', name: 'Differential Equations', weightage: 'High', isCompleted: false },
  { id: 70, subject: 'Mathematics', classGrade: 'Class 12', name: 'Vector Algebra', weightage: 'High', isCompleted: false },
  { id: 71, subject: 'Mathematics', classGrade: 'Class 12', name: 'Three Dimensional Geometry (Lines & Planes)', weightage: 'High', isCompleted: false },
  { id: 72, subject: 'Mathematics', classGrade: 'Class 12', name: 'Probability (Bayes\' Theorem & Distributions)', weightage: 'High', isCompleted: false }
];

export const INITIAL_FORMULAS: Formula[] = [
  {
    id: 'f1',
    title: 'Rolling Without Slipping (Inclined Plane)',
    subject: 'Physics',
    chapter: 'Rotational Dynamics',
    formulaText: 'a = (g · sin θ) / (1 + I_cm / (M · R²))',
    keyTerms: 'I_cm: Moment of Inertia, θ: Incline angle, a: linear acceleration',
    applicationTip: 'Check whether rolling is pure or slipping occurs (friction f ≤ μN).'
  },
  {
    id: 'f2',
    title: 'LCR Series Resonance & Quality Factor',
    subject: 'Physics',
    chapter: 'Alternating Current',
    formulaText: 'ω₀ = 1 / √(LC),   Q = (1 / R) · √(L / C)',
    keyTerms: 'Z_min = R at resonance, current amplitude is maximal',
    applicationTip: 'Bandwidth Δω = ω₀ / Q = R / L.'
  },
  {
    id: 'f3',
    title: 'Nernst Equation for Electrochemical Cell',
    subject: 'Chemistry',
    chapter: 'Electrochemistry',
    formulaText: 'E_cell = E°_cell - (0.0591 / n) · log₁₀(Q)  at 298 K',
    keyTerms: 'n: electrons transferred, Q: reaction quotient [Products]/[Reactants]',
    applicationTip: 'At equilibrium, E_cell = 0 and Q = K_eq, so E°_cell = (0.0591 / n) log₁₀(K_eq).'
  },
  {
    id: 'f4',
    title: 'Claisen-Schmidt & Aldol Condensation',
    subject: 'Chemistry',
    chapter: 'Aldehydes, Ketones & Carboxylic Acids',
    formulaText: 'R-CH₂-CHO + R\'-CHO —(dil. NaOH)→ β-hydroxyaldehyde —(Δ)→ α,β-unsaturated aldehyde + H₂O',
    keyTerms: 'Requires α-hydrogen for enolate formation; cross-aldol controlled by enolizable component',
    applicationTip: 'Heating causes irreversible E1cB dehydration to conjugate with C=O.'
  },
  {
    id: 'f5',
    title: 'Shortest Distance Between Skew Lines',
    subject: 'Mathematics',
    chapter: 'Three Dimensional Geometry',
    formulaText: 'd = | (a₂ - a₁) · (b₁ × b₂) | / | b₁ × b₂ |',
    keyTerms: 'Lines: r = a₁ + λb₁  and  r = a₂ + μb₂',
    applicationTip: 'If d = 0, lines are intersecting and coplanar.'
  },
  {
    id: 'f6',
    title: 'Leibnitz Rule for Differentiation of Definite Integral',
    subject: 'Mathematics',
    chapter: 'Definite Integrals',
    formulaText: 'd/dx ∫[u(x) to v(x)] f(t) dt = f(v(x))·v\'(x) - f(u(x))·u\'(x)',
    keyTerms: 'Used extensively in 0/0 L\'Hopital limits in JEE Advanced calculus problems',
    applicationTip: 'Always differentiate upper limit multiplied by integrand, minus lower limit equivalent.'
  }
];

export const INITIAL_TODOS: TodoItem[] = [];

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    title: 'Daily 12-Hour JEE Drill',
    description: 'Standard balanced routine recommended by top rankers for intensive prep.',
    tasks: [
      { title: 'Solve 25 Physics Mechanics & Modern PYQs', subject: 'Physics', priority: 'High' },
      { title: 'Organic Chemistry Reaction Mechanisms Revision', subject: 'Chemistry', priority: 'High' },
      { title: 'Solve 30 Math Calculus & Vector Problems', subject: 'Mathematics', priority: 'High' },
      { title: 'Evening 1-hour Error Book Review & Corrections', subject: 'General', priority: 'Medium' },
      { title: 'Revise Key Formulas before sleeping', subject: 'General', priority: 'Low' }
    ]
  },
  {
    title: 'Full Mock Test & Analysis Day',
    description: 'Timed 3-hour exam simulation followed by deep post-mortem analysis.',
    tasks: [
      { title: 'Write 3-Hour Proctored Full JEE Mock (9 AM - 12 PM)', subject: 'General', priority: 'High' },
      { title: 'Calculate Score & Mark Mistake Types in Error Book', subject: 'General', priority: 'High' },
      { title: 'Re-solve all Unattempted and Incorrect Questions', subject: 'General', priority: 'High' },
      { title: 'Revise weak chapters identified from test analytics', subject: 'General', priority: 'Medium' }
    ]
  },
  {
    title: 'Formula & Speed Booster',
    description: 'High-speed mental problem solving and formula sheets blitz.',
    tasks: [
      { title: 'Physics Formula Sheet Active Recall (30 mins)', subject: 'Physics', priority: 'High' },
      { title: 'Chemistry Named Reactions & Reagents Flash drill', subject: 'Chemistry', priority: 'High' },
      { title: 'Math Identity & Series sum calculations', subject: 'Mathematics', priority: 'High' },
      { title: 'Speed Practice: 20 Questions in 30 minutes timed sprint', subject: 'General', priority: 'Medium' }
    ]
  },
  {
    title: 'Backlog Clearance Sprint',
    description: 'Dedicated routine to clear high-weightage pending backlog topics.',
    tasks: [
      { title: 'Watch/Read 1 Core Concept Lecture of backlog topic', subject: 'General', priority: 'High' },
      { title: 'Write personal one-page cheat sheet for the topic', subject: 'General', priority: 'High' },
      { title: 'Solve 15 Level-1 conceptual problems', subject: 'General', priority: 'Medium' },
      { title: 'Solve 10 Previous Year Questions (2021-2024)', subject: 'General', priority: 'High' }
    ]
  }
];

export const INITIAL_BACKLOGS: BacklogItem[] = [];

export const INITIAL_ERRORS: ErrorLog[] = [];

