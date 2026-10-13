export interface AcademicGuidanceResponse {
  available: boolean;
  summary?: string;
  strengths: string[];
  areasToFocus: string[];
  studySuggestions: string[];
  academicContextSummary?: string;
  message: string;
}
