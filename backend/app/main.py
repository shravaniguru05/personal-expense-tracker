import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .services.seed_data import init_default_categories
from .routes import (
    categories_router,
    transactions_router,
    budgets_router,
    dashboard_router,
    reports_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    Base.metadata.create_all(bind=engine)
    # Seed default categories
    db = SessionLocal()
    try:
        init_default_categories(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Personal Expense Tracker API",
    description="REST API for tracking personal income, expenses, budgets, and financial analytics.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Configuration
frontend_origin_env = os.getenv("FRONTEND_ORIGINS", "")
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost",
]
if frontend_origin_env:
    origins.extend([o.strip() for o in frontend_origin_env.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(categories_router)
app.include_router(transactions_router)
app.include_router(budgets_router)
app.include_router(dashboard_router)
app.include_router(reports_router)


@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Personal Expense Tracker API",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

