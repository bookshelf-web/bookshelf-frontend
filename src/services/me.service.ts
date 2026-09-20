import api from './api';
import type { AuthResponse, SelfServiceRole, User } from '../types/auth';
import type { Company } from '../types/company';

export const meService = {
  async getProfile(): Promise<{ user: User; companies: Company[] }> {
    const response = await api.get<{ user: User; companies: Company[] }>('/me');
    return response.data;
  },

  async updateProfile(name: string): Promise<AuthResponse> {
    const response = await api.patch<AuthResponse>('/me/profile', { name });
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.patch('/me/password', { currentPassword, newPassword });
  },

  /** Adds/removes roles. The response carries a fresh token because roles live in the JWT. */
  async updateRoles(change: { add?: SelfServiceRole[]; remove?: SelfServiceRole[] }): Promise<AuthResponse> {
    const response = await api.patch<AuthResponse>('/me/roles', change);
    return response.data;
  },
};
