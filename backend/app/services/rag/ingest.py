"""Upload -> validate -> extract -> structure-detect -> chunk -> enrich -> embed
-> vector DB, per docs/architecture.md's ingestion pipeline."""
import logging
from pathlib import Path

from sqlalchemy.orm import Session

from app import models
from app.services.providers.vectorstore import get_vector_store
from app.services.rag.parser import parse_document
from app.services.rag.chunker import chunk_blocks

logger = logging.getLogger("autopsy.ingest")


def ingest_document(db: Session, document: models.Document, path: Path) -> None:
    document.status = "processing"
    db.commit()
    try:
        blocks = parse_document(path)
        chunks = chunk_blocks(blocks)
        if not chunks:
            raise ValueError("No extractable text found in this file")

        chapters = sorted({c["chapter"] for c in chunks if c["chapter"]})
        document.structure = {"chapters": chapters, "chunk_count": len(chunks)}
        document.title = document.title or chapters[0] if chapters else document.filename

        store_records, db_rows = [], []
        for i, c in enumerate(chunks):
            row = models.DocumentChunk(
                document_id=document.id, chunk_index=i, text=c["text"],
                chapter=c["chapter"], section=c["section"], heading=c["heading"], page=c["page"],
            )
            db.add(row)
            db_rows.append(row)
        db.flush()  # assign ids

        for row in db_rows:
            store_records.append({
                "chunk_id": row.id,
                "text": row.text,
                "metadata": {
                    "document_id": document.id,
                    "document_title": document.title,
                    "chapter": row.chapter,
                    "section": row.section,
                    "page": row.page,
                },
            })
        get_vector_store().add_chunks(scope=document.user_id, chunks=store_records)

        document.status = "ready"
        db.commit()
    except Exception as exc:
        logger.exception("Ingestion failed for document %s", document.id)
        document.status = "failed"
        document.error = str(exc)
        db.commit()
