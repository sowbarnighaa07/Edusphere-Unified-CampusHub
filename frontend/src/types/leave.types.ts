export type LeaveType = 'MEDICAL' | 'ON_DUTY' | 'PERSONAL' | 'FAMILY';
export type LeaveStatus = 'PENDING_STAFF' | 'PENDING_HOD' | 'APPROVED' | 'REJECTED';

export interface LeaveRequestItem {
  id: number;
  studentProfileId: number;
  registerNumber: string;
  studentName: string;
  departmentName: string;
  sectionName: string;
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  reason: string;
  attachmentPath?: string;
  status: LeaveStatus;
  staffReviewerName?: string;
  staffRemarks?: string;
  staffReviewedAt?: string;
  hodReviewerName?: string;
  hodRemarks?: string;
  hodReviewedAt?: string;
  createdAt: string;
}

export interface ApplyLeaveForm {
  leaveType: LeaveType;
  fromDate: string;
  toDate: string;
  reason: string;
  attachment?: File;
}

export interface StaffLeaveReviewForm {
  status: 'PENDING_HOD' | 'REJECTED';
  remarks?: string;
}
