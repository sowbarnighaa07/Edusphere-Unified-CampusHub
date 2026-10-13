// ─── Phase 8: Excel Import Types ──────────────────────────────────────────────

export type ExcelImportType = 'ATTENDANCE' | 'IAT1' | 'IAT2';

export interface ExcelRowPreview {
  rowNumber: number;
  registerNumber: string;
  studentName: string;
  value: number | null;
  valid: boolean;
  errorReason: string | null;
  studentProfileId: number | null;
}

export interface ExcelPreviewResponse {
  importToken: string | null; // null if ALL rows are invalid (nothing to confirm)
  importType: ExcelImportType;
  teachingAssignmentId: number;
  subjectCode: string;
  subjectName: string;
  sectionName: string;
  semester: number;
  academicYear: string;
  fileName: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  hasErrors: boolean;
  rows: ExcelRowPreview[];
}

export interface ExcelConfirmRequest {
  importToken: string;
  teachingAssignmentId: number;
}

export interface ExcelConfirmResult {
  savedRows: number;
  skippedRows: number;
  importType: ExcelImportType;
  subjectCode: string;
  sectionName: string;
  academicYear: string;
}

export const IMPORT_TYPE_LABELS: Record<ExcelImportType, string> = {
  ATTENDANCE: 'Attendance Percentage',
  IAT1: 'IAT 1 Marks',
  IAT2: 'IAT 2 Marks',
};

export const IMPORT_TYPE_RANGE: Record<ExcelImportType, string> = {
  ATTENDANCE: '0 – 100%',
  IAT1: '0 – 50 marks',
  IAT2: '0 – 50 marks',
};
