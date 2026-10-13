import api from './api';
import { ApiResponse } from '../types/auth.types';
import {
  StudentProfileData,
  UpdateStudentProfileForm,
  StudentAcademicOverview,
  StudentAcademicHistory,
  StudentClassroom,
  StudentClassroomMaterial,
  StudentAssignment,
  StudentAssignmentSubmission,
  StudentPortfolio,
  UpdateStudentPortfolioRequest,
} from '../types/student.types';

export const studentService = {
  async getProfile(): Promise<StudentProfileData> {
    const response = await api.get<ApiResponse<StudentProfileData>>('/student/profile');
    return response.data.data!;
  },

  async updateProfile(formData: UpdateStudentProfileForm): Promise<StudentProfileData> {
    const response = await api.put<ApiResponse<StudentProfileData>>('/student/profile', formData);
    return response.data.data!;
  },

  async getCurrentAcademicOverview(): Promise<StudentAcademicOverview> {
    const response = await api.get<ApiResponse<StudentAcademicOverview>>('/student/academic/current');
    return response.data.data!;
  },

  // Phase 12: Full multi-semester academic history (own)
  async getAcademicHistory(): Promise<StudentAcademicHistory> {
    const response = await api.get<ApiResponse<StudentAcademicHistory>>('/student/academic/history');
    return response.data.data!;
  },

  // Phase 12: View a specific student's history (staff/hod/admin)
  async getStudentAcademicHistory(studentProfileId: number): Promise<StudentAcademicHistory> {
    const response = await api.get<ApiResponse<StudentAcademicHistory>>(`/student/${studentProfileId}/academic/history`);
    return response.data.data!;
  },

  // Batch 1: Student Virtual Classrooms
  async getClassrooms(): Promise<StudentClassroom[]> {
    const response = await api.get<ApiResponse<StudentClassroom[]>>('/student/classrooms');
    return response.data.data!;
  },

  async getClassroomMaterials(classroomId: number): Promise<StudentClassroomMaterial[]> {
    const response = await api.get<ApiResponse<StudentClassroomMaterial[]>>(`/student/classrooms/${classroomId}/materials`);
    return response.data.data!;
  },

  async downloadMaterial(classroomId: number, materialId: number, fileName: string): Promise<void> {
    const response = await api.get(`/student/classrooms/${classroomId}/materials/${materialId}/download`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || 'classroom-material');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Batch 2: Student Coursework Assignments
  async getAssignments(): Promise<StudentAssignment[]> {
    const response = await api.get<ApiResponse<StudentAssignment[]>>('/student/assignments');
    return response.data.data!;
  },

  async getAssignment(assignmentId: number): Promise<StudentAssignment> {
    const response = await api.get<ApiResponse<StudentAssignment>>(`/student/assignments/${assignmentId}`);
    return response.data.data!;
  },

  async getAssignmentSubmission(assignmentId: number): Promise<StudentAssignmentSubmission | null> {
    const response = await api.get<ApiResponse<StudentAssignmentSubmission>>(`/student/assignments/${assignmentId}/submission`);
    return response.data.data ?? null;
  },

  async submitAssignment(assignmentId: number, formData: FormData): Promise<StudentAssignmentSubmission> {
    const response = await api.post<ApiResponse<StudentAssignmentSubmission>>(
      `/student/assignments/${assignmentId}/submit`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data!;
  },

  async downloadAssignmentAttachment(assignmentId: number, fileName: string): Promise<void> {
    const response = await api.get(`/student/assignments/${assignmentId}/attachment/download`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || 'assignment-attachment');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async downloadStudentSubmission(assignmentId: number, fileName: string): Promise<void> {
    const response = await api.get(`/student/assignments/${assignmentId}/submission/download`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName || 'submission-file');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async getPortfolio(): Promise<StudentPortfolio> {
    const response = await api.get<ApiResponse<StudentPortfolio>>('/student/portfolio');
    return response.data.data!;
  },

  async updatePortfolio(data: UpdateStudentPortfolioRequest): Promise<StudentPortfolio> {
    const response = await api.put<ApiResponse<StudentPortfolio>>('/student/portfolio', data);
    return response.data.data!;
  },
};
