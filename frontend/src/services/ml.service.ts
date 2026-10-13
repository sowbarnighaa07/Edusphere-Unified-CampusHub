import api from './api';
import { ApiResponse } from '../types/auth.types';
import { StudentPredictionResponse } from '../types/ml.types';

export const mlService = {
  // Phase 13: Student triggers own semester performance prediction
  async predictMySemesterPerformance(): Promise<StudentPredictionResponse> {
    const response = await api.post<ApiResponse<StudentPredictionResponse>>('/ml/predict');
    return response.data.data!;
  },

  // Phase 13: Staff/HOD/Admin triggers prediction for a student
  async predictStudentSemesterPerformance(studentProfileId: number): Promise<StudentPredictionResponse> {
    const response = await api.post<ApiResponse<StudentPredictionResponse>>(`/ml/predict/${studentProfileId}`);
    return response.data.data!;
  },
};
