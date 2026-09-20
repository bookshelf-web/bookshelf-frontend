import api from './api';
import type {
  AdminUser,
  AdminUserChanges,
  AdminUsersQuery,
  AdminUsersResponse,
} from '../types/admin';

export const adminUsersService = {
  async list(params: AdminUsersQuery = {}): Promise<AdminUsersResponse> {
    const response = await api.get<AdminUsersResponse>('/admin/users', { params });
    return response.data;
  },

  async update(id: string, changes: AdminUserChanges): Promise<AdminUser> {
    const response = await api.patch<{ user: AdminUser }>(`/admin/users/${id}`, changes);
    return response.data.user;
  },
};
