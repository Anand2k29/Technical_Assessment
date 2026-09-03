"""Curated DEMO MODE sample material (labeled as such everywhere it's used --
see /api/system/status and the "Based on sample material" badge in the UI).
Lets the golden-path demo (upload -> teach -> misconception -> adapt ->
assess) run deterministically without depending on an external LLM key,
per the product spec's "Demo Mode" requirement. User-uploaded documents
never touch this file; they go through the real dynamic RAG pipeline."""

OHMS_LAW = {
    "id": "sample_ohms_law",
    "title": "Ohm's Law",
    "topic": "Ohm's Law",
    "chapters": [
        {
            "chapter": "Chapter 4: Electricity Basics",
            "section": "4.2 Ohm's Law",
            "text": (
                "Ohm's Law describes the relationship between voltage, current, and resistance in an "
                "electrical circuit: I = V / R, where I is current, V is voltage, and R is resistance. "
                "If voltage stays constant and resistance increases, current decreases, because a larger "
                "resistance restricts the flow of charge more. You can think of voltage like water pressure, "
                "current like the rate of water flow, and resistance like the narrowness of the pipe: a "
                "narrower pipe (higher resistance) lets less water through per second (lower current) for "
                "the same pressure (voltage)."
            ),
        },
    ],
    "concepts": [
        {
            "name": "voltage",
            "description": "The electrical pressure that pushes current through a circuit.",
        },
        {
            "name": "resistance",
            "description": "How much a component restricts the flow of current.",
        },
        {
            "name": "ohm's law",
            "description": "The relationship I = V / R linking current, voltage, and resistance.",
        },
    ],
    # Each question can map specific wrong options to a labeled misconception,
    # so the Misconception Engine can work with real pedagogy even in demo mode.
    "questions": [
        {
            "concept": "ohm's law",
            "type": "mcq",
            "difficulty": "beginner",
            "text": "If voltage stays constant and resistance increases, what happens to current?",
            "options": ["Current decreases", "Current increases", "Current stays the same", "Voltage decreases"],
            "correct_answer": "Current decreases",
            "misconception_map": {
                "Current increases": {
                    "label": "inverse_relationship_confusion",
                    "description": "Treats current as increasing WITH resistance instead of inversely with it.",
                    "severity": "medium",
                    "strategy": "analogy",
                    "reexplain": (
                        "Let's slow down. Picture water flowing through a pipe: voltage is the pressure pushing "
                        "the water, and resistance is how narrow the pipe is. If you squeeze the pipe narrower "
                        "(more resistance) but push with the same pressure (same voltage), LESS water gets through "
                        "per second — so current goes DOWN, not up."
                    ),
                },
                "Current stays the same": {
                    "label": "resistance_has_no_effect",
                    "description": "Doesn't yet see resistance as a factor that changes current.",
                    "severity": "medium",
                    "strategy": "step_by_step",
                    "reexplain": (
                        "Let's use the formula directly: I = V / R. If V stays the same but R gets bigger, "
                        "you're dividing the same number by a bigger number — the result (I) must get smaller."
                    ),
                },
                "Voltage decreases": {
                    "label": "conflates_voltage_and_current",
                    "description": "Confuses which quantity the question is asking about.",
                    "severity": "low",
                    "strategy": "simplify",
                    "reexplain": (
                        "The question told us voltage stays constant — it's given, not something to solve for. "
                        "We only need to find what happens to current (I) when resistance (R) goes up."
                    ),
                },
            },
        },
        {
            "concept": "resistance",
            "type": "mcq",
            "difficulty": "easy",
            "text": "Using I = V / R: if V = 10 and R doubles from 5 to 10, what is the new current?",
            "options": ["1", "2", "4", "20"],
            "correct_answer": "1",
            "misconception_map": {
                "2": {"label": "used_old_resistance", "description": "Recomputed with the original R instead of the new R.",
                      "severity": "low", "strategy": "step_by_step",
                      "reexplain": "Careful — the question says R doubled to 10, not that it's still 5. New I = 10 / 10 = 1."},
                "4": {"label": "arithmetic_slip", "description": "Likely a division error rather than a conceptual gap.",
                      "severity": "low", "strategy": "step_by_step",
                      "reexplain": "Let's redo the division slowly: 10 divided by 10 is 1, not 4."},
                "20": {"label": "multiplied_instead_of_divided", "description": "Applied I = V * R instead of I = V / R.",
                       "severity": "medium", "strategy": "step_by_step",
                       "reexplain": "Remember the formula is I = V / R (divide), not V * R (multiply). 10 / 10 = 1."},
            },
        },
        {
            "concept": "voltage",
            "type": "conceptual",
            "difficulty": "beginner",
            "text": "In your own words, what role does voltage play in a circuit?",
            "options": [],
            "correct_answer": "voltage pressure push current",
        },
    ],
}

SAMPLE_TOPICS = {OHMS_LAW["id"]: OHMS_LAW}
