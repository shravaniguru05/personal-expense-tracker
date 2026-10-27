from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas import ReportsData
from ..services.report_service import get_reports_data

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/analytics", response_model=ReportsData)
def get_analytics(
    start_date: Optional[date] = Query(None, description="Start date filter"),
    end_date: Optional[date] = Query(None, description="End date filter"),
    db: Session = Depends(get_db),
):
    return get_reports_data(db, start_date=start_date, end_date=end_date)

