"""Visual Planner: subject-aware, deterministic (the product spec explicitly
prefers deterministic educational visuals over generative ones for accuracy).
Chooses a visual TYPE + generation instructions the frontend renders natively
(Mermaid / KaTeX / code block / SVG diagram) -- no image-generation calls."""
import re

SUBJECT_KEYWORDS = {
    "math": {"equation", "algebra", "calculus", "geometry", "math", "derivative", "integral", "matrix", "theorem"},
    "physics": {"physics", "force", "voltage", "current", "resistance", "energy", "motion", "ohm", "velocity", "acceleration", "circuit"},
    "biology": {"biology", "cell", "organism", "photosynthesis", "anatomy", "dna", "enzyme", "ecosystem", "gene"},
    "history": {"history", "war", "century", "empire", "revolution", "dynasty", "treaty", "civilization"},
    "programming": {"code", "programming", "algorithm", "function", "python", "javascript", "loop", "variable", "array", "api"},
}

EQUATION_RE = re.compile(r"[A-Za-z]\s*=\s*[A-Za-z0-9()/\*\+\-\s]{1,30}")
CODE_HINT_RE = re.compile(r"\b(def |function |import |class |for\s*\(|console\.log|print\()")


def _detect_subject(concept: str, topic: str) -> str:
    haystack = f"{concept} {topic}".lower()
    scores = {s: sum(1 for kw in kws if kw in haystack) for s, kws in SUBJECT_KEYWORDS.items()}
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "general"


def plan_visual(concept: str, topic: str, source_text: str = "") -> dict:
    subject = _detect_subject(concept, topic)

    if subject == "math":
        match = EQUATION_RE.search(source_text)
        formula = match.group(0).strip() if match else f"{concept[:1].upper()} = f(x)"
        return {"type": "equation", "subject": subject, "title": concept.capitalize(),
                "formula": formula, "steps": ["Identify the knowns", "Apply the relationship", "Solve step by step"]}

    if subject == "physics":
        return {"type": "diagram", "subject": subject, "title": concept.capitalize(),
                "diagram_kind": "process",
                "parts": ["Input / cause", concept.capitalize(), "Observable effect"],
                "formula": (EQUATION_RE.search(source_text) or [None])[0] if EQUATION_RE.search(source_text) else None}

    if subject == "biology":
        return {"type": "diagram", "subject": subject, "title": concept.capitalize(),
                "diagram_kind": "labeled_structure",
                "parts": [concept.capitalize(), "Structure / component", "Function"]}

    if subject == "history":
        return {"type": "timeline", "subject": subject, "title": concept.capitalize(),
                "events": [{"label": "Before", "detail": "Context leading up to it"},
                           {"label": concept.capitalize(), "detail": "The key event / turning point"},
                           {"label": "After", "detail": "Consequence / significance"}]}

    if subject == "programming":
        has_code = bool(CODE_HINT_RE.search(source_text))
        return {"type": "code", "subject": subject, "title": concept.capitalize(),
                "language": "python",
                "snippet": source_text.strip()[:300] if has_code else f"# {concept}\n# conceptual outline\ndef {concept.replace(' ', '_')}():\n    ...",
                "flow": ["Input", concept.capitalize(), "Output"]}

    return {"type": "concept_card", "subject": subject, "title": concept.capitalize(),
            "bullets": [f"What is {concept}?", f"Why {concept} matters", f"A simple example of {concept}"]}
