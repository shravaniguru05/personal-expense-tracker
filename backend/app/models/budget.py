from datetime import datetime
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from ..database import Base


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    month = Column(String(7), nullable=False, index=True)  # Format: "YYYY-MM"
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=True, index=True)
    category_name = Column(String(100), nullable=True)  # If NULL, indicates overall budget for the month
    amount = Column(Numeric(12, 2, asdecimal=True), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="budgets")

    __table_args__ = (
        UniqueConstraint("month", "category_id", name="uq_budget_month_category"),
    )

