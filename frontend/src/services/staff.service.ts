import api from './api';
import { ApiResponse } from '../types/auth.types';
import {
  StaffClassSummary,
  StaffClassStudent,
  ClassroomDetail,
  ClassroomMaterial,
  StaffAssignment,
  StudentAcademicRecord,
  BatchMarkUpdateRequest,
  StaffPerformanceOverview,
  StaffProfileData,
  UpdateStaffProfileForm,
} from '../types/staff.types';

export const staffService = {
  // ─── Step 1: My Classes ─────────────────────────────────────────────────────
  async getAssignedClasses(): Promise<StaffClassSummary[]> {
    const response = await api.get<ApiResponse<StaffClassSummary[]>>('/staff/classes');
    return response.data.data || [];
  },

  async getEnrolledStudents(teachingAssignmentId: number): Promise<StaffClassStudent[]> {
    const response = await api.get<ApiResponse<StaffClassStudent[]>>(`/staff/classes/${teachingAssignmentId}/students`);
    return response.data.data || [];
  },

  // ─── Step 2: Classroom Details & Materials ───────────────────────────────────
  async getClassroomDetails(teachingAssignmentId: number): Promise<ClassroomDetail> {
    const response = await api.get<ApiResponse<ClassroomDetail>>(`/staff/classrooms/${teachingAssignmentId}`);
    return response.data.data!;
  },

  async getMaterials(teachingAssignmentId: number): Promise<ClassroomMaterial[]> {
    const response = await api.get<ApiResponse<ClassroomMaterial[]>>(`/staff/classrooms/${teachingAssignmentId}/materials`);
    return response.data.data || [];
  },

  async uploadMaterial(teachingAssignmentId: number, formData: FormData): Promise<ClassroomMaterial> {
    const response = await api.post<ApiResponse<ClassroomMaterial>>(
      `/staff/classrooms/${teachingAssignmentId}/materials`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data!;
  },

  async deleteMaterial(materialId: number): Promise<void> {
    await api.delete(`/staff/classrooms/materials/${materialId}`);
  },

  // ─── Step 3: Assignments ────────────────────────────────────────────────────
  async getAssignments(teachingAssignmentId: number): Promise<StaffAssignment[]> {
    const response = await api.get<ApiResponse<StaffAssignment[]>>(`/staff/assignments/${teachingAssignmentId}`);
    return response.data.data || [];
  },

  async createAssignment(formData: FormData): Promise<StaffAssignment> {
    const response = await api.post<ApiResponse<StaffAssignment>>(
      `/staff/assignments`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data!;
  },

  async deleteAssignment(assignmentId: number): Promise<void> {
    await api.delete(`/staff/assignments/${assignmentId}`);
  },

  // ─── Step 4: IAT & Attendance ───────────────────────────────────────────────
  async getAcademicRecords(teachingAssignmentId: number): Promise<StudentAcademicRecord[]> {
    const response = await api.get<ApiResponse<StudentAcademicRecord[]>>(`/staff/marks/${teachingAssignmentId}`);
    return response.data.data || [];
  },

  async batchUpdateMarks(request: BatchMarkUpdateRequest): Promise<void> {
    await api.post('/staff/marks/batch', request);
  },

  // ─── Step 5: Performance Analytics (Batch 4) ───────────────────────────────
  async getPerformanceAnalytics(teachingAssignmentId: number): Promise<StaffPerformanceOverview> {
    const response = await api.get<ApiResponse<StaffPerformanceOverview>>(`/staff/performance/${teachingAssignmentId}`);
    return response.data.data!;
  },

  // ─── Step 6: Profile (Batch 5B) ─────────────────────────────────────────────
  async getProfile(): Promise<StaffProfileData> {
    const response = await api.get<ApiResponse<StaffProfileData>>('/staff/profile');
    return response.data.data!;
  },

  async updateProfile(data: UpdateStaffProfileForm): Promise<StaffProfileData> {
    const response = await api.put<ApiResponse<StaffProfileData>>('/staff/profile', data);
    return response.data.data!;
  },
};

