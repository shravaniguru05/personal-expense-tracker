import io
import csv
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from ..models import Transaction, Category, Budget
from ..schemas.report import (
    DashboardSummary,
    CategoryBreakdownItem,
    MonthlyBarItem,
    TrendPoint,
    ReportsData,
    PeriodicSummary,
)
from ..schemas.budget import BudgetStatus


def parse_date_range(
    filter_type: Optional[str] = "this_month",
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> Tuple[Optional[date], Optional[date]]:
    today = date.today()
    if filter_type == "this_month":
        s_date = today.replace(day=1)
        # End of current month
        next_month = (s_date.replace(day=28) + timedelta(days=4)).replace(day=1)
        e_date = next_month - timedelta(days=1)
        return s_date, e_date
    elif filter_type == "last_month":
        first_of_this_month = today.replace(day=1)
        e_date = first_of_this_month - timedelta(days=1)
        s_date = e_date.replace(day=1)
        return s_date, e_date
    elif filter_type == "custom":
        return start_date, end_date
    elif filter_type == "all":
        return None, None
    else:
        # Default to this month
        s_date = today.replace(day=1)
        next_month = (s_date.replace(day=28) + timedelta(days=4)).replace(day=1)
        e_date = next_month - timedelta(days=1)
        return s_date, e_date


def get_dashboard_summary(
    db: Session,
    filter_type: str = "this_month",
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> DashboardSummary:
    s_date, e_date = parse_date_range(filter_type, start_date, end_date)
    today = date.today()
    current_month_str = today.strftime("%Y-%m")

    # 1. Total All-time Income and Expenses (for accurate Current Balance)
    all_income = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(Transaction.type == "Income").scalar()
    all_expense = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(Transaction.type == "Expense").scalar()
    current_balance = Decimal(str(all_income)) - Decimal(str(all_expense))

    # 2. Filtered Period Income and Expenses
    period_query = db.query(Transaction)
    if s_date:
        period_query = period_query.filter(Transaction.date >= s_date)
    if e_date:
        period_query = period_query.filter(Transaction.date <= e_date)

    filtered_txs = period_query.all()
    filtered_income = sum((t.amount for t in filtered_txs if t.type == "Income"), Decimal("0.00"))
    filtered_expenses = sum((t.amount for t in filtered_txs if t.type == "Expense"), Decimal("0.00"))
    monthly_savings = filtered_income - filtered_expenses
    savings_rate = float(round((monthly_savings / filtered_income) * 100, 1)) if filtered_income > 0 else 0.0

    # 3. Overall Budget status for current active month
    budget_target_month = s_date.strftime("%Y-%m") if s_date else current_month_str
    overall_budget_obj = (
        db.query(Budget)
        .filter(Budget.month == budget_target_month, Budget.category_id.is_(None))
        .first()
    )

    overall_budget_amount = overall_budget_obj.amount if overall_budget_obj else None
    
    # Calculate expenses for the month of overall_budget_target
    month_start = datetime.strptime(budget_target_month, "%Y-%m").date()
    next_month = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1)
    month_end = next_month - timedelta(days=1)
    month_expense = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.type == "Expense",
            Transaction.date >= month_start,
            Transaction.date <= month_end,
        )
        .scalar()
    )
    overall_budget_spent = Decimal(str(month_expense))
    
    overall_percentage = 0.0
    overall_status = "normal"
    if overall_budget_amount and overall_budget_amount > 0:
        overall_percentage = float(round((overall_budget_spent / overall_budget_amount) * 100, 1))
        if overall_percentage >= 100:
            overall_status = "exceeded"
        elif overall_percentage >= 80:
            overall_status = "warning"

    # 4. Expense Category Breakdown (filtered period)
    cat_totals = {}
    for tx in filtered_txs:
        if tx.type == "Expense":
            cat_totals[tx.category_name] = cat_totals.get(tx.category_name, Decimal("0.00")) + tx.amount

    category_records = {c.name: c for c in db.query(Category).all()}
    category_breakdown = []
    for cat_name, amt in sorted(cat_totals.items(), key=lambda x: x[1], reverse=True):
        pct = float(round((amt / filtered_expenses) * 100, 1)) if filtered_expenses > 0 else 0.0
        cat_rec = category_records.get(cat_name)
        color = cat_rec.color if cat_rec and cat_rec.color else "#64748B"
        category_breakdown.append(
            CategoryBreakdownItem(
                category_name=cat_name,
                amount=amt,
                percentage=pct,
                color=color,
                count=sum(1 for t in filtered_txs if t.category_name == cat_name and t.type == "Expense"),
            )
        )

    # 5. Income vs Expense (last 6 months or period)
    # Generate past 6 months list
    months_list = []
    base_date = today.replace(day=1)
    for i in range(5, -1, -1):
        m_date = (base_date - timedelta(days=i * 28)).replace(day=1)
        m_str = m_date.strftime("%Y-%m")
        if m_str not in months_list:
            months_list.append(m_str)

    income_vs_expense = []
    for m in months_list:
        m_start = datetime.strptime(m, "%Y-%m").date()
        m_next = (m_start.replace(day=28) + timedelta(days=4)).replace(day=1)
        m_end = m_next - timedelta(days=1)
        inc = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0))
            .filter(Transaction.type == "Income", Transaction.date >= m_start, Transaction.date <= m_end)
            .scalar()
        )
        exp = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0))
            .filter(Transaction.type == "Expense", Transaction.date >= m_start, Transaction.date <= m_end)
            .scalar()
        )
        inc_dec = Decimal(str(inc))
        exp_dec = Decimal(str(exp))
        # Format label like 'Oct 2026'
        m_label = m_start.strftime("%b %Y")
        income_vs_expense.append(
            MonthlyBarItem(
                month=m_label,
                income=inc_dec,
                expense=exp_dec,
                savings=inc_dec - exp_dec,
            )
        )

    # 6. Spending trends (daily points within selected filter range)
    daily_spending = {}
    for tx in filtered_txs:
        if tx.type == "Expense":
            d_str = tx.date.isoformat()
            daily_spending[d_str] = daily_spending.get(d_str, Decimal("0.00")) + tx.amount

    monthly_trends = [
        TrendPoint(date=d, amount=daily_spending[d], type="Expense")
        for d in sorted(daily_spending.keys())
    ]

    # 7. Recent Transactions (last 6)
    recent_txs = (
        db.query(Transaction)
        .order_by(Transaction.date.desc(), Transaction.id.desc())
        .limit(6)
        .all()
    )

    return DashboardSummary(
        total_income=Decimal(str(all_income)),
        total_expenses=Decimal(str(all_expense)),
        current_balance=current_balance,
        monthly_income=filtered_income,
        monthly_expenses=filtered_expenses,
        monthly_savings=monthly_savings,
        savings_rate=savings_rate,
        overall_budget=overall_budget_amount,
        overall_budget_spent=overall_budget_spent,
        overall_budget_percentage=overall_percentage,
        overall_budget_status=overall_status,
        category_breakdown=category_breakdown,
        income_vs_expense=income_vs_expense,
        monthly_trends=monthly_trends,
        recent_transactions=recent_txs,
    )


def get_budget_statuses(db: Session, target_month: str) -> List[BudgetStatus]:
    """Calculate budget spending for both overall and category budgets for a given month."""
    month_start = datetime.strptime(target_month, "%Y-%m").date()
    next_month = (month_start.replace(day=28) + timedelta(days=4)).replace(day=1)
    month_end = next_month - timedelta(days=1)

    budgets = db.query(Budget).filter(Budget.month == target_month).all()
    results = []

    for b in budgets:
        if b.category_id is None:
            # Overall budget
            spent = (
                db.query(func.coalesce(func.sum(Transaction.amount), 0))
                .filter(
                    Transaction.type == "Expense",
                    Transaction.date >= month_start,
                    Transaction.date <= month_end,
                )
                .scalar()
            )
            spent_dec = Decimal(str(spent))
            cat_label = "Overall Budget"
        else:
            # Category budget
            spent = (
                db.query(func.coalesce(func.sum(Transaction.amount), 0))
                .filter(
                    Transaction.type == "Expense",
                    Transaction.category_id == b.category_id,
                    Transaction.date >= month_start,
                    Transaction.date <= month_end,
                )
                .scalar()
            )
            spent_dec = Decimal(str(spent))
            cat_label = b.category_name or "Category"

        pct = float(round((spent_dec / b.amount) * 100, 1)) if b.amount > 0 else 0.0
        status = "normal"
        if pct >= 100:
            status = "exceeded"
        elif pct >= 80:
            status = "warning"

        results.append(
            BudgetStatus(
                id=b.id,
                month=b.month,
                category_id=b.category_id,
                category_name=cat_label,
                budgeted_amount=b.amount,
                spent_amount=spent_dec,
                remaining_amount=b.amount - spent_dec,
                percentage_used=pct,
                status=status,
            )
        )

    return results


def get_reports_data(
    db: Session,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
) -> ReportsData:
    query = db.query(Transaction)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)

    txs = query.order_by(Transaction.date.asc()).all()
    
    total_inc = sum((t.amount for t in txs if t.type == "Income"), Decimal("0.00"))
    total_exp = sum((t.amount for t in txs if t.type == "Expense"), Decimal("0.00"))
    net_savings = total_inc - total_exp
    savings_rate = float(round((net_savings / total_inc) * 100, 1)) if total_inc > 0 else 0.0

    # Category breakdown
    cat_totals = {}
    for tx in txs:
        if tx.type == "Expense":
            cat_totals[tx.category_name] = cat_totals.get(tx.category_name, Decimal("0.00")) + tx.amount

    category_records = {c.name: c for c in db.query(Category).all()}
    cat_breakdown = []
    for c_name, amt in sorted(cat_totals.items(), key=lambda x: x[1], reverse=True):
        pct = float(round((amt / total_exp) * 100, 1)) if total_exp > 0 else 0.0
        color = category_records.get(c_name).color if c_name in category_records and category_records[c_name].color else "#64748B"
        cat_breakdown.append(
            CategoryBreakdownItem(
                category_name=c_name,
                amount=amt,
                percentage=pct,
                color=color,
                count=sum(1 for t in txs if t.category_name == c_name and t.type == "Expense"),
            )
        )

    # Periodic summary (Daily / Weekly / Monthly grouping)
    monthly_groups = {}
    for tx in txs:
        m_key = tx.date.strftime("%Y-%m")
        if m_key not in monthly_groups:
            monthly_groups[m_key] = {"income": Decimal("0.00"), "expense": Decimal("0.00")}
        if tx.type == "Income":
            monthly_groups[m_key]["income"] += tx.amount
        else:
            monthly_groups[m_key]["expense"] += tx.amount

    periodic_summary = []
    for m_key in sorted(monthly_groups.keys(), reverse=True):
        inc = monthly_groups[m_key]["income"]
        exp = monthly_groups[m_key]["expense"]
        label = datetime.strptime(m_key, "%Y-%m").strftime("%b %Y")
        periodic_summary.append(
            PeriodicSummary(
                period="Month",
                label=label,
                income=inc,
                expense=exp,
                net=inc - exp,
            )
        )

    # Monthly bar items
    income_vs_expense = [
        MonthlyBarItem(
            month=datetime.strptime(m, "%Y-%m").strftime("%b %Y"),
            income=data["income"],
            expense=data["expense"],
            savings=data["income"] - data["expense"],
        )
        for m, data in sorted(monthly_groups.items())
    ]

    # Daily trends
    daily_groups = {}
    for tx in txs:
        if tx.type == "Expense":
            d_key = tx.date.isoformat()
            daily_groups[d_key] = daily_groups.get(d_key, Decimal("0.00")) + tx.amount

    daily_trends = [
        TrendPoint(date=d, amount=daily_groups[d], type="Expense")
        for d in sorted(daily_groups.keys())
    ]

    return ReportsData(
        total_income=total_inc,
        total_expenses=total_exp,
        net_savings=net_savings,
        savings_rate=savings_rate,
        category_breakdown=cat_breakdown,
        periodic_summary=periodic_summary,
        income_vs_expense=income_vs_expense,
        daily_trends=daily_trends,
    )


def export_transactions_csv(db: Session, start_date: Optional[date] = None, end_date: Optional[date] = None) -> str:
    query = db.query(Transaction)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)

    txs = query.order_by(Transaction.date.desc(), Transaction.id.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Transaction ID",
        "Date",
        "Description",
        "Type",
        "Category",
        "Amount (INR)",
        "Payment Method",
        "Notes"
    ])

    for tx in txs:
        writer.writerow([
            tx.id,
            tx.date.isoformat(),
            tx.description,
            tx.type,
            tx.category_name,
            f"{tx.amount:.2f}",
            tx.payment_method,
            tx.notes or "",
        ])

    return output.getvalue()

