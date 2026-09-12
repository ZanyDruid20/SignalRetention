import uuid
from datetime import datetime, timezone
from decimal import Decimal
from unittest.mock import AsyncMock

import pytest
from httpx import AsyncClient

from app.api.routes import customers as customer_routes
from app.schemas.customer import CustomerDetail, CustomerExplorerPage, CustomerRead


def customer_read(dataset_id: uuid.UUID | None = None) -> CustomerRead:
    return CustomerRead(
        id=uuid.uuid4(),
        dataset_id=dataset_id or uuid.uuid4(),
        customer_identifier="CUST-001",
        tenure_months=12,
        monthly_revenue=Decimal("50"),
        created_at=datetime.now(timezone.utc),
    )


@pytest.mark.asyncio
async def test_customer_explorer_passes_filters(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    dataset_id = uuid.uuid4()
    result = CustomerExplorerPage(
        items=[],
        summary={
            "total_customers": 0,
            "high_risk_customers": 0,
            "monthly_revenue_at_risk": 0,
            "average_health_score": None,
        },
        page=1,
        page_size=10,
        total=0,
        total_pages=0,
    )
    service = AsyncMock(return_value=result)
    monkeypatch.setattr(
        customer_routes, "get_user_customer_explorer_page", service
    )

    response = await client.get(
        f"/customers/dataset/{dataset_id}/explorer",
        params={
            "page_size": 10,
            "search": "  CUST  ",
            "risk_tier": ["High", "Critical"],
            "min_health": 20,
            "max_health": 80,
        },
    )

    assert response.status_code == 200
    assert response.json()["total"] == 0
    kwargs = service.await_args_list[0].kwargs
    assert kwargs["search"] == "CUST"
    assert kwargs["risk_tiers"] == ["High", "Critical"]


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "params",
    [
        {"page_size": 10, "min_health": 80, "max_health": 20},
        {"page_size": 10, "min_revenue": 100, "max_revenue": 10},
    ],
)
async def test_customer_explorer_rejects_inverted_ranges(
    client: AsyncClient, params: dict[str, int]
) -> None:
    response = await client.get(
        f"/customers/dataset/{uuid.uuid4()}/explorer", params=params
    )

    assert response.status_code == 400


@pytest.mark.asyncio
async def test_list_dataset_customers(client: AsyncClient, monkeypatch: pytest.MonkeyPatch) -> None:
    dataset_id = uuid.uuid4()
    customer = customer_read(dataset_id)
    monkeypatch.setattr(
        customer_routes,
        "list_customers_for_dataset",
        AsyncMock(return_value=[customer]),
    )

    response = await client.get(f"/customers/dataset/{dataset_id}")

    assert response.status_code == 200
    assert response.json()[0]["customer_identifier"] == "CUST-001"


@pytest.mark.asyncio
async def test_get_customer(client: AsyncClient, monkeypatch: pytest.MonkeyPatch) -> None:
    customer = customer_read()
    monkeypatch.setattr(
        customer_routes, "get_user_customer", AsyncMock(return_value=customer)
    )

    response = await client.get(f"/customers/{customer.id}")

    assert response.status_code == 200
    assert response.json()["id"] == str(customer.id)


@pytest.mark.asyncio
async def test_create_customer(client: AsyncClient, monkeypatch: pytest.MonkeyPatch) -> None:
    customer = customer_read()
    monkeypatch.setattr(
        customer_routes,
        "create_customer_for_dataset",
        AsyncMock(return_value=customer),
    )
    payload = {
        "dataset_id": str(customer.dataset_id),
        "customer_identifier": "CUST-001",
        "tenure_months": 12,
        "monthly_revenue": "50",
    }

    response = await client.post("/customers", json=payload)

    assert response.status_code == 201
    assert response.json()["customer_identifier"] == "CUST-001"


@pytest.mark.asyncio
async def test_create_customers_bulk(client: AsyncClient, monkeypatch: pytest.MonkeyPatch) -> None:
    dataset_id = uuid.uuid4()
    customer = customer_read(dataset_id)
    monkeypatch.setattr(
        customer_routes,
        "create_customers_for_dataset_bulk",
        AsyncMock(return_value=[customer]),
    )
    payload = [
        {
            "dataset_id": str(dataset_id),
            "customer_identifier": "CUST-001",
            "tenure_months": 12,
        }
    ]

    response = await client.post(f"/customers/dataset/{dataset_id}/bulk", json=payload)

    assert response.status_code == 201
    assert len(response.json()) == 1


@pytest.mark.asyncio
async def test_customer_detail(client: AsyncClient, monkeypatch: pytest.MonkeyPatch) -> None:
    customer = customer_read()
    detail = CustomerDetail(
        customer=customer,
        dataset_name="Customer Churn",
        dataset_filename="customers.csv",
        prediction=None,
        recommendations=[],
    )
    monkeypatch.setattr(
        customer_routes, "get_customer_detail", AsyncMock(return_value=detail)
    )

    response = await client.get(f"/customers/{customer.id}/detail")

    assert response.status_code == 200
    assert response.json()["dataset_name"] == "Customer Churn"


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("error", "status_code"),
    [(ValueError("Customer not found"), 404), (PermissionError("Forbidden"), 403)],
)
async def test_delete_customer_translates_errors(
    client: AsyncClient,
    monkeypatch: pytest.MonkeyPatch,
    error: Exception,
    status_code: int,
) -> None:
    monkeypatch.setattr(
        customer_routes, "delete_user_customer", AsyncMock(side_effect=error)
    )

    response = await client.delete(f"/customers/{uuid.uuid4()}")

    assert response.status_code == status_code
