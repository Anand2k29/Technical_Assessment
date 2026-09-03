from app.services.agents.adaptive import difficulty_for_mastery, update_mastery
from app.services.agents.assessment_agent import build_assessment
from app.services.agents.misconception_engine import detect_misconception
from app.services.agents.response_evaluator import evaluate_response
from app.services.agents.visual_planner import plan_visual
from app.services.agents import teaching_agent
from app.services.providers.llm import DemoLLMProvider
from app.services.rag.chunker import chunk_blocks
from app.services.rag.parser import Block
from app.data.sample_content import OHMS_LAW

llm = DemoLLMProvider()


def test_difficulty_bands():
    assert difficulty_for_mastery(0.1) == "beginner"
    assert difficulty_for_mastery(0.45) == "guided_practice"
    assert difficulty_for_mastery(0.7) == "intermediate"
    assert difficulty_for_mastery(0.9) == "advanced"
    assert difficulty_for_mastery(0.97) == "mastered"


def test_mastery_increases_on_correct_and_decreases_on_incorrect():
    up = update_mastery(mastery=0.3, attempts=1, correct=True, confidence=0.9, misconception_severity=None)
    assert up > 0.3
    down = update_mastery(mastery=0.3, attempts=1, correct=False, confidence=0.2, misconception_severity="high")
    assert down < 0.3


def test_mcq_evaluator_exact_match():
    question = {"type": "mcq", "correct_answer": "Current decreases"}
    assert evaluate_response(llm, question, "Current decreases")["correct"] is True
    assert evaluate_response(llm, question, "Current increases")["correct"] is False


def test_misconception_engine_uses_curated_map():
    question = OHMS_LAW["questions"][0]
    evaluation = evaluate_response(llm, question, "Current increases")
    assert evaluation["correct"] is False
    misconception = detect_misconception(llm, question, "Current increases", evaluation, attempt_count=0)
    assert misconception["misconception"] == "inverse_relationship_confusion"
    assert "narrower pipe" in misconception["reexplain"] or "pipe" in misconception["reexplain"]


def test_teaching_agent_advances_state_and_picks_reexplain_strategy():
    state = teaching_agent.TeachingState(current_concept="ohm's law").to_dict()
    question = OHMS_LAW["questions"][0]
    evaluation = evaluate_response(llm, question, "Current increases")
    misconception = detect_misconception(llm, question, "Current increases", evaluation, attempt_count=0)
    new_state = teaching_agent.advance(state, evaluation, misconception)
    assert new_state["next_action"] == "re_explain_with_analogy"
    assert new_state["mastery"] < state["mastery"] or new_state["mastery"] == 0.0
    assert "inverse_relationship_confusion" in new_state["misconceptions"]

    # now answer correctly -> mastery should recover and no re-explain
    evaluation2 = evaluate_response(llm, question, "Current decreases")
    newer_state = teaching_agent.advance(new_state, evaluation2, None)
    assert newer_state["next_action"] in ("continue", "increase_difficulty", "advance_to_next_concept")
    assert newer_state["mastery"] > new_state["mastery"]


def test_visual_planner_detects_subject():
    assert plan_visual("resistance", "Ohm's Law circuits")["subject"] == "physics"
    assert plan_visual("photosynthesis", "plant biology cells")["subject"] == "biology"
    assert plan_visual("recursion", "python programming functions")["subject"] == "programming"
    assert plan_visual("something obscure", "an unrelated made-up subject")["subject"] == "general"


def test_build_assessment_does_not_leak_answers_across_concepts():
    concepts = ["voltage", "resistance", "ohm's law"]
    concept_context = {
        "voltage": "Voltage is the electrical pressure that pushes current through a circuit.",
        "resistance": "Resistance restricts the flow of current in a circuit.",
        "ohm's law": "Ohm's law relates current, voltage, and resistance as I = V / R.",
    }
    questions = build_assessment(llm, "Ohm's Law", concepts, concept_context, "beginner")
    mcq = next(q for q in questions if q["concept"] == "ohm's law" and q["type"] == "mcq")
    assert "voltage" not in mcq["correct_answer"].lower() or "ohm" in mcq["correct_answer"].lower()
    assert "pressure that pushes current" not in mcq["correct_answer"]


def test_chunker_preserves_chapter_metadata():
    blocks = [Block(text=" ".join(["word"] * 400), chapter="Chapter 1", section="1.1", page=3)]
    chunks = chunk_blocks(blocks)
    assert len(chunks) > 1
    assert all(c["chapter"] == "Chapter 1" and c["page"] == 3 for c in chunks)
