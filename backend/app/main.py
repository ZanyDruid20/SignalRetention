from fastapi import FastAPI

from app.api.router import api_router
from app.core.logging import log_requests, setup_logging
from app.core.security import add_security_headers


setup_logging()

app = FastAPI(
    title="SignalRetentionAPI",
    version="1.0.0",
)

app.middleware("http")(log_requests)
app.middleware("http")(add_security_headers)

app.include_router(api_router)
