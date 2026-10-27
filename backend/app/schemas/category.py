from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Category name")
    type: Literal["expense", "income", "both"] = Field("expense", description="Category type")
    icon: Optional[str] = Field("Tag", description="Icon identifier")
    color: Optional[str] = Field("#64748B", description="Hex color code")
    is_default: Optional[bool] = Field(False, description="Whether this is a system default")


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    type: Optional[Literal["expense", "income", "both"]] = None
    icon: Optional[str] = None
    color: Optional[str] = None


class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

