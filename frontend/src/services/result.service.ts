import api from './api';
import { ApiResponse } from '../types/auth.types';
import {
  SemesterAcademicVerification,
  GenerateSemesterResultsForm,
  SemesterResultSummary,
  VerifySemesterResultsForm,
  PublishSemesterResultsForm,
  SemesterTransitionForm,
  SemesterTransitionResult,
} from '../types/result.types';

export const resultService = {
  async verifyAcademicData(
    departmentId: number,
    sectionId: number,
    semester: number,
    academicYear: string
  ): Promise<SemesterAcademicVerification> {
    const response = await api.get<ApiResponse<SemesterAcademicVerification>>('/admin/results/verify-data', {
      params: { departmentId, sectionId, semester, academicYear },
    });
    return response.data.data!;
  },

  async getSectionResults(
    sectionId: number,
    semester: number,
    academicYear: string
  ): Promise<SemesterResultSummary[]> {
    const response = await api.get<ApiResponse<SemesterResultSummary[]>>('/admin/results/section', {
      params: { sectionId, semester, academicYear },
    });
    return response.data.data || [];
  },

  async generateResults(formData: GenerateSemesterResultsForm): Promise<SemesterResultSummary[]> {
    const response = await api.post<ApiResponse<SemesterResultSummary[]>>('/admin/results/generate', formData);
    return response.data.data || [];
  },

  async verifyResults(formData: VerifySemesterResultsForm): Promise<SemesterResultSummary[]> {
    const response = await api.post<ApiResponse<SemesterResultSummary[]>>('/admin/results/verify', formData);
    return response.data.data || [];
  },

  async publishResults(formData: PublishSemesterResultsForm): Promise<SemesterResultSummary[]> {
    const response = await api.post<ApiResponse<SemesterResultSummary[]>>('/admin/results/publish', formData);
    return response.data.data || [];
  },

  async executeTransition(formData: SemesterTransitionForm): Promise<SemesterTransitionResult> {
    const response = await api.post<ApiResponse<SemesterTransitionResult>>('/admin/results/transition', formData);
    return response.data.data!;
  },
};
