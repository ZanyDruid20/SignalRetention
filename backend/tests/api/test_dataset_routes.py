import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock

import pytest
from httpx import AsyncClient

from app.api.routes import datasets as dataset_routes
from app.models.dataset import Dataset
from app.models.user import User


def dataset_for(user: User) -> Dataset:
    return Dataset(
        id=uuid.uuid4(),
        user_id=user.id,
        name="customers.csv",
        filename="customers.csv",
        record_count=2,
        upload_status="completed",
        created_at=datetime.now(timezone.utc),
    )


@pytest.mark.asyncio
async def test_list_datasets_returns_service_result(
    client: AsyncClient,
    authenticated_user: User,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    dataset = dataset_for(authenticated_user)
    service = AsyncMock(return_value=[dataset])
    monkeypatch.setattr(dataset_routes, "list_datasets_for_user", service)

    response = await client.get("/datasets")

    assert response.status_code == 200
    assert response.json()[0]["id"] == str(dataset.id)
    assert response.json()[0]["record_count"] == 2
    service.assert_awaited_once()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("error", "expected_status"),
    [(ValueError("Dataset not found"), 404), (PermissionError("Forbidden"), 403)],
)
async def test_get_dataset_translates_service_errors(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
    error: Exception,
    expected_status: int,
) -> None:
    service = AsyncMock(side_effect=error)
    monkeypatch.setattr(dataset_routes, "get_user_dataset", service)

    response = await client.get(f"/datasets/{uuid.uuid4()}")

    assert response.status_code == expected_status
    assert response.json()["detail"] == str(error)


@pytest.mark.asyncio
async def test_get_dataset_rejects_malformed_uuid(client: AsyncClient) -> None:
    response = await client.get("/datasets/not-a-uuid")

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_upload_dataset_returns_created_dataset(
    client: AsyncClient,
    authenticated_user: User,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    dataset = dataset_for(authenticated_user)
    service = AsyncMock(return_value=dataset)
    monkeypatch.setattr(dataset_routes, "process_dataset_upload", service)

    response = await client.post(
        "/datasets/upload",
        files={"file": ("customers.csv", b"customerID\nCUST-001\n", "text/csv")},
    )

    assert response.status_code == 201
    assert response.json()["id"] == str(dataset.id)
    service.assert_awaited_once()
    call = service.await_args_list[0].kwargs
    assert call["filename"] == "customers.csv"
    assert call["content_type"] == "text/csv"


@pytest.mark.asyncio
async def test_upload_dataset_returns_safe_bad_request(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        dataset_routes,
        "process_dataset_upload",
        AsyncMock(side_effect=ValueError("Only CSV files are supported")),
    )

    response = await client.post(
        "/datasets/upload",
        files={"file": ("payload.exe", b"unsafe", "application/octet-stream")},
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Only CSV files are supported"}


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("side_effect", "expected_status"),
    [(None, 204), (ValueError("Dataset not found"), 404), (PermissionError("Forbidden"), 403)],
)
async def test_delete_dataset_response_contract(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
    side_effect: Exception | None,
    expected_status: int,
) -> None:
    service = AsyncMock(side_effect=side_effect)
    monkeypatch.setattr(dataset_routes, "delete_user_dataset", service)

    response = await client.delete(f"/datasets/{uuid.uuid4()}")

    assert response.status_code == expected_status
    if expected_status == 204:
        assert response.content == b""
