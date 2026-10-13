import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "..", "model")
DATA_PATH = os.path.join(BASE_DIR, "sample_academic_data.csv")
MODEL_PATH = os.path.join(MODEL_DIR, "semester_performance_model.joblib")
SEM1_MODEL_PATH = os.path.join(MODEL_DIR, "semester1_rf_model.joblib")

def generate_sample_dataset(csv_path: str, n_samples: int = 2000):
    """
    Generates a structured sample demonstration dataset for training pipeline verification.
    NOTE: For genuine institutional deployment, replace with authoritative historical records.
    """
    np.random.seed(42)
    # IAT1 & IAT2: 0 to 50
    iat1 = np.random.uniform(15, 50, n_samples)
    iat2 = np.random.uniform(15, 50, n_samples)
    # Assignment: 0 to 25
    assignment = np.random.uniform(10, 25, n_samples)
    # Attendance: 50 to 100%
    attendance = np.random.uniform(50, 100, n_samples)
    # Previous semester score: 40 to 100% (for later semesters)
    previous_score = np.random.uniform(40, 100, n_samples)

    # Semester 1 target: Weighted continuous assessment scaled to 100
    # IAT1 (max 50) -> 35%, IAT2 (max 50) -> 35%, Assignment (max 25) -> 20%, Attendance (max 100) -> 10%
    sem1_score = (
        (iat1 / 50.0) * 35.0 +
        (iat2 / 50.0) * 35.0 +
        (assignment / 25.0) * 20.0 +
        (attendance / 100.0) * 10.0
    ) + np.random.normal(0, 1.5, n_samples)
    sem1_score = np.clip(sem1_score, 0.0, 100.0)

    # Semester 2+ target: Incorporates previous semester final score (25% weight)
    # Prev Score (100) -> 25%, IAT1 (50) -> 30%, IAT2 (50) -> 30%, Assignment (25) -> 10%, Attendance (100) -> 5%
    semN_score = (
        (previous_score / 100.0) * 25.0 +
        (iat1 / 50.0) * 30.0 +
        (iat2 / 50.0) * 30.0 +
        (assignment / 25.0) * 10.0 +
        (attendance / 100.0) * 5.0
    ) + np.random.normal(0, 1.2, n_samples)
    semN_score = np.clip(semN_score, 0.0, 100.0)

    df = pd.DataFrame({
        "iat1": np.round(iat1, 2),
        "iat2": np.round(iat2, 2),
        "assignment": np.round(assignment, 2),
        "attendance": np.round(attendance, 2),
        "previous_semester_score": np.round(previous_score, 2),
        "sem1_score": np.round(sem1_score, 2),
        "semester_score": np.round(semN_score, 2)
    })
    df.to_csv(csv_path, index=False)
    print(f"Sample demonstration dataset saved to: {csv_path}")
    return df

def train_models():
    os.makedirs(MODEL_DIR, exist_ok=True)

    if not os.path.exists(DATA_PATH):
        df = generate_sample_dataset(DATA_PATH)
    else:
        df = pd.read_csv(DATA_PATH)

    print("=== Training Semester 1 Random Forest Model ===")
    X_sem1 = df[["iat1", "iat2", "assignment", "attendance"]]
    y_sem1 = df["sem1_score"] if "sem1_score" in df.columns else df["semester_score"]

    X1_train, X1_test, y1_train, y1_test = train_test_split(X_sem1, y_sem1, test_size=0.2, random_state=42)
    rf_sem1 = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=8)
    rf_sem1.fit(X1_train, y1_train)

    y1_pred = rf_sem1.predict(X1_test)
    print(f"Sem 1 Test MAE: {mean_absolute_error(y1_test, y1_pred):.3f}")
    print(f"Sem 1 Test RMSE: {np.sqrt(mean_squared_error(y1_test, y1_pred)):.3f}")
    print(f"Sem 1 Test R²: {r2_score(y1_test, y1_pred):.3f}")

    joblib.dump(rf_sem1, SEM1_MODEL_PATH)
    print(f"Saved Sem 1 model to {SEM1_MODEL_PATH}")

    print("\n=== Training Semester 2+ Random Forest Model ===")
    X_semN = df[["previous_semester_score", "iat1", "iat2", "assignment", "attendance"]].copy()
    X_semN.rename(columns={"previous_semester_score": "prev_score"}, inplace=True)
    y_semN = df["semester_score"]

    XN_train, XN_test, yN_train, yN_test = train_test_split(X_semN, y_semN, test_size=0.2, random_state=42)
    rf_semN = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=8)
    rf_semN.fit(XN_train, yN_train)

    yN_pred = rf_semN.predict(XN_test)
    print(f"Sem N Test MAE: {mean_absolute_error(yN_test, yN_pred):.3f}")
    print(f"Sem N Test RMSE: {np.sqrt(mean_squared_error(yN_test, yN_pred)):.3f}")
    print(f"Sem N Test R²: {r2_score(yN_test, yN_pred):.3f}")

    joblib.dump(rf_semN, MODEL_PATH)
    print(f"Saved Sem N model to {MODEL_PATH}")

if __name__ == "__main__":
    train_models()
