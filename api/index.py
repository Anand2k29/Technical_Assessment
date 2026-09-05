"""
Vercel Serverless Function entry point.

This wraps the FastAPI backend app so it can run as a Vercel Python
serverless function. Vercel automatically picks up any Python file
under the `api/` directory at the project root.

The vercel.json rewrites route all /api/* requests here.
"""
import sys
from pathlib import Path

# Add the backend directory to sys.path so `app.*` imports resolve.
backend_dir = str(Path(__file__).resolve().parent.parent / "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Re-export the FastAPI application for Vercel's Python runtime.
from app.main import app  # noqa: E402, F401
