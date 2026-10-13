import api from './api';
import { ApiResponse } from '../types/auth.types';
import {
  RegistrationDetail,
  UserManagementItem,
  CreateStaffForm,
  CreateHodForm,
  AuditLogItem,
  DepartmentDetail,
  CreateDepartmentForm,
  SectionDetail,
  CreateSectionForm,
  SubjectDetail,
  CreateSubjectForm,
  TeachingAssignmentDetail,
  CreateTeachingAssignmentForm,
  AdminMonitoringData,
  AdminReportsData,
  PagedResult,
  AdminProfileData,
} from '../types/admin.types';

export const adminService = {
  // Registrations
  async getPendingRegistrations(): Promise<RegistrationDetail[]> {
    const response = await api.get<ApiResponse<RegistrationDetail[]>>('/admin/registrations/pending');
    return response.data.data || [];
  },

  async approveRegistration(id: number): Promise<void> {
    await api.put(`/admin/registrations/${id}/approve`);
  },

  async rejectRegistration(id: number, remarks?: string): Promise<void> {
    await api.put(`/admin/registrations/${id}/reject`, { remarks });
  },

  // User Management
  async getAllUsers(role?: string, status?: string): Promise<UserManagementItem[]> {
    const params: Record<string, string> = {};
    if (role && role !== 'ALL') params.role = role;
    if (status && status !== 'ALL') params.status = status;
    const response = await api.get<ApiResponse<UserManagementItem[]>>('/admin/users', { params });
    return response.data.data || [];
  },

  async updateUserStatus(id: number, status: string): Promise<void> {
    await api.put(`/admin/users/${id}/status`, { status });
  },

  async createStaff(formData: CreateStaffForm): Promise<UserManagementItem> {
    const response = await api.post<ApiResponse<UserManagementItem>>('/admin/staff', formData);
    return response.data.data!;
  },

  async createHod(formData: CreateHodForm): Promise<UserManagementItem> {
    const response = await api.post<ApiResponse<UserManagementItem>>('/admin/hod', formData);
    return response.data.data!;
  },

  // Departments
  async getDepartments(): Promise<DepartmentDetail[]> {
    const response = await api.get<ApiResponse<DepartmentDetail[]>>('/admin/departments');
    return response.data.data || [];
  },

  async createDepartment(formData: CreateDepartmentForm): Promise<DepartmentDetail> {
    const response = await api.post<ApiResponse<DepartmentDetail>>('/admin/departments', formData);
    return response.data.data!;
  },

  async deleteDepartment(id: number): Promise<void> {
    await api.delete(`/admin/departments/${id}`);
  },

  // Sections
  async getSections(departmentId?: number): Promise<SectionDetail[]> {
    const params: Record<string, number> = {};
    if (departmentId) params.departmentId = departmentId;
    const response = await api.get<ApiResponse<SectionDetail[]>>('/admin/sections', { params });
    return response.data.data || [];
  },

  async createSection(formData: CreateSectionForm): Promise<SectionDetail> {
    const response = await api.post<ApiResponse<SectionDetail>>('/admin/sections', formData);
    return response.data.data!;
  },

  async deleteSection(id: number): Promise<void> {
    await api.delete(`/admin/sections/${id}`);
  },

  // Subjects
  async getSubjects(departmentId?: number, semester?: number): Promise<SubjectDetail[]> {
    const params: Record<string, number> = {};
    if (departmentId) params.departmentId = departmentId;
    if (semester) params.semester = semester;
    const response = await api.get<ApiResponse<SubjectDetail[]>>('/admin/subjects', { params });
    return response.data.data || [];
  },

  async createSubject(formData: CreateSubjectForm): Promise<SubjectDetail> {
    const response = await api.post<ApiResponse<SubjectDetail>>('/admin/subjects', formData);
    return response.data.data!;
  },

  async deleteSubject(id: number): Promise<void> {
    await api.delete(`/admin/subjects/${id}`);
  },

  // Teaching Assignments
  async getTeachingAssignments(staffId?: number): Promise<TeachingAssignmentDetail[]> {
    const params: Record<string, number> = {};
    if (staffId) params.staffId = staffId;
    const response = await api.get<ApiResponse<TeachingAssignmentDetail[]>>('/admin/teaching-assignments', { params });
    return response.data.data || [];
  },

  async createTeachingAssignment(formData: CreateTeachingAssignmentForm): Promise<TeachingAssignmentDetail> {
    const response = await api.post<ApiResponse<TeachingAssignmentDetail>>('/admin/teaching-assignments', formData);
    return response.data.data!;
  },

  async deleteTeachingAssignment(id: number): Promise<void> {
    await api.delete(`/admin/teaching-assignments/${id}`);
  },

  // Institution Monitoring
  async getCampusMonitoring(): Promise<AdminMonitoringData> {
    const response = await api.get<ApiResponse<AdminMonitoringData>>('/admin/monitoring');
    return response.data.data!;
  },

  // Institution Reports
  async getCampusReports(): Promise<AdminReportsData> {
    const response = await api.get<ApiResponse<AdminReportsData>>('/admin/reports');
    return response.data.data!;
  },

  // Filtered & Paged Audit Logs
  async getAuditLogs(params?: {
    role?: string;
    action?: string;
    ipAddress?: string;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
  }): Promise<PagedResult<AuditLogItem>> {
    const response = await api.get<ApiResponse<PagedResult<AuditLogItem>>>('/admin/audit-logs', { params });
    return response.data.data!;
  },

  // ─── Admin Profile (Batch 5D) ───────────────────────────────────────────────
  async getProfile(): Promise<AdminProfileData> {
    const response = await api.get<ApiResponse<AdminProfileData>>('/admin/profile');
    return response.data.data!;
  },
};

