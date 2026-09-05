package com.example.data.model

import com.example.data.local.ChapterEntity
import com.example.data.local.TodoEntity

data class FormulaItem(
    val id: Int,
    val subject: String, // Physics, Chemistry, Mathematics
    val topic: String,
    val title: String,
    val formula: String,
    val keyTerms: String,
    val applicationTip: String
)

data class RoutineTemplate(
    val title: String,
    val description: String,
    val tasks: List<String>
)

object JEEData {
    val hardQuotes = listOf(
        "Sleepless nights today, IIT Bombay tomorrow.",
        "Either you run the day, or JEE runs you. Solve one more PYQ.",
        "Pain of discipline is far lighter than the pain of regret on result day.",
        "Your competition is solving 50 problems while you are scrolling. Lock in.",
        "AIR 1 isn't a miracle; it's a thousand hours of unseen sacrifice.",
        "Turn doubts into derivations, and stress into speed."
    )

    fun getInitialChapters(): List<ChapterEntity> {
        val list = mutableListOf<ChapterEntity>()
        var idCounter = 1

        // --- PHYSICS CLASS 11 ---
        val p11 = listOf(
            Pair("Units and Measurements", "Core"),
            Pair("Kinematics: 1D & 2D Motion", "High"),
            Pair("Laws of Motion & Friction", "High"),
            Pair("Work, Energy and Power", "High"),
            Pair("Center of Mass & Collisions", "High"),
            Pair("Rotational Dynamics", "High"),
            Pair("Gravitation", "Medium"),
            Pair("Mechanical Properties of Solids & Fluids", "Medium"),
            Pair("Thermal Properties of Matter", "Medium"),
            Pair("Thermodynamics & Heat Engines", "High"),
            Pair("Kinetic Theory of Gases (KTG)", "Medium"),
            Pair("Simple Harmonic Motion (SHM)", "High"),
            Pair("Waves & Sound (Doppler Effect)", "High")
        )
        p11.forEach { (name, weightage) ->
            list.add(ChapterEntity(id = idCounter++, subject = "Physics", classGrade = "Class 11", name = name, weightage = weightage))
        }

        // --- PHYSICS CLASS 12 ---
        val p12 = listOf(
            Pair("Electrostatics & Gauss's Law", "High"),
            Pair("Capacitance & Dielectrics", "High"),
            Pair("Current Electricity & Circuits", "High"),
            Pair("Magnetic Effects of Current", "High"),
            Pair("Magnetism & Matter", "Medium"),
            Pair("Electromagnetic Induction (EMI)", "High"),
            Pair("Alternating Current (AC & LCR)", "High"),
            Pair("Electromagnetic Waves", "Medium"),
            Pair("Ray Optics & Optical Instruments", "High"),
            Pair("Wave Optics & Interference", "High"),
            Pair("Dual Nature & Photoelectric Effect", "High"),
            Pair("Atomic Structure & Bohr Model", "High"),
            Pair("Nuclear Physics & Radioactivity", "High"),
            Pair("Semiconductors & Logic Gates", "High")
        )
        p12.forEach { (name, weightage) ->
            list.add(ChapterEntity(id = idCounter++, subject = "Physics", classGrade = "Class 12", name = name, weightage = weightage))
        }

        // --- CHEMISTRY CLASS 11 ---
        val c11 = listOf(
            Pair("Mole Concept & Stoichiometry", "High"),
            Pair("Atomic Structure & Quantum Numbers", "High"),
            Pair("Periodic Table & Periodicity", "High"),
            Pair("Chemical Bonding & Molecular Structure", "High"),
            Pair("Chemical Thermodynamics & Thermochemistry", "High"),
            Pair("Chemical Equilibrium & Le Chatelier", "High"),
            Pair("Ionic Equilibrium (pH & Buffer)", "High"),
            Pair("Redox Reactions", "Medium"),
            Pair("General Organic Chemistry (GOC)", "High"),
            Pair("Hydrocarbons (Alkanes, Alkenes, Alkynes, Aromatic)", "High")
        )
        c11.forEach { (name, weightage) ->
            list.add(ChapterEntity(id = idCounter++, subject = "Chemistry", classGrade = "Class 11", name = name, weightage = weightage))
        }

        // --- CHEMISTRY CLASS 12 ---
        val c12 = listOf(
            Pair("Solutions & Colligative Properties", "High"),
            Pair("Electrochemistry & Nernst Equation", "High"),
            Pair("Chemical Kinetics & Rate Laws", "High"),
            Pair("d- and f-Block Elements", "Medium"),
            Pair("Coordination Compounds & CFT", "High"),
            Pair("Haloalkanes and Haloarenes (SN1/SN2)", "High"),
            Pair("Alcohols, Phenols and Ethers", "High"),
            Pair("Aldehydes, Ketones & Carboxylic Acids", "High"),
            Pair("Amines & Diazonium Salts", "High"),
            Pair("Biomolecules & Polymers", "Medium")
        )
        c12.forEach { (name, weightage) ->
            list.add(ChapterEntity(id = idCounter++, subject = "Chemistry", classGrade = "Class 12", name = name, weightage = weightage))
        }

        // --- MATHEMATICS CLASS 11 ---
        val m11 = listOf(
            Pair("Sets, Relations & Functions", "High"),
            Pair("Trigonometric Functions & Identities", "High"),
            Pair("Complex Numbers & Argand Plane", "High"),
            Pair("Quadratic Equations & Roots", "High"),
            Pair("Permutations and Combinations (P&C)", "High"),
            Pair("Binomial Theorem & Expansions", "High"),
            Pair("Sequences & Series (AP, GP, AGP)", "High"),
            Pair("Straight Lines & Pair of Lines", "High"),
            Pair("Circles & System of Circles", "High"),
            Pair("Parabola, Ellipse & Hyperbola", "High"),
            Pair("Introduction to 3D Coordinates", "Medium"),
            Pair("Limits and Derivatives Basics", "High"),
            Pair("Probability Basics", "Medium")
        )
        m11.forEach { (name, weightage) ->
            list.add(ChapterEntity(id = idCounter++, subject = "Mathematics", classGrade = "Class 11", name = name, weightage = weightage))
        }

        // --- MATHEMATICS CLASS 12 ---
        val m12 = listOf(
            Pair("Functions, Domain & Range", "High"),
            Pair("Inverse Trigonometric Functions (ITF)", "High"),
            Pair("Matrices and Determinants", "High"),
            Pair("Continuity & Differentiability", "High"),
            Pair("Application of Derivatives (AOD & Max-Min)", "High"),
            Pair("Indefinite Integration & Techniques", "High"),
            Pair("Definite Integrals & Properties", "High"),
            Pair("Area Under Curves (AUC)", "High"),
            Pair("Differential Equations", "High"),
            Pair("Vector Algebra", "High"),
            Pair("Three Dimensional Geometry (Lines & Planes)", "High"),
            Pair("Probability (Bayes' Theorem & Distributions)", "High")
        )
        m12.forEach { (name, weightage) ->
            list.add(ChapterEntity(id = idCounter++, subject = "Mathematics", classGrade = "Class 12", name = name, weightage = weightage))
        }

        return list
    }

    val initialFormulas: List<FormulaItem> = emptyList()

    val routineTemplates = listOf(
        RoutineTemplate(
            title = "Daily 12-Hour JEE Drill",
            description = "Standard balanced routine recommended by top rankers for intensive prep.",
            tasks = listOf(
                "Solve 25 Physics Mechanics & Modern PYQs",
                "Organic Chemistry Reaction Mechanisms Revision",
                "Solve 30 Math Calculus & Vector Problems",
                "Evening 1-hour Error Book Review & Corrections",
                "Revise Key Formulas before sleeping"
            )
        ),
        RoutineTemplate(
            title = "Full Mock Test & Analysis Day",
            description = "Timed 3-hour exam simulation followed by deep post-mortem analysis.",
            tasks = listOf(
                "Write 3-Hour Proctored Full JEE Mock (9 AM - 12 PM)",
                "Calculate Score & Mark Mistake Types in Error Book",
                "Re-solve all Unattempted and Incorrect Questions",
                "Revise weak chapters identified from test analytics"
            )
        ),
        RoutineTemplate(
            title = "Formula & Speed Booster",
            description = "High-speed mental problem solving and formula sheets blitz.",
            tasks = listOf(
                "Physics Formula Sheet Active Recall (30 mins)",
                "Chemistry Named Reactions & Reagents Flash drill",
                "Math Identity & Series sum calculations",
                "Speed Practice: 20 Questions in 30 minutes timed sprint"
            )
        ),
        RoutineTemplate(
            title = "Backlog Clearance Sprint",
            description = "Dedicated routine to clear high-weightage pending backlog topics.",
            tasks = listOf(
                "Watch/Read 1 Core Concept Lecture of backlog topic",
                "Write personal one-page cheat sheet for the topic",
                "Solve 15 Level-1 conceptual problems",
                "Solve 10 Previous Year Questions (2021-2024)"
            )
        )
    )

    val initialTodos = listOf(
        TodoEntity(id = 1, title = "Revise Rotational Motion PYQs (2020-2024)", subject = "Physics", priority = "High", isCompleted = false, dateCreated = "2026-09-03"),
        TodoEntity(id = 2, title = "Solve 20 Coordinate Geometry & Conics problems", subject = "Math", priority = "High", isCompleted = false, dateCreated = "2026-09-03"),
        TodoEntity(id = 3, title = "Complete Coordination Compounds CFT notes", subject = "Chemistry", priority = "Medium", isCompleted = false, dateCreated = "2026-09-03"),
        TodoEntity(id = 4, title = "Log mistake analysis from Sunday's Mock Test", subject = "Revision", priority = "High", isCompleted = false, dateCreated = "2026-09-03")
    )
}
