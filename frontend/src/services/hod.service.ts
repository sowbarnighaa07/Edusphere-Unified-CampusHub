import api from './api';
import { ApiResponse } from '../types/auth.types';
import {
  HodDepartmentOverview,
  HodStudent,
  HodFaculty,
  HodAttendanceAnalytics,
  HodLeaveReview,
  HodLeaveDecisionRequest,
  LeaveStatus,
  HodProfileData,
  UpdateHodProfileForm,
  HodPerformanceOverview,
  HodReportsSummary,
} from '../types/hod.types';

export const hodService = {
  async getDepartmentOverview(departmentId?: number): Promise<HodDepartmentOverview> {
    const response = await api.get<ApiResponse<HodDepartmentOverview>>('/hod/department', {
      params: departmentId ? { departmentId } : {},
    });
    return response.data.data!;
  },

  async getDepartmentStudents(params?: {
    sectionId?: number;
    enrollmentYear?: number;
    departmentId?: number;
  }): Promise<HodStudent[]> {
    const response = await api.get<ApiResponse<HodStudent[]>>('/hod/students', { params });
    return response.data.data || [];
  },

  async getDepartmentFaculty(departmentId?: number): Promise<HodFaculty[]> {
    const response = await api.get<ApiResponse<HodFaculty[]>>('/hod/faculty', {
      params: departmentId ? { departmentId } : {},
    });
    return response.data.data || [];
  },

  async getAttendanceAnalytics(params?: {
    semester?: number;
    departmentId?: number;
  }): Promise<HodAttendanceAnalytics> {
    const response = await api.get<ApiResponse<HodAttendanceAnalytics>>('/hod/attendance', { params });
    return response.data.data!;
  },

  async getDepartmentLeaveRequests(params?: {
    status?: LeaveStatus;
    departmentId?: number;
  }): Promise<HodLeaveReview[]> {
    const response = await api.get<ApiResponse<HodLeaveReview[]>>('/hod/leave', { params });
    return response.data.data || [];
  },

  async decideLeaveRequest(
    leaveId: number,
    decision: HodLeaveDecisionRequest
  ): Promise<HodLeaveReview> {
    const response = await api.put<ApiResponse<HodLeaveReview>>(
      `/hod/leave/${leaveId}/decision`,
      decision
    );
    return response.data.data!;
  },

  // ─── Step 7: Profile (Batch 5C) ─────────────────────────────────────────────
  async getProfile(): Promise<HodProfileData> {
    const response = await api.get<ApiResponse<HodProfileData>>('/hod/profile');
    return response.data.data!;
  },

  async updateProfile(data: UpdateHodProfileForm): Promise<HodProfileData> {
    const response = await api.put<ApiResponse<HodProfileData>>('/hod/profile', data);
    return response.data.data!;
  },

  // ─── Step 8: Performance Analytics (Batch 5E) ───────────────────────────────
  async getPerformanceAnalytics(params?: { departmentId?: number }): Promise<HodPerformanceOverview> {
    const response = await api.get<ApiResponse<HodPerformanceOverview>>('/hod/performance', { params });
    return response.data.data!;
  },

  // ─── Step 9: Department Reports (Batch 5F) ──────────────────────────────────
  async getReportsSummary(params?: { departmentId?: number }): Promise<HodReportsSummary> {
    const response = await api.get<ApiResponse<HodReportsSummary>>('/hod/reports', { params });
    return response.data.data!;
  },
};

