import api from './api';
import { ApiResponse } from '../types/auth.types';
import { AnnouncementItem, CreateAnnouncementForm } from '../types/announcement.types';

export const announcementService = {
  async getAnnouncements(): Promise<AnnouncementItem[]> {
    const response = await api.get<ApiResponse<AnnouncementItem[]>>('/announcements');
    return response.data.data || [];
  },

  async createAnnouncement(form: CreateAnnouncementForm): Promise<AnnouncementItem> {
    const response = await api.post<ApiResponse<AnnouncementItem>>('/announcements', form);
    return response.data.data!;
  },

  async deleteAnnouncement(id: number): Promise<void> {
    await api.delete(`/announcements/${id}`);
  },
};
