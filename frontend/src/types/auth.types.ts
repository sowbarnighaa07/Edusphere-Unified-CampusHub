export type Role = 'STUDENT' | 'STAFF' | 'HOD' | 'ADMIN';

export type UserStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'INACTIVE';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface UserSummary {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  status: UserStatus;
  departmentName?: string;
  departmentCode?: string;
  departmentId?: number;
  sectionName?: string;
  sectionId?: number;
  registerNumber?: string;
  employeeId?: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: UserSummary;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp?: string;
}
