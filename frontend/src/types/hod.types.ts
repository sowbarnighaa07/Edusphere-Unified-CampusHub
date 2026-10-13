export interface SectionSummary {
  sectionId: number;
  sectionName: string;
  studentCount: number;
}

export interface HodDepartmentOverview {
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  hodName: string;
  hodDesignation: string;
  hodEmployeeId: string;
  totalStudents: number;
  totalFaculty: number;
  totalSubjects: number;
  totalSections: number;
  pendingLeaveRequests: number;
  activeSemesters: number;
  sections: SectionSummary[];
}

export interface HodStudent {
  studentProfileId: number;
  registerNumber: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  sectionId?: number;
  sectionName: string;
  enrollmentYear: number;
  expectedGraduationYear: number;
  currentYear: number;
  overallAttendancePercentage?: number;
  totalSubjectsCount: number;
  status: string;
}

export interface FacultyTeachingAssignment {
  teachingAssignmentId: number;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  sectionId: number;
  sectionName: string;
  semester: number;
  academicYear: string;
  credits: number;
}

export interface HodFaculty {
  staffProfileId: number;
  employeeId: string;
  fullName: string;
  email: string;
  designation: string;
  qualification: string;
  joiningYear: number;
  mobileNumber?: string;
  assignedClassesCount: number;
  teachingAssignments: FacultyTeachingAssignment[];
}

export interface SubjectAttendanceStat {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  semester: number;
  totalRecords: number;
  averageAttendance: number;
  defaulterCount: number;
}

export interface AttendanceDefaulter {
  studentProfileId: number;
  registerNumber: string;
  studentName: string;
  sectionName: string;
  subjectCode: string;
  subjectName: string;
  semester: number;
  attendancePercentage: number;
}

export interface HodAttendanceAnalytics {
  departmentId: number;
  departmentCode: string;
  departmentAverageAttendance: number;
  totalEnrolledStudents: number;
  totalDefaultersCount: number;
  subjectStats: SubjectAttendanceStat[];
  defaulters: AttendanceDefaulter[];
}

export type LeaveType = 'MEDICAL' | 'ON_DUTY' | 'PERSONAL' | 'FAMILY';
export type LeaveStatus = 'PENDING_STAFF' | 'PENDING_HOD' | 'APPROVED' | 'REJECTED';

export interface HodLeaveReview {
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

export interface HodLeaveDecisionRequest {
  status: 'APPROVED' | 'REJECTED';
  remarks?: string;
}

// ─── Step 7: Profile (Batch 5C) ───────────────────────────────────────────────
export interface HodProfileData {
  id: number;
  userId: number;
  email: string;
  employeeId: string;
  fullName: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  designation: string;
  qualification: string;
  joiningYear: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  dob?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  mobileNumber?: string;
  address?: string;
  createdAt: string;
}

export interface UpdateHodProfileForm {
  mobileNumber?: string;
  address?: string;
  qualification?: string;
  dob?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

// ─── Step 8: Performance Analytics (Batch 5E) ─────────────────────────────────
export interface HodSubjectPerformance {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  semester: number;
  totalStudents: number;
  averageIat1?: number;
  averageIat2?: number;
  averageAssignment?: number;
  averageAttendance?: number;
  passPercentage?: number;
}

export interface HodSectionPerformance {
  sectionId: number;
  sectionName: string;
  semester?: number;
  studentCount: number;
  averageIat1?: number;
  averageIat2?: number;
  averageAttendance?: number;
}

export interface HodAcademicDefaulter {
  studentProfileId: number;
  registerNumber: string;
  studentName: string;
  sectionName: string;
  subjectCode: string;
  subjectName: string;
  iat1Score?: number;
  iat2Score?: number;
  attendancePercentage?: number;
}

export interface HodPerformanceOverview {
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  totalStudents: number;
  totalSubjects: number;
  overallAverageIat1?: number;
  overallAverageIat2?: number;
  overallAverageAssignment?: number;
  overallAverageAttendance?: number;
  totalDefaultersCount: number;
  subjectPerformances: HodSubjectPerformance[];
  sectionPerformances: HodSectionPerformance[];
  defaulters: HodAcademicDefaulter[];
}

// ─── Step 9: Department Reports (Batch 5F) ────────────────────────────────────
export interface FacultyWorkloadReport {
  staffProfileId: number;
  employeeId: string;
  fullName: string;
  designation: string;
  assignedClassesCount: number;
  totalStudents: number;
}

export interface HodReportsSummary {
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  generatedAt: string;
  totalStudents: number;
  totalFaculty: number;
  totalSections: number;
  totalSubjects: number;
  averageAttendance: number;
  attendanceDefaultersCount: number;
  averageIat1: number;
  averageIat2: number;
  totalAssignments: number;
  totalSubmissions: number;
  verifiedAchievementsCount: number;
  facultyWorkloads: FacultyWorkloadReport[];
  subjectPerformances: HodSubjectPerformance[];
}

