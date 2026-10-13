import api from './api';
import { ApiResponse } from '../types/auth.types';
import { LeaveRequestItem, ApplyLeaveForm, StaffLeaveReviewForm, LeaveStatus } from '../types/leave.types';

export const leaveService = {
  // Student
  async applyLeave(form: ApplyLeaveForm): Promise<LeaveRequestItem> {
    const formData = new FormData();
    formData.append('leaveType', form.leaveType);
    formData.append('fromDate', form.fromDate);
    formData.append('toDate', form.toDate);
    formData.append('reason', form.reason);
    if (form.attachment) {
      formData.append('attachment', form.attachment);
    }

    const response = await api.post<ApiResponse<LeaveRequestItem>>('/student/leave', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data!;
  },

  async getMyLeaves(): Promise<LeaveRequestItem[]> {
    const response = await api.get<ApiResponse<LeaveRequestItem[]>>('/student/leave');
    return response.data.data || [];
  },

  async cancelLeave(id: number): Promise<void> {
    await api.delete(`/student/leave/${id}`);
  },

  // Staff Stage-1 Review
  async getStaffAssignedLeaves(status?: LeaveStatus): Promise<LeaveRequestItem[]> {
    const response = await api.get<ApiResponse<LeaveRequestItem[]>>('/staff/leave', {
      params: status ? { status } : {},
    });
    return response.data.data || [];
  },

  async reviewLeaveStage1(id: number, form: StaffLeaveReviewForm): Promise<LeaveRequestItem> {
    const response = await api.put<ApiResponse<LeaveRequestItem>>(`/staff/leave/${id}/review`, form);
    return response.data.data!;
  },
};
