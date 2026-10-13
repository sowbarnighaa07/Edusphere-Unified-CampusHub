from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from schemas.prediction_schema import PredictionRequest, PredictionResponse
from services.model_service import ModelService

app = FastAPI(
    title="EduSphere ML Prediction Service",
    description="Machine Learning service for Academic Semester Performance Prediction using Random Forest Regressor",
    version="2.0.0"
)

# CORS configuration for Spring Boot backend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://127.0.0.1:8080", "*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

model_service = ModelService()

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "service": "EduSphere ML Prediction Service",
        "status": "healthy",
        "model": "Random Forest Regressor (0-100 Semester Score)",
        "models_loaded": {
            "semester_1": model_service.sem1_model is not None,
            "semester_2_plus": model_service.semN_model is not None
        }
    }

@app.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_200_OK)
@app.post("/api/predict", response_model=PredictionResponse, status_code=status.HTTP_200_OK)
def predict_semester_score(request: PredictionRequest):
    try:
        return model_service.predict(request)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except FileNotFoundError as fe:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Model unavailable: {str(fe)}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
