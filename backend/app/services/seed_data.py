from datetime import date, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from ..models import Category, Transaction, Budget

DEFAULT_CATEGORIES = [
    {"name": "Food & Dining", "type": "expense", "icon": "Utensils", "color": "#EF4444", "is_default": True},
    {"name": "Transportation", "type": "expense", "icon": "Car", "color": "#F59E0B", "is_default": True},
    {"name": "Shopping", "type": "expense", "icon": "ShoppingBag", "color": "#EC4899", "is_default": True},
    {"name": "Education", "type": "expense", "icon": "GraduationCap", "color": "#8B5CF6", "is_default": True},
    {"name": "Bills & Utilities", "type": "expense", "icon": "Zap", "color": "#3B82F6", "is_default": True},
    {"name": "Healthcare", "type": "expense", "icon": "HeartPulse", "color": "#10B981", "is_default": True},
    {"name": "Entertainment", "type": "expense", "icon": "Film", "color": "#6366F1", "is_default": True},
    {"name": "Travel", "type": "expense", "icon": "Plane", "color": "#14B8A6", "is_default": True},
    {"name": "Rent & Housing", "type": "expense", "icon": "Home", "color": "#F97316", "is_default": True},
    {"name": "Other Expense", "type": "expense", "icon": "MoreHorizontal", "color": "#64748B", "is_default": True},
    {"name": "Salary", "type": "income", "icon": "Briefcase", "color": "#10B981", "is_default": True},
    {"name": "Freelance", "type": "income", "icon": "Laptop", "color": "#06B6D4", "is_default": True},
    {"name": "Investments & Dividends", "type": "income", "icon": "TrendingUp", "color": "#8B5CF6", "is_default": True},
    {"name": "Gifts & Bonuses", "type": "income", "icon": "Gift", "color": "#F59E0B", "is_default": True},
    {"name": "Other Income", "type": "income", "icon": "PlusCircle", "color": "#64748B", "is_default": True},
]


def init_default_categories(db: Session):
    for cat_data in DEFAULT_CATEGORIES:
        existing = db.query(Category).filter(Category.name == cat_data["name"]).first()
        if not existing:
            cat = Category(**cat_data)
            db.add(cat)
    db.commit()


def seed_demo_data(db: Session):
    # Ensure categories exist
    init_default_categories(db)
    
    # If transactions already exist, don't duplicate
    if db.query(Transaction).count() > 0:
        return {"message": "Data already exists. Skipped seeding to avoid duplicates."}

    today = date.today()
    current_month_str = today.strftime("%Y-%m")
    
    # Calculate previous month string
    first_of_this_month = today.replace(day=1)
    last_month_end = first_of_this_month - timedelta(days=1)
    prev_month_str = last_month_end.strftime("%Y-%m")

    # Categories map
    cats = {c.name: c for c in db.query(Category).all()}

    # Sample demo transactions for current month
    demo_txs = [
        # Income
        {"description": "Monthly Salary", "amount": Decimal("75000.00"), "type": "Income", "cat": "Salary", "days_ago": min(25, today.day - 1), "method": "Bank Transfer", "notes": "Corporate payroll"},
        {"description": "Freelance UI Design", "amount": Decimal("18500.00"), "type": "Income", "cat": "Freelance", "days_ago": min(15, max(1, today.day - 5)), "method": "UPI", "notes": "Client project milestone"},
        {"description": "Stock Dividend", "amount": Decimal("2400.00"), "type": "Income", "cat": "Investments & Dividends", "days_ago": min(10, max(1, today.day - 8)), "method": "Bank Transfer", "notes": "Quarterly dividend payout"},
        
        # Expenses
        {"description": "Apartment Rent", "amount": Decimal("22000.00"), "type": "Expense", "cat": "Rent & Housing", "days_ago": min(24, max(1, today.day - 1)), "method": "Net Banking", "notes": "Monthly house rent"},
        {"description": "Supermarket Groceries", "amount": Decimal("4850.00"), "type": "Expense", "cat": "Food & Dining", "days_ago": min(20, max(1, today.day - 2)), "method": "Credit Card", "notes": "Weekly household supplies"},
        {"description": "Electricity & Water Bill", "amount": Decimal("2650.00"), "type": "Expense", "cat": "Bills & Utilities", "days_ago": min(18, max(1, today.day - 4)), "method": "UPI", "notes": "BESCOM power bill"},
        {"description": "Fuel & Metro Card Recharge", "amount": Decimal("3200.00"), "type": "Expense", "cat": "Transportation", "days_ago": min(14, max(1, today.day - 6)), "method": "UPI", "notes": "Commute travel expense"},
        {"description": "Weekend Restaurant Dinner", "amount": Decimal("2150.00"), "type": "Expense", "cat": "Food & Dining", "days_ago": min(9, max(1, today.day - 7)), "method": "Credit Card", "notes": "Dinner with family"},
        {"description": "Online Course Subscription", "amount": Decimal("1999.00"), "type": "Expense", "cat": "Education", "days_ago": min(8, max(1, today.day - 8)), "method": "Debit Card", "notes": "DevOps certification course"},
        {"description": "Health & Pharmacy Supplies", "amount": Decimal("1450.00"), "type": "Expense", "cat": "Healthcare", "days_ago": min(6, max(1, today.day - 9)), "method": "UPI", "notes": "Vitamins and first aid"},
        {"description": "Cinema Tickets & Snacks", "amount": Decimal("1100.00"), "type": "Expense", "cat": "Entertainment", "days_ago": min(4, max(1, today.day - 10)), "method": "UPI", "notes": "Movie weekend"},
        {"description": "Clothing Shopping", "amount": Decimal("4200.00"), "type": "Expense", "cat": "Shopping", "days_ago": min(2, max(1, today.day - 11)), "method": "Credit Card", "notes": "Festive wear purchase"},
    ]

    for item in demo_txs:
        cat = cats.get(item["cat"])
        tx_date = today - timedelta(days=max(0, item["days_ago"]))
        tx = Transaction(
            description=item["description"],
            amount=item["amount"],
            type=item["type"],
            category_id=cat.id if cat else None,
            category_name=cat.name if cat else item["cat"],
            date=tx_date,
            payment_method=item["method"],
            notes=item.get("notes"),
        )
        db.add(tx)

    # Add sample budgets for current month
    # Overall budget: 50,000
    db.add(Budget(
        month=current_month_str,
        category_id=None,
        category_name="Overall Budget",
        amount=Decimal("50000.00")
    ))
    
    # Category budgets
    if "Food & Dining" in cats:
        db.add(Budget(
            month=current_month_str,
            category_id=cats["Food & Dining"].id,
            category_name="Food & Dining",
            amount=Decimal("10000.00")
        ))
    if "Shopping" in cats:
        db.add(Budget(
            month=current_month_str,
            category_id=cats["Shopping"].id,
            category_name="Shopping",
            amount=Decimal("5000.00")
        ))
    if "Transportation" in cats:
        db.add(Budget(
            month=current_month_str,
            category_id=cats["Transportation"].id,
            category_name="Transportation",
            amount=Decimal("4000.00")
        ))

    db.commit()
    return {"message": "Demo data populated successfully."}
