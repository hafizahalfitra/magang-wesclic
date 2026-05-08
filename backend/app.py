from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from api.routes import router as api_router

Base.metadata.create_all(bind=engine)

tags_metadata = [
    {
        "name": "General",
        "description": "General system health, mapping configs, and seed data endpoints.",
    },
    {
        "name": "Employee CRUD",
        "description": "Operations to Create, Read, Update, and Delete employee data.",
    },
    {
        "name": "Machine Learning",
        "description": "Predict salary and calculate salary estimation by division.",
    },
    {
        "name": "Authentication",
        "description": "Login and retrieve current user info.",
    }
]

app = FastAPI(
    title="Employee Intelligence & Salary Prediction API",
    description="Backend API with employee data, salary prediction, and division salary estimation.",
    version="4.0.0",
    openapi_tags=tags_metadata
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)