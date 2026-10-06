# # db/database.py
# from sqlalchemy import create_engine
# from sqlalchemy.orm import declarative_base, sessionmaker

# # Database file ka naam intopilot.db hoga, jo aapke Backend folder me ban jayegi
# SQLALCHEMY_DATABASE_URL = "sqlite:///./intopilot.db"

# engine = create_engine(
#     SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
# )
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = declarative_base()

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


# db/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# 🔴 Agar server (Render) par 'DATABASE_URL' set hai, toh wo use hoga, warna default SQLite chalega local ke liye
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./intopilot.db")

# 🔴 Neon Postgres ke liye check
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    # SQLAlchemy 1.4+ me postgres:// allow nahi hai, isko postgresql:// karna padta hai
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    # SQLite ke liye thread check false rakhna zaroori hai
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # Neon (PostgreSQL) ke liye engine (Isme connect_args nahi lagta)
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()