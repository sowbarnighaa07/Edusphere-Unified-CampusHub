// ─── Existing (Step 1) ────────────────────────────────────────────────────────
export interface StaffClassSummary {
  teachingAssignmentId: number;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  sectionId: number;
  sectionName: string;
  semester: number;
  academicYear: string;
  enrolledStudentCount: number;
  classroomId?: number;
  classroomName?: string;
}

export interface StaffClassStudent {
  studentProfileId: number;
  registerNumber: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  attendancePercentage?: number;
  iat1Score?: number;
  iat2Score?: number;
  assignmentScore?: number;
}

// ─── Step 2: Classroom Details & Materials ────────────────────────────────────
export interface ClassroomDetail {
  classroomId: number;
  teachingAssignmentId: number;
  name: string;
  description?: string;
  isActive: boolean;
  subjectCode: string;
  subjectName: string;
  sectionName: string;
  departmentCode: string;
  semester: number;
  academicYear: string;
  materialCount: number;
  assignmentCount: number;
  enrolledStudentCount: number;
}

export interface ClassroomMaterial {
  id: number;
  classroomId: number;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  uploadedByName: string;
  createdAt: string;
}

// ─── Step 3: Assignments ─────────────────────────────────────────────────────
export interface StaffAssignment {
  id: number;
  teachingAssignmentId: number;
  subjectCode: string;
  subjectName: string;
  sectionName: string;
  title: string;
  description?: string;
  deadline: string;
  maxMarks: number;
  attachmentPath?: string;
  attachmentName?: string;
  createdAt: string;
  submissionCount: number;
}

// ─── Step 4: IAT & Attendance ─────────────────────────────────────────────────
export interface StudentAcademicRecord {
  studentProfileId: number;
  registerNumber: string;
  fullName: string;
  iat1Score?: number;
  iat2Score?: number;
  assignmentScore?: number;
  attendancePercentage?: number;
}

export type MarkField = 'iat1Score' | 'iat2Score' | 'assignmentScore' | 'attendancePercentage';

export interface StudentMarkEntry {
  studentProfileId: number;
  value: number | null;
}

export interface BatchMarkUpdateRequest {
  teachingAssignmentId: number;
  field: MarkField;
  entries: StudentMarkEntry[];
}

// ─── Step 5: Performance Analytics (Batch 4) ──────────────────────────────────
export interface StaffPerformanceOverview {
  teachingAssignmentId: number;
  subjectCode: string;
  subjectName: string;
  sectionName: string;
  departmentName: string;
  semester: number;
  academicYear: string;
  totalStudents: number;
  evaluatedIat1Count: number;
  averageIat1?: number;
  evaluatedIat2Count: number;
  averageIat2?: number;
  evaluatedAssignmentCount: number;
  averageAssignment?: number;
  averageAttendance?: number;
  attendanceDefaultersCount: number;
  highAttendanceCount: number;
  moderateAttendanceCount: number;
  studentRecords: StudentAcademicRecord[];
}

// ─── Step 6: Profile (Batch 5B) ───────────────────────────────────────────────
export interface StaffProfileData {
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
  dob?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  mobileNumber?: string;
  address?: string;
  createdAt: string;
}

export interface UpdateStaffProfileForm {
  mobileNumber?: string;
  address?: string;
  qualification?: string;
  dob?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

