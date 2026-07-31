from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass


# Import models so SQLAlchemy can resolve string-based relationships at runtime.
from app.models import customer, dataset, prediction, recommendation, simulation, user  # noqa: E402, F401
