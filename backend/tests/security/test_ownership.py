import uuid

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.customer_repository import get_customer_by_id
from app.repositories.dataset_repository import get_dataset_by_id
from app.repositories.recommendation_repository import get_recommendation_by_id

from .conftest import OwnershipGraph


def owner_scoped_read_paths(graph: OwnershipGraph) -> list[str]:
    return [
        f"/datasets/{graph.owner_dataset.id}",
        f"/customers/dataset/{graph.owner_dataset.id}",
        f"/customers/dataset/{graph.owner_dataset.id}/explorer",
        f"/customers/{graph.owner_customer.id}",
        f"/customers/{graph.owner_customer.id}/detail",
        f"/predictions/customer/{graph.owner_customer.id}",
        f"/predictions/dataset/{graph.owner_dataset.id}",
        f"/predictions/dataset/{graph.owner_dataset.id}/overview",
        f"/predictions/{graph.owner_prediction.id}",
        f"/recommendations/customer/{graph.owner_customer.id}",
        f"/recommendations/dataset/{graph.owner_dataset.id}",
        f"/recommendations/dataset/{graph.owner_dataset.id}/overview",
        f"/recommendations/{graph.owner_recommendation.id}",
        f"/simulations/{graph.owner_simulation.id}",
        f"/dashboard/dataset/{graph.owner_dataset.id}",
    ]


@pytest.mark.asyncio
async def test_cross_user_reads_are_rejected_without_resource_data(
    security_client: tuple[AsyncClient, dict],
    ownership_graph: OwnershipGraph,
) -> None:
    client, identity = security_client
    identity["user"] = ownership_graph.attacker

    for path in owner_scoped_read_paths(ownership_graph):
        response = await client.get(path)

        assert response.status_code in {403, 404}, path
        assert "OWNER-CUSTOMER" not in response.text, path
        assert "Owner-only recommendation" not in response.text, path


@pytest.mark.asyncio
async def test_dataset_and_simulation_lists_only_return_current_users_resources(
    security_client: tuple[AsyncClient, dict],
    ownership_graph: OwnershipGraph,
) -> None:
    client, identity = security_client
    identity["user"] = ownership_graph.attacker

    datasets_response = await client.get("/datasets")
    simulations_response = await client.get("/simulations")

    assert datasets_response.status_code == 200
    assert [item["id"] for item in datasets_response.json()] == [
        str(ownership_graph.attacker_dataset.id)
    ]
    assert simulations_response.status_code == 200
    assert [item["id"] for item in simulations_response.json()] == [
        str(ownership_graph.attacker_simulation.id)
    ]


@pytest.mark.asyncio
async def test_cross_user_customer_creation_is_rejected(
    security_client: tuple[AsyncClient, dict],
    ownership_graph: OwnershipGraph,
) -> None:
    client, identity = security_client
    identity["user"] = ownership_graph.attacker
    payload = {
        "dataset_id": str(ownership_graph.owner_dataset.id),
        "customer_identifier": "ATTACKER-CREATED",
        "tenure_months": 1,
        "monthly_revenue": "10.00",
    }

    single_response = await client.post("/customers", json=payload)
    bulk_response = await client.post(
        f"/customers/dataset/{ownership_graph.owner_dataset.id}/bulk",
        json=[payload],
    )

    assert single_response.status_code in {403, 404}
    assert bulk_response.status_code in {403, 404}


@pytest.mark.asyncio
async def test_cross_user_simulation_creation_is_rejected(
    security_client: tuple[AsyncClient, dict],
    ownership_graph: OwnershipGraph,
) -> None:
    client, identity = security_client
    identity["user"] = ownership_graph.attacker

    response = await client.post(
        "/simulations",
        json={
            "dataset_id": str(ownership_graph.owner_dataset.id),
            "intervention_type": "discount",
            "target_segment": "high-risk",
            "intensity_percentage": 50,
        },
    )

    assert response.status_code in {403, 404}


@pytest.mark.asyncio
async def test_cross_user_recommendation_update_is_rejected_without_changes(
    security_client: tuple[AsyncClient, dict],
    ownership_graph: OwnershipGraph,
    db_session: AsyncSession,
) -> None:
    client, identity = security_client
    identity["user"] = ownership_graph.attacker
    recommendation_id = ownership_graph.owner_recommendation.id

    response = await client.patch(
        f"/recommendations/{recommendation_id}/status",
        json={"status": "completed"},
    )

    assert response.status_code in {403, 404}
    db_session.expire_all()
    recommendation = await get_recommendation_by_id(
        db_session,
        recommendation_id,
    )
    assert recommendation is not None
    assert recommendation.status == "new"
    assert recommendation.completed_at is None


@pytest.mark.asyncio
async def test_cross_user_customer_delete_is_rejected_without_deletion(
    security_client: tuple[AsyncClient, dict],
    ownership_graph: OwnershipGraph,
    db_session: AsyncSession,
) -> None:
    client, identity = security_client
    identity["user"] = ownership_graph.attacker

    response = await client.delete(
        f"/customers/{ownership_graph.owner_customer.id}"
    )

    assert response.status_code in {403, 404}
    assert await get_customer_by_id(db_session, ownership_graph.owner_customer.id)


@pytest.mark.asyncio
async def test_cross_user_dataset_delete_is_rejected_without_deletion(
    security_client: tuple[AsyncClient, dict],
    ownership_graph: OwnershipGraph,
    db_session: AsyncSession,
) -> None:
    client, identity = security_client
    identity["user"] = ownership_graph.attacker

    response = await client.delete(f"/datasets/{ownership_graph.owner_dataset.id}")

    assert response.status_code in {403, 404}
    assert await get_dataset_by_id(db_session, ownership_graph.owner_dataset.id)


@pytest.mark.asyncio
async def test_unknown_ids_do_not_expose_internal_details(
    security_client: tuple[AsyncClient, dict],
    ownership_graph: OwnershipGraph,
) -> None:
    client, identity = security_client
    identity["user"] = ownership_graph.attacker

    response = await client.get(f"/datasets/{uuid.uuid4()}")

    assert response.status_code == 404
    assert "traceback" not in response.text.lower()
    assert "sql" not in response.text.lower()
