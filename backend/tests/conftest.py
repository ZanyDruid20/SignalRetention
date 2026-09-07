import uuid

import pytest

from app.models.user import User


@pytest.fixture
def valid_csv_bytes() -> bytes:
    return (
        b"customerID,tenure,MonthlyCharges\n"
        b"CUST-001,12,49.00\n"
    )


@pytest.fixture
def test_user() -> User:
    return User(
        id=uuid.uuid4(),
        clerk_user_id="user_test",
        email="test@example.com",
        name="Test User",
    )
