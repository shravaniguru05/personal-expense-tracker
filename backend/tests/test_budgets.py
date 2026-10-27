from datetime import date
from decimal import Decimal


def test_create_and_retrieve_overall_budget(client):
    month = date.today().strftime("%Y-%m")
    payload = {
        "month": month,
        "amount": "20000.00",
        "category_id": None,
        "category_name": "Overall Budget"
    }
    response = client.post("/api/budgets", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert Decimal(str(data["amount"])) == Decimal("20000.00")

    # Get budget status
    get_res = client.get(f"/api/budgets?month={month}")
    assert get_res.status_code == 200
    statuses = get_res.json()
    assert len(statuses) >= 1
    overall = next(b for b in statuses if b["category_id"] is None)
    assert Decimal(str(overall["budgeted_amount"])) == Decimal("20000.00")
    assert overall["status"] == "normal"


def test_budget_warning_and_exceeded_thresholds(client):
    month = date.today().strftime("%Y-%m")
    # Set overall budget to 1,000
    client.post("/api/budgets", json={
        "month": month,
        "amount": "1000.00",
        "category_id": None,
        "category_name": "Overall Budget"
    })

    # Add expense of 850 (85% - should trigger warning)
    client.post("/api/transactions", json={
        "description": "Dinner party",
        "amount": "850.00",
        "type": "Expense",
        "category_name": "Food & Dining",
        "date": date.today().isoformat()
    })

    get_res = client.get(f"/api/budgets?month={month}")
    statuses = get_res.json()
    overall = next(b for b in statuses if b["category_id"] is None)
    assert overall["percentage_used"] == 85.0
    assert overall["status"] == "warning"

    # Add another expense of 200 (total 1050 > 1000 - should trigger exceeded)
    client.post("/api/transactions", json={
        "description": "Coffee and dessert",
        "amount": "200.00",
        "type": "Expense",
        "category_name": "Food & Dining",
        "date": date.today().isoformat()
    })

    get_res2 = client.get(f"/api/budgets?month={month}")
    overall2 = next(b for b in get_res2.json() if b["category_id"] is None)
    assert overall2["percentage_used"] == 105.0
    assert overall2["status"] == "exceeded"

