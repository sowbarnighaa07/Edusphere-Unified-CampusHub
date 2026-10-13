import api from './api';
import { ApiResponse } from '../types/auth.types';
import {
  WorkspaceItem,
  CreateWorkspaceForm,
  UpdateWorkspaceForm,
  WorkspaceType,
} from '../types/workspace.types';

export const workspaceService = {
  async getMyDocuments(type?: WorkspaceType): Promise<WorkspaceItem[]> {
    const response = await api.get<ApiResponse<WorkspaceItem[]>>('/workspace', {
      params: type ? { type } : {},
    });
    return response.data.data || [];
  },

  async createDocument(form: CreateWorkspaceForm): Promise<WorkspaceItem> {
    const response = await api.post<ApiResponse<WorkspaceItem>>('/workspace', form);
    return response.data.data!;
  },

  async updateDocument(id: number, form: UpdateWorkspaceForm): Promise<WorkspaceItem> {
    const response = await api.put<ApiResponse<WorkspaceItem>>(`/workspace/${id}`, form);
    return response.data.data!;
  },

  async toggleTask(id: number): Promise<WorkspaceItem> {
    const response = await api.put<ApiResponse<WorkspaceItem>>(`/workspace/${id}/toggle`);
    return response.data.data!;
  },

  async deleteDocument(id: number): Promise<void> {
    await api.delete(`/workspace/${id}`);
  },
};
