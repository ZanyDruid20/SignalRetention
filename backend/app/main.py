from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.logging import log_requests, setup_logging
from app.core.security import add_security_headers


setup_logging()


def get_allowed_origins(frontend_url: str) -> list[str]:
    normalized_url = frontend_url.rstrip("/")
    local_origins = {
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    }

    if normalized_url in local_origins:
        return sorted(local_origins)

    return [normalized_url]

app = FastAPI(
    title="SignalRetentionAPI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(settings.frontend_url),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(log_requests)
app.middleware("http")(add_security_headers)

app.include_router(api_router)
