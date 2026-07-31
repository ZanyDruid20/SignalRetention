import csv
from decimal import Decimal, InvalidOperation
from io import StringIO
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dataset import Dataset
from app.models.user import User
from app.repositories.prediction_repository import create_prediction
from app.services.dataset_service import (
    complete_user_dataset_upload,
    create_dataset_for_user,
    update_user_dataset_status,
)
from app.services.customer_service import create_customers_for_dataset_bulk
from app.services.ml_service import build_prediction, build_recommendation, predict_dataset
from app.services.recommendation_service import create_recommendations_for_customers_bulk
from app.services.storage_service import upload_dataset_file
from app.services.validation_service import validate_upload_file
from app.schemas.customer import CustomerCreate

async def process_dataset_upload(
    db: AsyncSession,
    current_user: User,
    filename: str,
    file_bytes: bytes,
) -> Dataset:
    validate_upload_file(filename, file_bytes)

    dataset = await create_dataset_for_user(
        db=db,
        current_user=current_user,
        name=filename,
        filename=filename,
    )

    try:
        await update_user_dataset_status(
            db=db,
            current_user=current_user,
            dataset_id=dataset.id,
            upload_status="processing",
        )

        await upload_dataset_file(
            user_id=str(current_user.id),
            dataset_id=str(dataset.id),
            filename=filename,
            file_bytes=file_bytes,
        )

        raw_rows = parse_csv_rows(file_bytes)
        customers_data = build_customer_create_rows(dataset.id, raw_rows)

        customers = await create_customers_for_dataset_bulk(
            db=db,
            current_user=current_user,
            dataset_id=dataset.id,
            customers_data=customers_data,
        )

        churn_probabilities = await predict_dataset(raw_rows)
        if len(churn_probabilities) != len(customers):
            raise ValueError("ML prediction count does not match customer count")

        recommendation_data = []
        for customer, churn_probability in zip(customers, churn_probabilities):
            prediction_data = build_prediction(
                customer_id=customer.id,
                churn_probability=churn_probability,
                model_version="xgboost-v1",
            )
            prediction = await create_prediction(db, prediction_data)
            recommendation_data.append(
                build_recommendation(
                    customer_id=customer.id,
                    risk_tier=prediction.risk_tier,
                )
            )

        if recommendation_data:
            await create_recommendations_for_customers_bulk(
                db=db,
                current_user=current_user,
                recommendations_data=recommendation_data,
            )

        return await complete_user_dataset_upload(
            db=db,
            current_user=current_user,
            dataset_id=dataset.id,
            record_count=len(customers),
        )
    except Exception:
        await update_user_dataset_status(
            db=db,
            current_user=current_user,
            dataset_id=dataset.id,
            upload_status="failed",
        )
        raise


def parse_csv_rows(file_bytes: bytes) -> list[dict[str, Any]]:
    text = file_bytes.decode("utf-8-sig")
    reader = csv.DictReader(StringIO(text))

    rows = [dict(row) for row in reader]
    if not rows:
        raise ValueError("CSV file does not contain any customer rows")

    return rows


def build_customer_create_rows(
    dataset_id,
    raw_rows: list[dict[str, Any]],
) -> list[CustomerCreate]:
    return [
        build_customer_create_row(dataset_id, row, index)
        for index, row in enumerate(raw_rows, start=1)
    ]


def build_customer_create_row(
    dataset_id,
    row: dict[str, Any],
    index: int,
) -> CustomerCreate:
    customer_identifier = get_first_value(
        row,
        "customerID",
        "customer_identifier",
        "CustomerID",
        default=f"customer-{index}",
    )
    tenure_months = parse_required_int(
        get_first_value(row, "tenure", "tenure_months"),
        "tenure",
    )

    return CustomerCreate(
        dataset_id=dataset_id,
        customer_identifier=customer_identifier,
        tenure_months=tenure_months,
        monthly_revenue=parse_optional_decimal(
            get_first_value(row, "MonthlyCharges", "monthly_revenue")
        ),
        total_revenue=parse_optional_decimal(
            get_first_value(row, "TotalCharges", "total_revenue")
        ),
        contract_type=get_first_value(row, "Contract", "contract_type", default=None),
        actual_churn=parse_optional_bool(get_first_value(row, "Churn", default=None)),
    )


def get_first_value(
    row: dict[str, Any],
    *keys: str,
    default: str | None = "",
) -> str | None:
    for key in keys:
        value = row.get(key)
        if value is not None and str(value).strip() != "":
            return str(value).strip()
    return default


def parse_required_int(value: str | None, field_name: str) -> int:
    if value is None or value == "":
        raise ValueError(f"Missing required field: {field_name}")

    try:
        return int(value)
    except ValueError as exc:
        raise ValueError(f"Invalid integer value for {field_name}") from exc


def parse_optional_decimal(value: str | None) -> Decimal | None:
    if value is None or value == "":
        return None

    try:
        return Decimal(value)
    except InvalidOperation as exc:
        raise ValueError("Invalid decimal value in uploaded CSV") from exc


def parse_optional_bool(value: str | None) -> bool | None:
    if value is None or value == "":
        return None

    normalized = value.strip().lower()
    if normalized in {"yes", "true", "1"}:
        return True
    if normalized in {"no", "false", "0"}:
        return False

    raise ValueError("Invalid boolean value in uploaded CSV")
