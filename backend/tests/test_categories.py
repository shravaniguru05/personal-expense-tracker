def test_get_categories(client):
    response = client.get("/api/categories")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 10
    names = [c["name"] for c in data]
    assert "Food & Dining" in names
    assert "Salary" in names


def test_create_custom_category(client):
    payload = {
        "name": "Freelance Work",
        "type": "income",
        "icon": "Briefcase",
        "color": "#10B981"
    }
    response = client.post("/api/categories", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Freelance Work"
    assert data["type"] == "income"
    assert data["id"] is not None


def test_duplicate_category_rejected(client):
    payload = {
        "name": "Food & Dining",
        "type": "expense"
    }
    response = client.post("/api/categories", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"].lower()


def test_delete_category(client):
    # Create category first
    payload = {"name": "Test Cat", "type": "expense"}
    create_res = client.post("/api/categories", json=payload)
    cat_id = create_res.json()["id"]

    del_res = client.delete(f"/api/categories/{cat_id}")
    assert del_res.status_code == 204

    # Confirm it's gone
    res = client.get(f"/api/categories")
    names = [c["name"] for c in res.json()]
    assert "Test Cat" not in names
