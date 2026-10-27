from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from ..database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    type = Column(String(20), default="expense", nullable=False)  # 'expense', 'income', 'both'
    icon = Column(String(50), default="Tag")
    color = Column(String(20), default="#64748B")
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="category", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="category", cascade="all, delete-orphan")
