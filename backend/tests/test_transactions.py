from datetime import date
from decimal import Decimal


def test_create_income_transaction(client):
    payload = {
        "description": "October Salary",
        "amount": "50000.00",
        "type": "Income",
        "category_name": "Salary",
        "date": date.today().isoformat(),
        "payment_method": "Bank Transfer",
        "notes": "Direct payroll deposit"
    }
    response = client.post("/api/transactions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["description"] == "October Salary"
    assert Decimal(str(data["amount"])) == Decimal("50000.00")
    assert data["type"] == "Income"
    assert data["id"] is not None


def test_create_expense_transaction(client):
    payload = {
        "description": "Grocery shopping",
        "amount": "2450.75",
        "type": "Expense",
        "category_name": "Food & Dining",
        "date": date.today().isoformat(),
        "payment_method": "UPI"
    }
    response = client.post("/api/transactions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["description"] == "Grocery shopping"
    assert Decimal(str(data["amount"])) == Decimal("2450.75")
    assert data["type"] == "Expense"


def test_negative_or_zero_amount_rejected(client):
    payload = {
        "description": "Invalid expense",
        "amount": "-50.00",
        "type": "Expense",
        "category_name": "Food & Dining"
    }
    response = client.post("/api/transactions", json=payload)
    assert response.status_code == 422


def test_transactions_pagination_and_filters(client):
    # Add 3 transactions
    today = date.today().isoformat()
    client.post("/api/transactions", json={"description": "Groceries A", "amount": "100.00", "type": "Expense", "category_name": "Food & Dining", "date": today})
    client.post("/api/transactions", json={"description": "Groceries B", "amount": "200.00", "type": "Expense", "category_name": "Food & Dining", "date": today})
    client.post("/api/transactions", json={"description": "Metro Pass", "amount": "50.00", "type": "Expense", "category_name": "Transportation", "date": today})

    # Search filter
    res = client.get("/api/transactions?search=Groceries")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2

    # Category filter
    res_cat = client.get("/api/transactions?category=Transportation")
    assert res_cat.status_code == 200
    assert res_cat.json()["total"] == 1


def test_delete_transaction(client):
    create_res = client.post("/api/transactions", json={
        "description": "Movie Ticket",
        "amount": "350.00",
        "type": "Expense",
        "category_name": "Entertainment"
    })
    tx_id = create_res.json()["id"]

    del_res = client.delete(f"/api/transactions/{tx_id}")
    assert del_res.status_code == 204

    # Confirm 404
    get_res = client.get(f"/api/transactions/{tx_id}")
    assert get_res.status_code == 404


def test_export_transactions_csv(client):
    client.post("/api/transactions", json={
        "description": "Freelance payment",
        "amount": "15000.00",
        "type": "Income",
        "category_name": "Salary"
    })
    res = client.get("/api/transactions/export/csv")
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "Freelance payment" in res.text
    assert "Transaction ID,Date,Description" in res.text

