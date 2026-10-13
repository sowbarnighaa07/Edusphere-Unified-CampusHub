import api from './api';
import { ApiResponse } from '../types/auth.types';
import { AcademicGuidanceResponse } from '../types/ai.types';

export const aiService = {
  // Phase 14: Authenticated student requests AI academic guidance
  async getAcademicGuidance(): Promise<AcademicGuidanceResponse> {
    const response = await api.post<ApiResponse<AcademicGuidanceResponse>>('/ai/academic-guidance');
    return response.data.data!;
  },

  // Phase 14: Staff/HOD/Admin requests AI guidance for a specific student
  async getStudentAcademicGuidance(studentProfileId: number): Promise<AcademicGuidanceResponse> {
    const response = await api.post<ApiResponse<AcademicGuidanceResponse>>(`/ai/academic-guidance/${studentProfileId}`);
    return response.data.data!;
  },
};
