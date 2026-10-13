// Batch 3: Campus Groups

export type GroupType =
  | 'ACADEMIC'
  | 'PROJECT'
  | 'DEPARTMENT'
  | 'INSTITUTIONAL'
  | 'CLUB'
  | 'OTHER';

export type GroupMemberRole = 'ADMIN' | 'MEMBER';

export interface GroupMember {
  userId: number;
  fullName: string;
  role: string;           // system role: STUDENT, STAFF, HOD, ADMIN
  memberRole: GroupMemberRole;
  registerNumber?: string;
  employeeId?: string;
  departmentName?: string;
  joinedAt: string;
}

export interface GroupSummary {
  id: number;
  name: string;
  description?: string;
  groupType: GroupType;
  memberRole: GroupMemberRole;
  memberCount: number;
  unreadCount: number;
  latestMessagePreview?: string;
  latestMessageSenderName?: string;
  latestMessageAt?: string;
  createdAt: string;
}

export interface GroupDetail {
  id: number;
  name: string;
  description?: string;
  groupType: GroupType;
  currentUserRole: GroupMemberRole;
  createdByUserId: number;
  createdByName: string;
  createdAt: string;
  memberCount: number;
  members: GroupMember[];
}

export interface GroupMessage {
  id: number;
  groupId: number;
  senderUserId: number;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  groupType: GroupType;
}

export interface AddMemberRequest {
  userId?: number;
  registerNumber?: string;
  memberRole?: GroupMemberRole;
}

export interface SendMessageRequest {
  content: string;
}

export interface StudentSearchResult {
  userId: number;
  studentProfileId: number;
  fullName: string;
  registerNumber: string;
  departmentName: string;
  departmentCode: string;
  sectionName: string;
}
