import uuid
from decimal import Decimal
from unittest.mock import AsyncMock

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer import Customer
from app.models.dataset import Dataset
from app.models.prediction import Prediction
from app.models.recommendation import Recommendation
from app.models.user import User
from app.schemas.recommendation import ChurnDriver
from app.services import upload_service


VALID_CSV = (
    b"customerID,tenure,MonthlyCharges,TotalCharges,Contract,"
    b"InternetService,TechSupport,OnlineSecurity,Churn\n"
    b"CUST-001,12,50.00,600.00,Month-to-month,DSL,No,No,No\n"
    b"CUST-002,24,100.00,2400.00,One year,Fiber optic,Yes,Yes,Yes\n"
)


async def persisted_user(db: AsyncSession) -> User:
    user = User(
        clerk_user_id=f"upload_{uuid.uuid4()}",
        email=f"upload_{uuid.uuid4()}@example.com",
        name="Upload Test User",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@pytest.mark.asyncio
async def test_process_dataset_upload_persists_complete_workflow(
    db_session: AsyncSession,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    user = await persisted_user(db_session)
    upload_mock = AsyncMock(return_value="uploads/test/customers.csv")
    predict_mock = AsyncMock(
        return_value=[
            {
                "churn_probability": Decimal("0.20"),
                "top_drivers": [ChurnDriver(feature="Contract", impact=0.2)],
                "recommended_action": "Maintain normal cadence.",
            },
            {
                "churn_probability": Decimal("0.90"),
                "top_drivers": [ChurnDriver(feature="Contract", impact=0.9)],
                "recommended_action": "Call customer immediately.",
            },
        ]
    )
    monkeypatch.setattr(upload_service, "upload_dataset_file", upload_mock)
    monkeypatch.setattr(upload_service, "predict_dataset", predict_mock)

    result = await upload_service.process_dataset_upload(
        db_session,
        user,
        filename="customers.csv",
        file_bytes=VALID_CSV,
        content_type="text/csv",
    )

    customers = list(
        (await db_session.execute(select(Customer))).scalars().all()
    )
    predictions = list(
        (await db_session.execute(select(Prediction))).scalars().all()
    )
    recommendations = list(
        (await db_session.execute(select(Recommendation))).scalars().all()
    )

    assert result.upload_status == "completed"
    assert result.record_count == 2
    assert len(customers) == 2
    assert len(predictions) == 2
    assert len(recommendations) == 2
    assert {prediction.risk_tier for prediction in predictions} == {
        "Low",
        "Critical",
    }
    assert {item.action for item in recommendations} == {
        "Maintain normal cadence.",
        "Call customer immediately.",
    }
    upload_mock.assert_awaited_once()
    predict_mock.assert_awaited_once()


@pytest.mark.asyncio
async def test_process_dataset_upload_marks_dataset_failed_on_ml_mismatch(
    db_session: AsyncSession,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    user = await persisted_user(db_session)
    monkeypatch.setattr(
        upload_service,
        "upload_dataset_file",
        AsyncMock(return_value="uploads/test/customers.csv"),
    )
    monkeypatch.setattr(
        upload_service,
        "predict_dataset",
        AsyncMock(return_value=[]),
    )

    with pytest.raises(
        ValueError,
        match="ML prediction count does not match customer count",
    ):
        await upload_service.process_dataset_upload(
            db_session,
            user,
            filename="customers.csv",
            file_bytes=VALID_CSV,
            content_type="text/csv",
        )

    dataset = (
        await db_session.execute(
            select(Dataset).where(Dataset.user_id == user.id)
        )
    ).scalar_one()
    assert dataset.upload_status == "failed"
