"""Vercel Serverless Function entry point.

Vercel's Python runtime looks for an `app` (ASGI) object in `api/index.py`.
This file simply re-exports the FastAPI application so that all routes
defined in `app.main` are served under `/api/*` on Vercel.
"""

import sys
from pathlib import Path

# Ensure the backend package is importable when running on Vercel.
# Vercel executes this file from the repo root, so we need to add
# the backend directory to sys.path for `from app.main import app` to work.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app  # noqa: F401 — Vercel picks up the `app` variable

# Vercel expects the handler at module level. FastAPI is ASGI-compatible,
# so Vercel's Python runtime will serve it automatically.
