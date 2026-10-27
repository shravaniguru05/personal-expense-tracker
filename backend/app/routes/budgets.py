from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Budget, Category
from ..schemas import BudgetCreate, BudgetUpdate, BudgetResponse, BudgetStatus
from ..services.report_service import get_budget_statuses

router = APIRouter(prefix="/api/budgets", tags=["Budgets"])


@router.get("", response_model=List[BudgetStatus])
def get_budgets(
    month: Optional[str] = Query(None, pattern=r"^\d{4}-(0[1-9]|1[0-2])$", description="Target month YYYY-MM"),
    db: Session = Depends(get_db),
):
    target_month = month or date.today().strftime("%Y-%m")
    return get_budget_statuses(db, target_month)


@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_budget(budget_in: BudgetCreate, db: Session = Depends(get_db)):
    cat_id = budget_in.category_id
    cat_name = budget_in.category_name

    # If category name provided without ID, find the category
    if cat_name and not cat_id and cat_name != "Overall Budget":
        cat = db.query(Category).filter(Category.name.ilike(cat_name)).first()
        if cat:
            cat_id = cat.id
            cat_name = cat.name

    # Look for existing budget for month + category_id
    query = db.query(Budget).filter(Budget.month == budget_in.month)
    if cat_id is None:
        query = query.filter(Budget.category_id.is_(None))
    else:
        query = query.filter(Budget.category_id == cat_id)

    existing = query.first()
    if existing:
        existing.amount = budget_in.amount
        existing.category_name = cat_name
        db.commit()
        db.refresh(existing)
        return existing

    new_budget = Budget(
        month=budget_in.month,
        category_id=cat_id,
        category_name=cat_name or ("Overall Budget" if cat_id is None else None),
        amount=budget_in.amount,
    )
    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)
    return new_budget


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(budget_id: int, budget_in: BudgetUpdate, db: Session = Depends(get_db)):
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found.")

    budget.amount = budget_in.amount
    db.commit()
    db.refresh(budget)
    return budget


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(budget_id: int, db: Session = Depends(get_db)):
    budget = db.query(Budget).filter(Budget.id == budget_id).first()
    if not budget:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found.")

    db.delete(budget)
    db.commit()
    return None

