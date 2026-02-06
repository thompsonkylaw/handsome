from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# For local dev, we can use SQLite if no params provided, or Postgres if DATABASE_URL is set
# Railway provides DATABASE_URL or DATABASE_PUBLIC_URL
# SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("DATABASE_PUBLIC_URL") or "sqlite:///./sql_app.db"

# Using remote database as requested
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:RevAJPaQCrrzJJBVQpRxgfNRshSpwttt@ballast.proxy.rlwy.net:55662/railway"

# Fix for Railway's postgres:// vs postgresql://
if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

logger.info(f"Connecting to database with URL starting with: {SQLALCHEMY_DATABASE_URL[:10]}...")

# Connection pool settings for production Postgres
if "postgresql" in SQLALCHEMY_DATABASE_URL:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,  # Verify connections before using them
        pool_recycle=3600,   # Recycle connections after 1 hour
        connect_args={
            "connect_timeout": 10,
            "options": "-c timezone=utc"
        }
    )
else:
    # SQLite settings for local development
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
