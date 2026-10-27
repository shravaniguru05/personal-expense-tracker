from datetime import date
from decimal import Decimal


def test_dashboard_summary_calculations(client):
    today = date.today().isoformat()
    # Income: 50,000
    client.post("/api/transactions", json={
        "description": "Salary",
        "amount": "50000.00",
        "type": "Income",
        "category_name": "Salary",
        "date": today
    })

    # Expenses: 15,000 and 5,000
    client.post("/api/transactions", json={
        "description": "Rent",
        "amount": "15000.00",
        "type": "Expense",
        "category_name": "Rent & Housing",
        "date": today
    })
    client.post("/api/transactions", json={
        "description": "Groceries",
        "amount": "5000.00",
        "type": "Expense",
        "category_name": "Food & Dining",
        "date": today
    })

    res = client.get("/api/dashboard/summary?filter_type=this_month")
    assert res.status_code == 200
    data = res.json()

    assert Decimal(str(data["total_income"])) == Decimal("50000.00")
    assert Decimal(str(data["total_expenses"])) == Decimal("20000.00")
    assert Decimal(str(data["current_balance"])) == Decimal("30000.00")  # 50,000 - 20,000
    assert Decimal(str(data["monthly_savings"])) == Decimal("30000.00")

    # Category breakdown check
    breakdown = data["category_breakdown"]
    assert len(breakdown) == 2
    rent_item = next(b for b in breakdown if b["category_name"] == "Rent & Housing")
    assert Decimal(str(rent_item["amount"])) == Decimal("15000.00")
    assert rent_item["percentage"] == 75.0  # 15000 / 20000 = 75%


def test_seed_demo_data(client):
    res = client.post("/api/dashboard/seed-demo")
    assert res.status_code == 200

    # Verify transactions exist
    tx_res = client.get("/api/transactions")
    assert tx_res.status_code == 200
    assert tx_res.json()["total"] > 0
