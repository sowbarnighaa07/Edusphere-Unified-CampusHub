import { Gender, UserStatus } from './auth.types';

export interface StudentProfileData {
  id: number;
  userId: number;
  email: string;
  registerNumber: string;
  fullName: string;
  gender?: Gender;
  dob?: string;
  mobileNumber?: string;
  alternateMobileNumber?: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  sectionId: number;
  sectionName: string;
  enrollmentYear: number;
  expectedGraduationYear: number;
  currentYear: number;
  currentSemester: number;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  emergencyContactName?: string;
  emergencyContactMobile?: string;
  emergencyRelationship?: string;
  status: UserStatus;
  createdAt: string;
}

export interface UpdateStudentProfileForm {
  gender?: Gender;
  dob?: string;
  mobileNumber?: string;
  alternateMobileNumber?: string;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  emergencyContactName?: string;
  emergencyContactMobile?: string;
  emergencyRelationship?: string;
}

export interface StudentEnrolledSubject {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  semester: number;
  credits: number;
  teachingAssignmentId?: number;
  facultyName?: string;
  facultyEmail?: string;
  classroomId?: number;
  classroomName?: string;
  attendancePercentage?: number;
  iat1Score?: number;
  iat2Score?: number;
  assignmentScore?: number;
  finalScore?: number;
  grade?: string;
  result?: 'PASS' | 'RA' | string;
  creditsEarned?: number;
}

export interface StudentAcademicOverview {
  registerNumber: string;
  fullName: string;
  departmentName: string;
  departmentCode: string;
  sectionName: string;
  currentSemester: number;
  currentYear: number;
  academicYear: string;
  totalCredits: number;
  averageAttendancePercentage?: number;
  subjects: StudentEnrolledSubject[];
}

// Phase 12 & Phase 16: Multi-semester academic history & official results types
export type ResultLifecycleStatus = 'DRAFT' | 'VERIFIED' | 'PUBLISHED';

export interface SemesterHistory {
  semester: number;
  academicYear: string;
  totalCredits: number;
  creditsEarned?: number;
  averageAttendancePercentage?: number;
  actualSemesterScore?: number;
  predictedSemesterScore?: number;
  grade?: string;
  status?: ResultLifecycleStatus;
  publishedAt?: string;
  subjects: StudentEnrolledSubject[];
}

export interface StudentAcademicHistory {
  studentProfileId: number;
  registerNumber: string;
  fullName: string;
  departmentCode: string;
  departmentName: string;
  sectionName: string;
  enrollmentYear: number;
  currentYear: number;
  currentSemester: number;
  totalCreditsEarned: number;
  cumulativeAverageAttendance?: number;
  completedSemestersCount: number;
  semesters: SemesterHistory[];
}

// Batch 1: Student Virtual Classrooms
export interface StudentClassroom {
  classroomId: number;
  teachingAssignmentId: number;
  name: string;
  description?: string;
  isActive: boolean;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
  semester: number;
  academicYear: string;
  sectionId: number;
  sectionName: string;
  departmentCode: string;
  departmentName: string;
  facultyName: string;
  facultyEmail: string;
  materialCount: number;
  assignmentCount: number;
}

export interface StudentClassroomMaterial {
  id: number;
  classroomId: number;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  uploadedByName?: string;
  createdAt: string;
}

// Batch 2: Student Coursework Assignments
export type SubmissionStatus = 'SUBMITTED' | 'EVALUATED' | 'LATE';

export interface StudentAssignment {
  id: number;
  teachingAssignmentId: number;
  title: string;
  description?: string;
  deadline: string;
  maxMarks: number;
  attachmentPath?: string;
  attachmentName?: string;
  createdAt: string;

  subjectId: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
  semester: number;
  academicYear: string;
  sectionId: number;
  sectionName: string;
  departmentCode: string;
  departmentName: string;

  facultyName: string;
  facultyEmail: string;

  submissionId?: number;
  submissionDate?: string;
  submissionFileName?: string;
  submissionFilePath?: string;
  submissionRemarks?: string;
  marksObtained?: number;
  submissionStatus?: SubmissionStatus;
  feedback?: string;
  evaluatedAt?: string;
  evaluatedByName?: string;
  isSubmitted: boolean;
  isEvaluated: boolean;
  isLate: boolean;
}

export interface StudentAssignmentSubmission {
  id: number;
  assignmentId: number;
  studentProfileId: number;
  submissionDate: string;
  fileName?: string;
  filePath?: string;
  remarks?: string;
  marksObtained?: number;
  status: SubmissionStatus;
  feedback?: string;
  evaluatedAt?: string;
  evaluatedByName?: string;
}

export interface StudentPortfolio {
  studentProfileId: number;
  registerNumber: string;
  fullName: string;
  email: string;
  departmentName: string;
  departmentCode: string;
  sectionName: string;
  enrollmentYear: number;
  expectedGraduationYear: number;
  about?: string;
  skills?: string;
  projects?: string;
  careerObjective?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  verifiedAchievements?: Array<{
    id: number;
    category: string;
    title: string;
    description: string;
    achievementDate: string;
    certificatePath?: string;
    status: string;
    verifiedByName?: string;
  }>;
}

export interface UpdateStudentPortfolioRequest {
  about?: string;
  skills?: string;
  projects?: string;
  careerObjective?: string;
  githubUrl?: string;
  linkedinUrl?: string;
}




