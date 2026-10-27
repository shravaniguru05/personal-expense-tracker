from datetime import datetime
from decimal import Decimal
from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator, ConfigDict


class BudgetBase(BaseModel):
    month: str = Field(..., pattern=r"^\d{4}-(0[1-9]|1[0-2])$", description="Target month YYYY-MM")
    category_id: Optional[int] = Field(None, description="Category ID, or null for overall budget")
    category_name: Optional[str] = Field(None, description="Category name, or null for overall")
    amount: Decimal = Field(..., gt=Decimal("0.00"), description="Budget limit amount")

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Budget amount must be strictly positive")
        return round(v, 2)


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    amount: Decimal = Field(..., gt=Decimal("0.00"), description="Updated budget limit amount")

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Budget amount must be strictly positive")
        return round(v, 2)


class BudgetResponse(BudgetBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BudgetStatus(BaseModel):
    id: Optional[int] = None
    month: str
    category_id: Optional[int] = None
    category_name: str
    budgeted_amount: Decimal
    spent_amount: Decimal
    remaining_amount: Decimal
    percentage_used: float
    status: Literal["normal", "warning", "exceeded"]  # warning >= 80%, exceeded >= 100%

