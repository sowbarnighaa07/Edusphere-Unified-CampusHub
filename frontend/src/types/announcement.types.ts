export type AnnouncementScope = 'INSTITUTION' | 'DEPARTMENT' | 'CLASS';

export interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  scope: AnnouncementScope;
  departmentId?: number;
  departmentName?: string;
  departmentCode?: string;
  sectionId?: number;
  sectionName?: string;
  subjectId?: number;
  subjectCode?: string;
  subjectName?: string;
  createdById: number;
  authorEmail?: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
}

export interface CreateAnnouncementForm {
  title: string;
  content: string;
  scope: AnnouncementScope;
  departmentId?: number;
  sectionId?: number;
  subjectId?: number;
}
