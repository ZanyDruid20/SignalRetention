import pytest
@pytest.fixture
def valid_csv_bytes() -> bytes:
    return (
        b"customerID,tenure,MonthlyCharges\n"
        b"CUST-001,12,49.00\n"
    )