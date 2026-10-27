from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    description = Column(String(255), nullable=False, index=True)
    amount = Column(Numeric(12, 2, asdecimal=True), nullable=False)
    type = Column(String(20), nullable=False, index=True)  # "Income" or "Expense"
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    category_name = Column(String(100), nullable=False, index=True)
    date = Column(Date, nullable=False, default=date.today, index=True)
    payment_method = Column(String(50), default="UPI", nullable=False)  # "UPI", "Cash", "Credit Card", "Debit Card", "Net Banking", "Other"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="transactions")

