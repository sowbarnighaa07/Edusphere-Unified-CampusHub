export interface StudentPredictionResponse {
  available: boolean;
  predictedSemesterScore?: number;
  semester?: number;
  academicYear?: string;
  currentIat1Average?: number;
  currentIat2Average?: number;
  currentAssignmentAverage?: number;
  currentAttendanceAverage?: number;
  previousSemesterScore?: number;
  message: string;
}
