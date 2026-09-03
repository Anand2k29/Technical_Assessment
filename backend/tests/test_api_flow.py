"""Integration test of the golden-path demo flow: onboard -> plan sample lesson
-> teach -> answer incorrectly (misconception) -> answer correctly (adapt) ->
finish lesson -> assessment -> report. Runs entirely in DEMO MODE (no LLM key)."""


def test_full_teaching_loop_with_sample_material(client, onboarded_user):
    user_id = onboarded_user["user_id"]

    status = client.get("/api/system/status").json()
    assert status["demo_mode"] is True
    assert status["llm_live"] is False

    plan_resp = client.post("/api/lessons/plan", json={
        "user_id": user_id, "sample_topic_id": "sample_ohms_law", "duration_minutes": 20,
    })
    assert plan_resp.status_code == 200, plan_resp.text
    plan = plan_resp.json()
    lesson_id = plan["lesson_id"]
    assert plan["grounded"] is True
    assert len(plan["sections"]) >= 1

    start = client.post(f"/api/teaching/{lesson_id}/start").json()
    assert start["ui_state"] == "TEACHING"
    question = start["question"]
    assert question is not None

    # Find the Ohm's Law direction question specifically to drive the canonical demo scenario.
    ohms_question_id = None
    for section in plan["sections"]:
        if section["concept"] == "ohm's law":
            ohms_question_id = section["checkpoint_question"]["id"]
    assert ohms_question_id is not None

    wrong = client.post(f"/api/teaching/{lesson_id}/answer", json={
        "user_id": user_id, "question_id": ohms_question_id, "response_text": "Current increases",
    })
    assert wrong.status_code == 200
    wrong_body = wrong.json()
    assert wrong_body["correct"] is False
    assert wrong_body["ui_state"] == "RE_EXPLAINING"
    assert wrong_body["misconception"]["misconception"] == "inverse_relationship_confusion"
    assert wrong_body["state"]["next_action"] == "re_explain_with_analogy"

    right = client.post(f"/api/teaching/{lesson_id}/answer", json={
        "user_id": user_id, "question_id": ohms_question_id, "response_text": "Current decreases",
    })
    assert right.status_code == 200
    right_body = right.json()
    assert right_body["correct"] is True
    assert right_body["state"]["mastery"] > wrong_body["state"]["mastery"]

    progress = client.get(f"/api/progress/{user_id}").json()
    assert any(m["label"] == "inverse_relationship_confusion" for m in progress["misconceptions"])

    gen = client.post(f"/api/assessment/{lesson_id}/generate", params={"user_id": user_id})
    assert gen.status_code == 200
    assessment = gen.json()
    assert assessment["questions"]

    responses = [{"question_id": q["id"], "response_text": "a reasonable answer"} for q in assessment["questions"]]
    submit = client.post(f"/api/assessment/{assessment['assessment_id']}/submit", json={"user_id": user_id, "responses": responses})
    assert submit.status_code == 200
    report = submit.json()
    assert "score" in report and "recommended_next_topic" in report

    dashboard = client.get(f"/api/dashboard/{user_id}").json()
    assert dashboard["progress"]["overall_mastery"] >= 0


def test_assessment_question_ids_persist_and_grade_correctly(client, onboarded_user):
    """Regression test: Assessment.question_ids is a JSON column populated with
    in-place .append() calls in the route handler at one point, which SQLAlchemy
    silently fails to persist (no dirty-tracking on a plain JSON column mutated
    in place) -- every submitted response was then dropped as "not in this
    assessment" and every report came back as an empty, all-zero score."""
    user_id = onboarded_user["user_id"]
    plan = client.post("/api/lessons/plan", json={"user_id": user_id, "sample_topic_id": "sample_ohms_law", "duration_minutes": 20}).json()
    lesson_id = plan["lesson_id"]
    client.post(f"/api/teaching/{lesson_id}/start")

    gen = client.post(f"/api/assessment/{lesson_id}/generate", params={"user_id": user_id}).json()
    assert len(gen["questions"]) == len(plan["sections"])

    responses = [{"question_id": q["id"], "response_text": q["options"][0] if q["options"] else "an answer"} for q in gen["questions"]]
    report = client.post(f"/api/assessment/{gen['assessment_id']}/submit", json={"user_id": user_id, "responses": responses}).json()

    # With every question answered, strong+weak areas together must cover every concept --
    # an empty report (the bug) leaves both lists empty regardless of what was submitted.
    assert len(report["strong_areas"]) + len(report["weak_areas"]) == len(plan["sections"])


def test_upload_rejects_bad_extension(client, onboarded_user):
    resp = client.post(
        "/api/documents/upload",
        data={"user_id": onboarded_user["user_id"]},
        files={"file": ("malware.exe", b"not really a doc", "application/octet-stream")},
    )
    assert resp.status_code == 400


def test_teaching_answer_rejects_foreign_question(client, onboarded_user):
    resp = client.post("/api/teaching/does-not-exist/answer", json={
        "user_id": onboarded_user["user_id"], "question_id": "nope", "response_text": "x",
    })
    assert resp.status_code == 404
