import api from './api';
import { ApiResponse, AuthResponse, UserSummary } from '../types/auth.types';

export const authService = {
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Login failed');
    }
    const authData = response.data.data;
    localStorage.setItem('edusphere_token', authData.token);
    localStorage.setItem('edusphere_user', JSON.stringify(authData.user));
    return authData;
  },

  async registerStudent(formData: {
    fullName: string;
    email: string;
    password: string;
    registerNumber: string;
    departmentId: number;
    sectionId: number;
    enrollmentYear: number;
    expectedGraduationYear: number;
  }): Promise<UserSummary> {
    const response = await api.post<ApiResponse<UserSummary>>('/auth/register', formData);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Registration failed');
    }
    return response.data.data;
  },

  async getCurrentUser(): Promise<UserSummary> {
    const response = await api.get<ApiResponse<UserSummary>>('/auth/me');
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch profile');
    }
    const user = response.data.data;
    localStorage.setItem('edusphere_user', JSON.stringify(user));
    return user;
  },

  logout(): void {
    localStorage.removeItem('edusphere_token');
    localStorage.removeItem('edusphere_user');
  },

  getStoredUser(): UserSummary | null {
    const userJson = localStorage.getItem('edusphere_user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as UserSummary;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('edusphere_token');
  }
};
