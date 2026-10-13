from pydantic import BaseModel, Field, model_validator
from typing import Optional

class PredictionRequest(BaseModel):
    semester: int = Field(..., ge=1, le=8, description="Target semester for prediction (1 to 8)")
    iat1: Optional[float] = Field(None, ge=0.0, le=50.0, description="IAT 1 score (0 to 50)")
    iat1_score: Optional[float] = Field(None, ge=0.0, le=50.0, description="Alias for iat1")
    iat2: Optional[float] = Field(None, ge=0.0, le=50.0, description="IAT 2 score (0 to 50)")
    iat2_score: Optional[float] = Field(None, ge=0.0, le=50.0, description="Alias for iat2")
    assignment: Optional[float] = Field(None, ge=0.0, le=25.0, description="Assignment score (0 to 25)")
    assignment_score: Optional[float] = Field(None, ge=0.0, le=25.0, description="Alias for assignment")
    attendance: Optional[float] = Field(None, ge=0.0, le=100.0, description="Attendance percentage (0 to 100)")
    attendance_percentage: Optional[float] = Field(None, ge=0.0, le=100.0, description="Alias for attendance")
    previous_semester_score: Optional[float] = Field(None, ge=0.0, le=100.0, description="Previous completed semester score (0 to 100, required for Sem 2+)")

    @model_validator(mode="after")
    def resolve_fields(self):
        # Resolve aliases
        if self.iat1 is None and self.iat1_score is not None:
            self.iat1 = self.iat1_score
        if self.iat2 is None and self.iat2_score is not None:
            self.iat2 = self.iat2_score
        if self.assignment is None and self.assignment_score is not None:
            self.assignment = self.assignment_score
        if self.attendance is None and self.attendance_percentage is not None:
            self.attendance = self.attendance_percentage

        # Validate mandatory continuous assessment fields
        if self.iat1 is None:
            raise ValueError("IAT 1 score is required (0 to 50).")
        if self.iat2 is None:
            raise ValueError("IAT 2 score is required (0 to 50).")
        if self.assignment is None:
            raise ValueError("Assignment score is required (0 to 25).")
        if self.attendance is None:
            raise ValueError("Attendance percentage is required (0 to 100).")

        # Validate previous semester score for Sem 2+
        if self.semester > 1 and self.previous_semester_score is None:
            raise ValueError(f"Previous semester score is required for Semester {self.semester} prediction.")

        return self


class PredictionResponse(BaseModel):
    predictedSemesterScore: float = Field(..., description="Predicted numerical semester score (0 to 100)")
    predicted_semester_score: float = Field(..., description="Snake_case alias for predictedSemesterScore")
    semester: int
    success: bool = True
    message: str = "Prediction calculated successfully."
