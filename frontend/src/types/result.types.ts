export type ResultStatus = 'DRAFT' | 'VERIFIED' | 'PUBLISHED';

export interface SubjectDataSummary {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  credits: number;
  facultyName: string;
  recordedStudentsCount: number;
  totalStudentsCount: number;
  isComplete: boolean;
}

export interface MissingDataDetail {
  studentId: number;
  registerNumber: string;
  studentName: string;
  subjectCode: string;
  subjectName: string;
  missingFields: string[];
}

export interface SemesterAcademicVerification {
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  sectionId: number;
  sectionName: string;
  semester: number;
  academicYear: string;
  totalStudents: number;
  totalSubjects: number;
  expectedRecords: number;
  completedRecords: number;
  missingRecords: number;
  isReadyForGeneration: boolean;
  statusMessage: string;
  subjectSummaries: SubjectDataSummary[];
  missingRecordDetails: MissingDataDetail[];
}

export interface GenerateSemesterResultsForm {
  departmentId: number;
  sectionId: number;
  semester: number;
  academicYear: string;
}

export interface SemesterResultSummary {
  id: number;
  studentId: number;
  registerNumber: string;
  studentName: string;
  sectionId: number;
  sectionName: string;
  semester: number;
  academicYear: string;
  actualSemesterScore?: number;
  predictedSemesterScore?: number;
  grade?: string;
  status: ResultStatus;
  totalCredits?: number;
  creditsEarned?: number;
  verifiedAt?: string;
  verifiedByName?: string;
  publishedAt?: string;
  publishedByName?: string;
}

export interface VerifySemesterResultsForm {
  sectionId: number;
  semester: number;
  academicYear: string;
}

export interface PublishSemesterResultsForm {
  sectionId: number;
  semester: number;
  academicYear: string;
}

export interface SemesterTransitionForm {
  sectionId: number;
  fromSemester: number;
  toSemester: number;
  fromAcademicYear: string;
  toAcademicYear: string;
}

export interface SemesterTransitionResult {
  sectionId: number;
  sectionName: string;
  departmentName: string;
  transitionedStudentsCount: number;
  previousSemester: number;
  newSemester: number;
  previousAcademicYear: string;
  newAcademicYear: string;
  transitionedAt: string;
  statusMessage: string;
}
