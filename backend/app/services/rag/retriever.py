"""RAG retrieval pipeline: query understanding -> semantic retrieval -> keyword
boost -> re-rank -> grounded context, per docs/architecture.md's RAG diagram."""
import re
from dataclasses import dataclass

from app.services.providers.vectorstore import get_vector_store, RetrievedChunk


@dataclass
class GroundedContext:
    chunks: list[RetrievedChunk]

    def as_prompt_context(self) -> str:
        lines = []
        for c in self.chunks:
            loc = c.metadata.get("chapter") or c.metadata.get("document_title", "material")
            lines.append(f"[Source: {loc}] {c.text}")
        return "\n\n".join(lines)

    def sources(self) -> list[dict]:
        seen, out = set(), []
        for c in self.chunks:
            key = (c.metadata.get("document_id"), c.metadata.get("chapter"), c.metadata.get("page"))
            if key in seen:
                continue
            seen.add(key)
            out.append({
                "document": c.metadata.get("document_title"),
                "chapter": c.metadata.get("chapter"),
                "section": c.metadata.get("section"),
                "page": c.metadata.get("page"),
            })
        return out


def _keywords(query: str) -> set[str]:
    return {w.lower() for w in re.findall(r"[A-Za-z]{4,}", query)}


def retrieve(user_id: str, query: str, top_k: int = 5, document_id: str | None = None) -> GroundedContext:
    store = get_vector_store()
    semantic = store.query(scope=user_id, text=query, top_k=top_k * 2, document_id=document_id)
    kws = _keywords(query)

    def rerank_score(c: RetrievedChunk) -> float:
        overlap = len(kws & _keywords(c.text)) / max(len(kws), 1)
        return 0.75 * c.score + 0.25 * overlap

    ranked = sorted(semantic, key=rerank_score, reverse=True)[:top_k]
    return GroundedContext(chunks=ranked)
