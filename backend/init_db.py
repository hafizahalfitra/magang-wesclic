from database import engine, Base
import db_models
Base.metadata.create_all(bind=engine)
