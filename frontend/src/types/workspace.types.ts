export type WorkspaceType = 'NOTE' | 'TASK';

export interface WorkspaceItem {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: WorkspaceType;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceForm {
  title: string;
  content?: string;
  type: WorkspaceType;
}

export interface UpdateWorkspaceForm {
  title: string;
  content?: string;
  type?: WorkspaceType;
  isCompleted?: boolean;
}
