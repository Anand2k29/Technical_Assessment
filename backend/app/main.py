import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import assessment, documents, lessons, misc, profile, progress, teaching
from app.core.config import settings
from app.db.session import init_db

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("autopsy")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    logger.info("AUTOPSY backend ready. demo_mode=%s", settings.demo_mode)
    yield


app = FastAPI(title=settings.app_name, description="AUTOPSY: AI Teacher That Understands. Explains. Interacts. Adapts.", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware, allow_origins=settings.all_cors_origins, allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Something went wrong on our side. Please try again."})


@app.get("/")
def root():
    return {"app": settings.app_name, "status": "ok"}


app.include_router(profile.router)
app.include_router(documents.router)
app.include_router(lessons.router)
app.include_router(teaching.router)
app.include_router(assessment.router)
app.include_router(progress.router)
app.include_router(misc.router)
