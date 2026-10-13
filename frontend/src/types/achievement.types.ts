export type AchievementCategory =
  | 'ACADEMIC'
  | 'COMPETITION'
  | 'CERTIFICATION'
  | 'NCC'
  | 'SPORTS'
  | 'OTHER';

export type AchievementStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface AchievementItem {
  id: number;
  studentProfileId: number;
  studentName: string;
  studentRegisterNumber: string;
  departmentName?: string;
  departmentCode?: string;
  sectionName?: string;
  category: AchievementCategory;
  title: string;
  description: string;
  achievementDate: string;
  certificatePath?: string;
  status: AchievementStatus;
  verifiedById?: number;
  verifiedByName?: string;
  verifiedAt?: string;
  remarks?: string;
  createdAt: string;
}

export interface SubmitAchievementForm {
  category: AchievementCategory;
  title: string;
  description: string;
  achievementDate: string;
  certificate?: File;
}

export interface VerifyAchievementForm {
  status: 'VERIFIED' | 'REJECTED';
  remarks?: string;
}
