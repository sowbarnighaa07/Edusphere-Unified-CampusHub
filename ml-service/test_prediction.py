import pytest
from fastapi.testclient import TestClient
from main import app
from schemas.prediction_schema import PredictionRequest

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["models_loaded"]["semester_1"] is True
    assert data["models_loaded"]["semester_2_plus"] is True

def test_sem1_prediction_valid():
    payload = {
        "semester": 1,
        "iat1": 40.0,
        "iat2": 42.0,
        "assignment": 18.0,
        "attendance": 88.0
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert 0.0 <= data["predictedSemesterScore"] <= 100.0
    assert data["semester"] == 1

def test_semN_prediction_valid():
    payload = {
        "semester": 3,
        "iat1": 42.0,
        "iat2": 44.0,
        "assignment": 18.0,
        "attendance": 90.0,
        "previous_semester_score": 82.0
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert 0.0 <= data["predictedSemesterScore"] <= 100.0
    assert data["semester"] == 3

def test_semN_missing_previous_score():
    payload = {
        "semester": 2,
        "iat1": 40.0,
        "iat2": 42.0,
        "assignment": 18.0,
        "attendance": 88.0
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422  # Unprocessable Entity (validation error)

def test_invalid_iat_score():
    payload = {
        "semester": 1,
        "iat1": 65.0,  # Max is 50
        "iat2": 40.0,
        "assignment": 18.0,
        "attendance": 88.0
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422

def test_invalid_attendance():
    payload = {
        "semester": 1,
        "iat1": 40.0,
        "iat2": 40.0,
        "assignment": 18.0,
        "attendance": 125.0  # Max is 100
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422

if __name__ == "__main__":
    test_health_check()
    test_sem1_prediction_valid()
    test_semN_prediction_valid()
    test_semN_missing_previous_score()
    test_invalid_iat_score()
    test_invalid_attendance()
    print("All ML service tests passed successfully!")
