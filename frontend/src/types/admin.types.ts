import { Role, UserStatus } from './auth.types';

export interface RegistrationDetail {
  id: number;
  userId: number;
  email: string;
  fullName: string;
  registerNumber: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  sectionId: number;
  sectionName: string;
  enrollmentYear: number;
  expectedGraduationYear: number;
  status: UserStatus;
  submittedAt: string;
}

export interface UserManagementItem {
  id: number;
  email: string;
  role: Role;
  status: UserStatus;
  fullName: string;
  identifier?: string;
  departmentName?: string;
  departmentCode?: string;
  designation?: string;
  createdAt: string;
}

export interface CreateStaffForm {
  employeeId: string;
  fullName: string;
  email: string;
  password: string;
  departmentId: number;
  designation: string;
  qualification: string;
  joiningYear: number;
  mobileNumber?: string;
  address?: string;
}

export interface CreateHodForm {
  employeeId: string;
  fullName: string;
  email: string;
  password: string;
  departmentId: number;
  designation: string;
  qualification: string;
  joiningYear: number;
  startDate: string;
  mobileNumber?: string;
  address?: string;
}

export interface AuditLogItem {
  id: number;
  userId?: number;
  userEmail: string;
  userRole?: string;
  action: string;
  targetResource: string;
  targetId: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface CampusOverview {
  totalStudents: number;
  totalActiveFaculty: number;
  totalHods: number;
  totalDepartments: number;
  totalSections: number;
  totalSubjects: number;
  totalClassrooms: number;
  pendingRegistrations: number;
  pendingLeaveRequests: number;
  institutionAverageAttendance?: number;
}

export interface DepartmentMonitoringSummary {
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  studentCount: number;
  facultyCount: number;
  sectionCount: number;
  subjectCount: number;
  averageAttendance?: number;
  defaultersCount: number;
  pendingLeavesCount: number;
}

export interface DeptAttendanceStat {
  departmentCode: string;
  departmentName: string;
  averageAttendance?: number;
  recordsCount: number;
  defaultersCount: number;
}

export interface InstitutionAttendanceOverview {
  overallAverageAttendance?: number;
  totalAttendanceRecords: number;
  totalDefaulters: number;
  attendanceThreshold: number;
  departmentAverages: DeptAttendanceStat[];
}

export interface InstitutionAcademicPerformanceOverview {
  hasPerformanceData: boolean;
  statusMessage: string;
  totalEvaluatedRecords: number;
  averageIat1Score?: number;
  averageIat2Score?: number;
}

export interface SystemQueueOverview {
  pendingRegistrationsCount: number;
  pendingLeavesCount: number;
}

export interface AdminMonitoringData {
  campusOverview: CampusOverview;
  departmentSummaries: DepartmentMonitoringSummary[];
  attendanceOverview: InstitutionAttendanceOverview;
  performanceOverview: InstitutionAcademicPerformanceOverview;
  queueOverview: SystemQueueOverview;
}

export interface DepartmentDistributionItem {
  departmentCode: string;
  departmentName: string;
  count: number;
  percentage: number;
}

export interface SectionDistributionItem {
  departmentCode: string;
  sectionName: string;
  studentCount: number;
}

export interface DepartmentAttendanceReport {
  departmentCode: string;
  departmentName: string;
  averageAttendance?: number;
  totalRecords: number;
  defaultersCount: number;
}

export interface AdminReportsData {
  studentDistributionByDepartment: DepartmentDistributionItem[];
  facultyDistributionByDepartment: DepartmentDistributionItem[];
  sectionEnrollmentBreakdown: SectionDistributionItem[];
  departmentAttendanceComparison: DepartmentAttendanceReport[];
  userStatusBreakdown: Record<string, number>;
  leaveStatusBreakdown: Record<string, number>;
}

export interface PagedResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface DepartmentDetail {
  id: number;
  name: string;
  code: string;
  sectionCount: number;
  subjectCount: number;
  facultyCount: number;
  hodName: string;
}

export interface CreateDepartmentForm {
  name: string;
  code: string;
}

export interface SectionDetail {
  id: number;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  name: string;
  studentCount: number;
}

export interface CreateSectionForm {
  departmentId: number;
  name: string;
}

export interface SubjectDetail {
  id: number;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  code: string;
  name: string;
  semester: number;
  credits: number;
}

export interface CreateSubjectForm {
  departmentId: number;
  code: string;
  name: string;
  semester: number;
  credits: number;
}

export interface TeachingAssignmentDetail {
  id: number;
  staffId: number;
  staffName: string;
  employeeId: string;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  sectionId: number;
  sectionName: string;
  semester: number;
  academicYear: string;
  classroomId?: number;
  classroomName?: string;
}

export interface CreateTeachingAssignmentForm {
  staffId: number;
  subjectId: number;
  sectionId: number;
  semester: number;
  academicYear: string;
}

// ─── Admin Profile (Batch 5D) ─────────────────────────────────────────────────
export interface AdminProfileData {
  id: number;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  totalUsers: number;
  totalStudents: number;
  totalFaculty: number;
  totalDepartments: number;
  totalSubjects: number;
}

