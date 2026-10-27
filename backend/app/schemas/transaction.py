import datetime as dt
from decimal import Decimal
from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator, ConfigDict


class TransactionBase(BaseModel):
    description: str = Field(..., min_length=1, max_length=255, description="Brief description")
    amount: Decimal = Field(..., gt=Decimal("0.00"), description="Positive transaction amount")
    type: Literal["Income", "Expense"] = Field(..., description="Income or Expense")
    category_id: Optional[int] = Field(None, description="Category ID")
    category_name: str = Field(..., min_length=1, max_length=100, description="Category name")
    date: dt.date = Field(default_factory=dt.date.today, description="Transaction date")
    payment_method: str = Field("UPI", description="Payment method used")
    notes: Optional[str] = Field(None, description="Optional extra notes")

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Amount must be strictly positive")
        return round(v, 2)


class TransactionCreate(TransactionBase):
    pass


class TransactionUpdate(BaseModel):
    description: Optional[str] = Field(None, min_length=1, max_length=255)
    amount: Optional[Decimal] = Field(None, gt=Decimal("0.00"))
    type: Optional[Literal["Income", "Expense"]] = None
    category_id: Optional[int] = None
    category_name: Optional[str] = Field(None, min_length=1, max_length=100)
    date: Optional[dt.date] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None:
            if v <= 0:
                raise ValueError("Amount must be strictly positive")
            return round(v, 2)
        return v


class TransactionResponse(TransactionBase):
    id: int
    created_at: dt.datetime
    updated_at: dt.datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedTransactions(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    items: list[TransactionResponse]

