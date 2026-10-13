import os
import joblib
import pandas as pd
from schemas.prediction_schema import PredictionRequest, PredictionResponse

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "..", "model")
SEM1_MODEL_PATH = os.path.join(MODEL_DIR, "semester1_rf_model.joblib")
SEMN_MODEL_PATH = os.path.join(MODEL_DIR, "semester_performance_model.joblib")

class ModelService:
    def __init__(self):
        self.sem1_model = None
        self.semN_model = None
        self.load_models()

    def load_models(self):
        if not os.path.exists(SEM1_MODEL_PATH) or not os.path.exists(SEMN_MODEL_PATH):
            # If models not found on startup, trigger training
            from training.train_model import train_models
            train_models()

        if os.path.exists(SEM1_MODEL_PATH):
            self.sem1_model = joblib.load(SEM1_MODEL_PATH)
        else:
            raise FileNotFoundError(f"Model file not found at {SEM1_MODEL_PATH}")

        if os.path.exists(SEMN_MODEL_PATH):
            self.semN_model = joblib.load(SEMN_MODEL_PATH)
        else:
            raise FileNotFoundError(f"Model file not found at {SEMN_MODEL_PATH}")

    def predict(self, req: PredictionRequest) -> PredictionResponse:
        if req.semester == 1:
            if self.sem1_model is None:
                raise RuntimeError("Semester 1 model is not loaded.")
            features = pd.DataFrame([{
                "iat1": float(req.iat1),
                "iat2": float(req.iat2),
                "assignment": float(req.assignment),
                "attendance": float(req.attendance)
            }])
            raw_pred = float(self.sem1_model.predict(features)[0])
        else:
            if self.semN_model is None:
                raise RuntimeError("Semester N model is not loaded.")
            features = pd.DataFrame([{
                "prev_score": float(req.previous_semester_score),
                "iat1": float(req.iat1),
                "iat2": float(req.iat2),
                "assignment": float(req.assignment),
                "attendance": float(req.attendance)
            }])
            raw_pred = float(self.semN_model.predict(features)[0])

        # Clamping to valid 0 to 100 range
        clamped_score = round(max(0.0, min(100.0, raw_pred)), 2)

        return PredictionResponse(
            predictedSemesterScore=clamped_score,
            predicted_semester_score=clamped_score,
            semester=req.semester,
            success=True,
            message="Predicted semester performance score calculated via Random Forest Regressor."
        )
