import logging
from pathlib import Path

from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session

from app import models
from app.core.config import settings
from app.data.sample_content import SAMPLE_TOPICS
from app.db.session import get_db
from app.services.rag.ingest import ingest_document

logger = logging.getLogger("autopsy.api.documents")
router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("/samples")
def list_samples():
    return [{"id": t["id"], "title": t["title"], "description": f"Sample material: {t['title']} (demo mode)"} for t in SAMPLE_TOPICS.values()]


@router.post("/upload")
async def upload_document(user_id: str = Form(...), file: UploadFile = File(...), db: Session = Depends(get_db)):
    ext = Path(file.filename).suffix.lower()
    if ext not in settings.allowed_upload_ext:
        raise HTTPException(400, f"Unsupported file type '{ext}'. Allowed: {', '.join(settings.allowed_upload_ext)}")

    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > settings.max_upload_mb:
        raise HTTPException(400, f"File too large ({size_mb:.1f}MB). Max is {settings.max_upload_mb}MB.")

    user = db.get(models.User, user_id)
    if not user:
        raise HTTPException(404, "Unknown user_id")

    document = models.Document(user_id=user_id, filename=file.filename, file_type=ext.lstrip("."), title=Path(file.filename).stem)
    db.add(document)
    db.commit()

    dest = settings.upload_dir / f"{document.id}{ext}"
    dest.write_bytes(contents)

    try:
        ingest_document(db, document, dest)
    except Exception:
        logger.exception("Unexpected ingestion failure")
        document.status = "failed"
        document.error = "Unexpected error while processing this file."
        db.commit()

    db.refresh(document)
    return _document_out(document)


@router.get("")
def list_documents(user_id: str, db: Session = Depends(get_db)):
    docs = db.query(models.Document).filter(models.Document.user_id == user_id).order_by(models.Document.created_at.desc()).all()
    return [_document_out(d) for d in docs]


@router.get("/{document_id}")
def get_document(document_id: str, db: Session = Depends(get_db)):
    doc = db.get(models.Document, document_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    return _document_out(doc)


def _document_out(d: models.Document) -> dict:
    return {
        "id": d.id, "filename": d.filename, "title": d.title, "file_type": d.file_type,
        "status": d.status, "error": d.error, "structure": d.structure, "created_at": d.created_at.isoformat(),
    }
