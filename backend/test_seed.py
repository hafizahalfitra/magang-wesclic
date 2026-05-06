from app import seed_from_csv
from database import SessionLocal

db = SessionLocal()
try:
    print(seed_from_csv(mode="reset", db=db))
except Exception as e:
    import traceback
    traceback.print_exc()
