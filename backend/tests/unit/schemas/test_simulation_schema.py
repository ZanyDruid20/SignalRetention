import uuid
import pytest
from pydantic import ValidationError

from app.schemas.simulation import SimulationRequest

@pytest.fixture
def valid_simulation_data() -> dict[str, object]:
    return {
        "dataset_id": str(uuid.uuid4()),
        "intervention_type": "discount",
        "target_segment": "high-risk",
        "intensity_percentage": 50,
    }

def test_valid_simulation_request(
    valid_simulation_data: dict[str, object],
) -> None:
    request = SimulationRequest.model_validate(valid_simulation_data)

    assert request.intervention_type == "discount"
    assert request.target_segment == "high-risk"
    assert request.intensity_percentage == 50
    assert isinstance(request.dataset_id, uuid.UUID)

def test_invalid_dataset_id_is_rejected(
    valid_simulation_data: dict[str, object],
) -> None:
    valid_simulation_data["dataset_id"] = "not-a-uuid"

    with pytest.raises(ValidationError):
        SimulationRequest.model_validate(valid_simulation_data)

def test_unknown_intervention_type_is_rejected(
    valid_simulation_data: dict[str, object],
) -> None:
    valid_simulation_data["intervention_type"] = "free-vacation"

    with pytest.raises(ValidationError):
        SimulationRequest.model_validate(valid_simulation_data)

@pytest.mark.parametrize("intensity", [1, 50, 100])
def test_valid_intensity_values_are_accepted(
    valid_simulation_data: dict[str, object],
    intensity: int,
) -> None:
    valid_simulation_data["intensity_percentage"] = intensity

    request = SimulationRequest.model_validate(valid_simulation_data)

    assert request.intensity_percentage == intensity

@pytest.mark.parametrize("intensity", [0, 101, -1])
def test_invalid_intensity_values_are_rejected(
    valid_simulation_data: dict[str, object],
    intensity: int,
) -> None:
    valid_simulation_data["intensity_percentage"] = intensity

    with pytest.raises(ValidationError):
        SimulationRequest.model_validate(valid_simulation_data)
    