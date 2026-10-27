from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Category
from ..schemas import CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.get("", response_model=List[CategoryResponse])
def get_categories(type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Category)
    if type:
        query = query.filter((Category.type == type) | (Category.type == "both"))
    return query.order_by(Category.name.asc()).all()


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(category_in: CategoryCreate, db: Session = Depends(get_db)):
    existing = db.query(Category).filter(Category.name.ilike(category_in.name)).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category '{category_in.name}' already exists.",
        )
    cat = Category(**category_in.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    cat_update: CategoryUpdate,
    db: Session = Depends(get_db),
):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")

    update_data = cat_update.model_dump(exclude_unset=True)
    if "name" in update_data and update_data["name"] != cat.name:
        existing = db.query(Category).filter(Category.name.ilike(update_data["name"])).first()
        if existing and existing.id != cat.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category '{update_data['name']}' already exists.",
            )

    for key, value in update_data.items():
        setattr(cat, key, value)

    db.commit()
    db.refresh(cat)
    return cat


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found.")
    
    db.delete(cat)
    db.commit()
    return None
