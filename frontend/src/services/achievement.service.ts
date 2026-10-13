import api from './api';
import { ApiResponse } from '../types/auth.types';
import {
  AchievementItem,
  SubmitAchievementForm,
  VerifyAchievementForm,
  AchievementStatus,
} from '../types/achievement.types';

export const achievementService = {
  // Student
  async submitAchievement(form: SubmitAchievementForm): Promise<AchievementItem> {
    const formData = new FormData();
    formData.append('category', form.category);
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('achievementDate', form.achievementDate);
    if (form.certificate) {
      formData.append('certificate', form.certificate);
    }

    const response = await api.post<ApiResponse<AchievementItem>>('/student/achievements', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data!;
  },

  async getMyAchievements(): Promise<AchievementItem[]> {
    const response = await api.get<ApiResponse<AchievementItem[]>>('/student/achievements');
    return response.data.data || [];
  },

  // Faculty / Staff
  async getDepartmentAchievements(status?: AchievementStatus): Promise<AchievementItem[]> {
    const response = await api.get<ApiResponse<AchievementItem[]>>('/staff/achievements', {
      params: status ? { status } : {},
    });
    return response.data.data || [];
  },

  async verifyAchievement(id: number, form: VerifyAchievementForm): Promise<AchievementItem> {
    const response = await api.put<ApiResponse<AchievementItem>>(`/staff/achievements/${id}/verify`, form);
    return response.data.data!;
  },

  // Campus Verified Showcase (Authenticated)
  async getVerifiedAchievements(): Promise<AchievementItem[]> {
    const response = await api.get<ApiResponse<AchievementItem[]>>('/achievements/verified');
    return response.data.data || [];
  },
};
