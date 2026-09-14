import uuid

import pytest
from httpx import ASGITransport, AsyncClient

from app.api.routes import datasets as dataset_routes
from app.main import app, get_allowed_origins

from .conftest import OwnershipGraph


@pytest.mark.parametrize(
    ("frontend_url", "expected"),
    [
        (
            "http://localhost:3000",
            ["http://127.0.0.1:3000", "http://localhost:3000"],
        ),
        (
            "https://signal-retention.vercel.app/",
            ["https://signal-retention.vercel.app"],
        ),
    ],
)
def test_allowed_origins_exclude_development_hosts_in_production(
    frontend_url: str,
    expected: list[str],
) -> None:
    assert get_allowed_origins(frontend_url) == expected


@pytest.mark.asyncio
async def test_configured_origin_receives_cors_permissions(
    security_client: tuple[AsyncClient, dict],
    ownership_graph: OwnershipGraph,
) -> None:
    client, identity = security_client
    identity["user"] = ownership_graph.attacker

    response = await client.get(
        "/datasets",
        headers={"Origin": "http://localhost:3000"},
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == (
        "http://localhost:3000"
    )
    assert response.headers["access-control-allow-credentials"] == "true"
    assert response.headers["vary"] == "Origin"


@pytest.mark.asyncio
async def test_unknown_origin_receives_no_cors_permission(
    security_client: tuple[AsyncClient, dict],
    ownership_graph: OwnershipGraph,
) -> None:
    client, identity = security_client
    identity["user"] = ownership_graph.attacker

    response = await client.get(
        "/datasets",
        headers={"Origin": "https://attacker.invalid"},
    )

    assert response.status_code == 200
    assert "access-control-allow-origin" not in response.headers


@pytest.mark.asyncio
async def test_cors_preflight_rejects_unknown_origin(
    security_client: tuple[AsyncClient, dict],
    ownership_graph: OwnershipGraph,
) -> None:
    client, identity = security_client
    identity["user"] = ownership_graph.attacker

    response = await client.options(
        "/datasets/upload",
        headers={
            "Origin": "https://attacker.invalid",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization,content-type",
        },
    )

    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers


@pytest.mark.asyncio
async def test_security_headers_protect_authenticated_responses(
    security_client: tuple[AsyncClient, dict],
    ownership_graph: OwnershipGraph,
) -> None:
    client, identity = security_client
    identity["user"] = ownership_graph.attacker

    first_response = await client.get("/datasets")
    second_response = await client.get("/datasets")

    assert first_response.headers["x-content-type-options"] == "nosniff"
    assert first_response.headers["x-frame-options"] == "DENY"
    assert first_response.headers["referrer-policy"] == (
        "strict-origin-when-cross-origin"
    )
    assert first_response.headers["permissions-policy"] == (
        "camera=(), microphone=(), geolocation=()"
    )
    assert first_response.headers["cache-control"] == "no-store"
    uuid.UUID(first_response.headers["x-request-id"])
    assert first_response.headers["x-request-id"] != (
        second_response.headers["x-request-id"]
    )


@pytest.mark.asyncio
async def test_unexpected_errors_do_not_disclose_internal_details(
    security_client: tuple[AsyncClient, dict],
    ownership_graph: OwnershipGraph,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _, identity = security_client
    identity["user"] = ownership_graph.attacker
    sensitive_details = (
        "postgresql://admin:secret@internal-db/private "
        "C:\\private\\service.py JWT-secret-value"
    )

    async def fail_internally(*args, **kwargs):
        raise RuntimeError(sensitive_details)

    monkeypatch.setattr(dataset_routes, "list_datasets_for_user", fail_internally)

    async with AsyncClient(
        transport=ASGITransport(app=app, raise_app_exceptions=False),
        base_url="http://test",
    ) as client:
        response = await client.get("/datasets")

    assert response.status_code == 500
    assert response.text == "Internal Server Error"
    assert sensitive_details not in response.text
    assert "postgresql" not in response.text.lower()
    assert "traceback" not in response.text.lower()


@pytest.mark.asyncio
async def test_validation_errors_do_not_disclose_server_internals(
    security_client: tuple[AsyncClient, dict],
    ownership_graph: OwnershipGraph,
) -> None:
    client, identity = security_client
    identity["user"] = ownership_graph.attacker

    response = await client.get("/datasets/not-a-uuid")

    assert response.status_code == 422
    body = response.text.lower()
    assert "traceback" not in body
    assert "sqlalchemy" not in body
    assert "postgresql://" not in body
    assert "c:\\" not in body
