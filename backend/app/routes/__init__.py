from .categories import router as categories_router
from .transactions import router as transactions_router
from .budgets import router as budgets_router
from .dashboard import router as dashboard_router
from .reports import router as reports_router

__all__ = [
    "categories_router",
    "transactions_router",
    "budgets_router",
    "dashboard_router",
    "reports_router",
]

