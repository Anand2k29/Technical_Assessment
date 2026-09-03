import os
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Point at a throwaway SQLite file BEFORE any app module is imported, so the
# test suite never touches the developer's real backend/storage/autopsy.db.
_TEST_DB = Path(tempfile.gettempdir()) / "autopsy_test.db"
os.environ["DATABASE_URL"] = f"sqlite:///{_TEST_DB}"

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client():
    from app.db.session import engine, Base
    import app.models  # noqa: F401  ensure models are registered before create_all
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    from app.main import app
    with TestClient(app) as c:
        yield c


@pytest.fixture()
def onboarded_user(client):
    resp = client.post("/api/onboarding", json={
        "email": "student@example.com", "name": "Test Student", "level": "beginner",
        "language": "English", "teaching_style": "balanced", "goal": "Learn the basics",
    })
    assert resp.status_code == 200
    return resp.json()
