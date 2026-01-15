from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://draft:draft@localhost:5432/fantasy_draft"
    sqs_endpoint: Optional[str] = "http://localhost:4566"
    sqs_queue_url: Optional[str] = "http://localhost:4566/000000000000/draft-events"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

