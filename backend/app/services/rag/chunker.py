"""Turn parsed blocks into retrieval-sized chunks with metadata preserved for
source-aware answers ("this came from Chapter 4, page 27")."""
import re
from app.services.rag.parser import Block

CHUNK_WORDS = 180
OVERLAP_WORDS = 30


def _split_words(text: str, size: int, overlap: int) -> list[str]:
    words = text.split()
    if len(words) <= size:
        return [text]
    out, start = [], 0
    while start < len(words):
        out.append(" ".join(words[start:start + size]))
        start += size - overlap
    return out


def chunk_blocks(blocks: list[Block]) -> list[dict]:
    chunks = []
    for block in blocks:
        text = re.sub(r"\s+", " ", block.text).strip()
        if not text:
            continue
        for piece in _split_words(text, CHUNK_WORDS, OVERLAP_WORDS):
            chunks.append({
                "text": piece,
                "chapter": block.chapter,
                "section": block.section,
                "heading": block.heading,
                "page": block.page,
            })
    return chunks
