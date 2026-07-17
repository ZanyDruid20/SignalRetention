from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str

    clerk_secret_key: str
    clerk_issuer: str

    redis_url: str | None = None
    gcs_bucket_name: str | None = None
    ml_service_url: str = "http://localhost:8001"
    frontend_url: str = "http://localhost:3000"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()  # type: ignore[call-arg]
