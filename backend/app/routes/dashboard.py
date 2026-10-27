from datetime import date
from typing import Optional, Literal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Transaction, Budget, Category
from ..schemas import DashboardSummary
from ..services.report_service import get_dashboard_summary
from ..services.seed_data import seed_demo_data, init_default_categories

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_summary(
    filter_type: Literal["this_month", "last_month", "custom", "all"] = Query(
        "this_month", description="Filter preset"
    ),
    start_date: Optional[date] = Query(None, description="Custom range start date"),
    end_date: Optional[date] = Query(None, description="Custom range end date"),
    db: Session = Depends(get_db),
):
    return get_dashboard_summary(db, filter_type=filter_type, start_date=start_date, end_date=end_date)


@router.post("/seed-demo")
def seed_demo(db: Session = Depends(get_db)):
    result = seed_demo_data(db)
    return result


@router.post("/reset-data")
def reset_data(db: Session = Depends(get_db)):
    db.query(Transaction).delete()
    db.query(Budget).delete()
    db.query(Category).filter(Category.is_default == False).delete()
    db.commit()
    init_default_categories(db)
    return {"message": "All transactions and custom data cleared successfully."}
