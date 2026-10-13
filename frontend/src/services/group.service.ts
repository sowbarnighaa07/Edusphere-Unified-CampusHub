import api from './api';
import { ApiResponse } from '../types/auth.types';
import {
  GroupSummary,
  GroupDetail,
  GroupMessage,
  GroupMember,
  CreateGroupRequest,
  AddMemberRequest,
  SendMessageRequest,
  StudentSearchResult,
} from '../types/group.types';

export const groupService = {
  // ─── Group List ────────────────────────────────────────────────────────────

  async getMyGroups(): Promise<GroupSummary[]> {
    const response = await api.get<ApiResponse<GroupSummary[]>>('/groups');
    return response.data.data!;
  },

  // ─── Group Detail ──────────────────────────────────────────────────────────

  async getGroupDetail(groupId: number): Promise<GroupDetail> {
    const response = await api.get<ApiResponse<GroupDetail>>(`/groups/${groupId}`);
    return response.data.data!;
  },

  // ─── Create Group ──────────────────────────────────────────────────────────

  async createGroup(request: CreateGroupRequest): Promise<GroupDetail> {
    const response = await api.post<ApiResponse<GroupDetail>>('/groups', request);
    return response.data.data!;
  },

  // ─── Members ───────────────────────────────────────────────────────────────

  async addMember(groupId: number, request: AddMemberRequest): Promise<GroupMember> {
    const response = await api.post<ApiResponse<GroupMember>>(
      `/groups/${groupId}/members`,
      request
    );
    return response.data.data!;
  },

  async removeMember(groupId: number, userId: number): Promise<void> {
    await api.delete(`/groups/${groupId}/members/${userId}`);
  },

  async leaveGroup(groupId: number): Promise<void> {
    await api.delete(`/groups/${groupId}/leave`);
  },

  // ─── Messages ──────────────────────────────────────────────────────────────

  async getMessages(groupId: number): Promise<GroupMessage[]> {
    const response = await api.get<ApiResponse<GroupMessage[]>>(
      `/groups/${groupId}/messages`
    );
    return response.data.data!;
  },

  async sendMessage(groupId: number, request: SendMessageRequest): Promise<GroupMessage> {
    const response = await api.post<ApiResponse<GroupMessage>>(
      `/groups/${groupId}/messages`,
      request
    );
    return response.data.data!;
  },

  async markAsRead(groupId: number): Promise<void> {
    await api.put(`/groups/${groupId}/read`);
  },

  // ─── Student Search ────────────────────────────────────────────────────────

  async searchStudent(registerNumber: string): Promise<StudentSearchResult> {
    const response = await api.get<ApiResponse<StudentSearchResult>>(
      `/groups/students/search`,
      { params: { registerNumber } }
    );
    return response.data.data!;
  },
};
