from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel
from .transaction import TransactionResponse
from .budget import BudgetStatus


class CategoryBreakdownItem(BaseModel):
    category_name: str
    amount: Decimal
    percentage: float
    color: Optional[str] = "#64748B"
    count: int = 0


class MonthlyBarItem(BaseModel):
    month: str  # e.g. "2026-10" or "Oct 2026"
    income: Decimal
    expense: Decimal
    savings: Decimal


class TrendPoint(BaseModel):
    date: str  # e.g. "2026-10-01"
    amount: Decimal
    type: Optional[str] = "Expense"


class DashboardSummary(BaseModel):
    total_income: Decimal
    total_expenses: Decimal
    current_balance: Decimal
    monthly_income: Decimal
    monthly_expenses: Decimal
    monthly_savings: Decimal
    savings_rate: float
    overall_budget: Optional[Decimal] = None
    overall_budget_spent: Decimal = Decimal("0.00")
    overall_budget_percentage: float = 0.0
    overall_budget_status: str = "normal"  # normal, warning, exceeded
    category_breakdown: List[CategoryBreakdownItem]
    income_vs_expense: List[MonthlyBarItem]
    monthly_trends: List[TrendPoint]
    recent_transactions: List[TransactionResponse]


class PeriodicSummary(BaseModel):
    period: str  # e.g., "Day", "Week", "Month"
    label: str   # e.g., "2026-10-27" or "Week 43" or "Oct 2026"
    income: Decimal
    expense: Decimal
    net: Decimal


class ReportsData(BaseModel):
    total_income: Decimal
    total_expenses: Decimal
    net_savings: Decimal
    savings_rate: float
    category_breakdown: List[CategoryBreakdownItem]
    periodic_summary: List[PeriodicSummary]
    income_vs_expense: List[MonthlyBarItem]
    daily_trends: List[TrendPoint]
