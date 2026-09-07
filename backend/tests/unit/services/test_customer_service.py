import uuid
from unittest.mock import AsyncMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.models.user import User
from app.schemas.customer import CustomerCreate
from app.services import customer_service


@pytest.mark.parametrize(
    ("input_value", "expected"),
    [
        ("low", "Low"),
        (" MEDIUM ", "Medium"),
        ("High", "High"),
        ("CRITICAL", "Critical"),
        (None, None),
        ("unknown", None),
    ],
)
def test_normalize_risk_tier(input_value, expected) -> None:
    assert customer_service.normalize_risk_tier(input_value) == expected


@pytest.mark.asyncio
async def test_get_user_customer_raises_when_not_found(
    monkeypatch: pytest.MonkeyPatch,
    test_user: User,
) -> None:
    db = AsyncMock(spec=AsyncSession)
    customer_id = uuid.uuid4()
    get_customer_mock = AsyncMock(return_value=None)
    dataset_check_mock = AsyncMock()

    monkeypatch.setattr(customer_service, "get_customer_by_id", get_customer_mock)

    monkeypatch.setattr(customer_service, "get_user_dataset", dataset_check_mock)

    with pytest.raises(ValueError, match="Customer not found"):
        await customer_service.get_user_customer(db, test_user,customer_id)
    get_customer_mock.assert_awaited_once_with(db, customer_id)
    dataset_check_mock.assert_not_awaited()


@pytest.mark.asyncio
async def test_get_user_customer_checks_dataset_ownership(
    monkeypatch: pytest.MonkeyPatch,
    test_user: User,
) -> None:
    db = AsyncMock(spec=AsyncSession)
    customer = Customer(
        id=uuid.uuid4(),
        dataset_id=uuid.uuid4(),
        customer_identifier="CUST-001",
        tenure_months=12,
    )
    get_customer_mock = AsyncMock(return_value=customer)
    dataset_check_mock = AsyncMock()

    monkeypatch.setattr(customer_service, "get_customer_by_id", get_customer_mock)
    monkeypatch.setattr(customer_service, "get_user_dataset", dataset_check_mock)

    result = await customer_service.get_user_customer(db, test_user, customer.id)

    assert result is customer
    get_customer_mock.assert_awaited_once_with(db, customer.id)
    dataset_check_mock.assert_awaited_once_with(db, test_user, customer.dataset_id)


@pytest.mark.asyncio
async def test_list_customers_checks_dataset_ownership(
    monkeypatch: pytest.MonkeyPatch,
    test_user: User,
) -> None:
    db = AsyncMock(spec=AsyncSession)
    dataset_id = uuid.uuid4()
    customers = [
        Customer(
            id=uuid.uuid4(),
            dataset_id=dataset_id,
            customer_identifier="CUST-001",
            tenure_months=12,
        )
    ]
    dataset_check_mock = AsyncMock()
    list_mock = AsyncMock(return_value=customers)

    monkeypatch.setattr(customer_service, "get_user_dataset", dataset_check_mock)
    monkeypatch.setattr(
        customer_service,
        "list_customers_by_dataset_id",
        list_mock,
    )

    result = await customer_service.list_customers_for_dataset(
        db,
        test_user,
        dataset_id,
    )

    assert result == customers
    dataset_check_mock.assert_awaited_once_with(db, test_user, dataset_id)
    list_mock.assert_awaited_once_with(db, dataset_id)


@pytest.mark.asyncio
async def test_bulk_create_rejects_mismatched_dataset(
    monkeypatch: pytest.MonkeyPatch,
    test_user: User,
) -> None:
    db = AsyncMock(spec=AsyncSession)
    target_dataset_id = uuid.uuid4()
    customer_data = CustomerCreate(
        dataset_id=uuid.uuid4(),
        customer_identifier="CUST-001",
        tenure_months=12,
    )
    dataset_check_mock = AsyncMock()
    bulk_create_mock = AsyncMock()

    monkeypatch.setattr(customer_service, "get_user_dataset", dataset_check_mock)
    monkeypatch.setattr(customer_service, "create_customers_bulk", bulk_create_mock)

    with pytest.raises(
        ValueError,
        match="Customer dataset_id does not match target dataset",
    ):
        await customer_service.create_customers_for_dataset_bulk(
            db,
            test_user,
            target_dataset_id,
            [customer_data],
        )

    dataset_check_mock.assert_awaited_once_with(db, test_user, target_dataset_id)
    bulk_create_mock.assert_not_awaited()


@pytest.mark.asyncio
async def test_delete_user_customer_deletes_authorized_customer(
    monkeypatch: pytest.MonkeyPatch,
    test_user: User,
) -> None:
    db = AsyncMock(spec=AsyncSession)
    customer = Customer(
        id=uuid.uuid4(),
        dataset_id=uuid.uuid4(),
        customer_identifier="CUST-001",
        tenure_months=12,
    )
    get_customer_mock = AsyncMock(return_value=customer)
    delete_mock = AsyncMock()

    monkeypatch.setattr(customer_service, "get_user_customer", get_customer_mock)
    monkeypatch.setattr(customer_service, "delete_customer", delete_mock)

    await customer_service.delete_user_customer(db, test_user, customer.id)

    get_customer_mock.assert_awaited_once_with(db, test_user, customer.id)
    delete_mock.assert_awaited_once_with(db, customer)

