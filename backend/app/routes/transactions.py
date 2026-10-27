from datetime import date
from typing import Optional, Literal
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from ..database import get_db
from ..models import Transaction, Category
from ..schemas import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    PaginatedTransactions,
)
from ..services.report_service import export_transactions_csv

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


@router.get("", response_model=PaginatedTransactions)
def get_transactions(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in description or notes"),
    type: Optional[Literal["Income", "Expense"]] = Query(None, description="Transaction type"),
    category: Optional[str] = Query(None, description="Category name"),
    start_date: Optional[date] = Query(None, description="Start date filter"),
    end_date: Optional[date] = Query(None, description="End date filter"),
    sort_by: Literal["date", "amount"] = Query("date", description="Field to sort by"),
    order: Literal["asc", "desc"] = Query("desc", description="Sort order"),
    db: Session = Depends(get_db),
):
    query = db.query(Transaction)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Transaction.description.ilike(search_filter)) | (Transaction.notes.ilike(search_filter))
        )
    if type:
        query = query.filter(Transaction.type == type)
    if category:
        query = query.filter(Transaction.category_name == category)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)

    # Sorting
    sort_col = Transaction.amount if sort_by == "amount" else Transaction.date
    if order == "asc":
        query = query.order_by(asc(sort_col), asc(Transaction.id))
    else:
        query = query.order_by(desc(sort_col), desc(Transaction.id))

    total = query.count()
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    return PaginatedTransactions(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        items=items,
    )


@router.get("/export/csv")
def export_csv(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    csv_content = export_transactions_csv(db, start_date, end_date)
    filename = f"transactions_export_{date.today().isoformat()}.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")
    return tx


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(tx_in: TransactionCreate, db: Session = Depends(get_db)):
    # Verify or link category if category_id not provided
    cat_id = tx_in.category_id
    if not cat_id and tx_in.category_name:
        cat = db.query(Category).filter(Category.name.ilike(tx_in.category_name)).first()
        if cat:
            cat_id = cat.id

    tx_data = tx_in.model_dump()
    tx_data["category_id"] = cat_id

    tx = Transaction(**tx_data)
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: int,
    tx_update: TransactionUpdate,
    db: Session = Depends(get_db),
):
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")

    update_data = tx_update.model_dump(exclude_unset=True)
    if "category_name" in update_data and not update_data.get("category_id"):
        cat = db.query(Category).filter(Category.name.ilike(update_data["category_name"])).first()
        if cat:
            update_data["category_id"] = cat.id

    for key, value in update_data.items():
        setattr(tx, key, value)

    db.commit()
    db.refresh(tx)
    return tx


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")

    db.delete(tx)
    db.commit()
    return None

