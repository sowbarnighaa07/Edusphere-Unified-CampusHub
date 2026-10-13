import api from './api';
import { ApiResponse } from '../types/auth.types';
import {
  ExcelPreviewResponse,
  ExcelConfirmRequest,
  ExcelConfirmResult,
} from '../types/excel.types';

export const excelService = {
  /**
   * Phase A — Upload Excel, parse and validate server-side.
   * Returns a preview with per-row status. NOTHING is written to DB.
   */
  async preview(
    teachingAssignmentId: number,
    importType: string,
    file: File
  ): Promise<ExcelPreviewResponse> {
    const formData = new FormData();
    formData.append('teachingAssignmentId', String(teachingAssignmentId));
    formData.append('importType', importType);
    formData.append('file', file);

    const response = await api.post<ApiResponse<ExcelPreviewResponse>>(
      '/staff/excel/preview',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data!;
  },

  /**
   * Phase B — Confirm and commit valid rows to MySQL.
   * Only callable with a valid importToken from the preview step.
   */
  async confirm(request: ExcelConfirmRequest): Promise<ExcelConfirmResult> {
    const response = await api.post<ApiResponse<ExcelConfirmResult>>(
      '/staff/excel/confirm',
      request
    );
    return response.data.data!;
  },
};
