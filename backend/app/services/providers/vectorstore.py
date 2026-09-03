"""VectorStoreProvider abstraction backing RAG retrieval.

Default implementation (`LocalTfidfVectorStore`) needs no external service and
no model download: it fits a TF-IDF space per user's document library and
retrieves by cosine similarity, persisted to disk. Swapping in a hosted
embedding model + vector DB (Pinecone/Chroma/pgvector) only means writing a
new class with the same `.query()` / `.add_chunks()` contract."""
import pickle
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.core.config import settings


@dataclass
class RetrievedChunk:
    chunk_id: str
    text: str
    score: float
    metadata: dict = field(default_factory=dict)


class VectorStoreProvider(ABC):
    @abstractmethod
    def add_chunks(self, scope: str, chunks: list[dict]) -> None: ...

    @abstractmethod
    def query(self, scope: str, text: str, top_k: int = 5, document_id: str | None = None) -> list[RetrievedChunk]: ...


class LocalTfidfVectorStore(VectorStoreProvider):
    def _path(self, scope: str) -> Path:
        return settings.vector_dir / f"{scope}.pkl"

    def _load(self, scope: str) -> dict:
        p = self._path(scope)
        if p.exists():
            with open(p, "rb") as f:
                return pickle.load(f)
        return {"chunks": []}  # each: {chunk_id, text, metadata}

    def _save(self, scope: str, data: dict) -> None:
        with open(self._path(scope), "wb") as f:
            pickle.dump(data, f)

    def add_chunks(self, scope: str, chunks: list[dict]) -> None:
        data = self._load(scope)
        data["chunks"].extend(chunks)
        self._save(scope, data)

    def query(self, scope: str, text: str, top_k: int = 5, document_id: str | None = None) -> list[RetrievedChunk]:
        data = self._load(scope)
        pool = [c for c in data["chunks"] if not document_id or c["metadata"].get("document_id") == document_id]
        if not pool:
            return []
        corpus = [c["text"] for c in pool]
        try:
            vectorizer = TfidfVectorizer(stop_words="english", max_features=20000)
            matrix = vectorizer.fit_transform(corpus + [text])
        except ValueError:
            return []  # empty vocabulary (e.g. all-numeric/stopword text)
        sims = cosine_similarity(matrix[-1], matrix[:-1])[0]
        ranked = np.argsort(sims)[::-1][:top_k]
        return [
            RetrievedChunk(chunk_id=pool[i]["chunk_id"], text=pool[i]["text"], score=float(sims[i]), metadata=pool[i]["metadata"])
            for i in ranked if sims[i] > 0.0
        ]


_store: VectorStoreProvider | None = None


def get_vector_store() -> VectorStoreProvider:
    global _store
    if _store is None:
        _store = LocalTfidfVectorStore()
    return _store
