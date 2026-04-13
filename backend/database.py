from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = "sqlite:///./employees.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # khusus sqlite
)

# Di dalam database.py
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()