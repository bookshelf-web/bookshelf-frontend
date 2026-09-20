import type { Role } from './auth';

export type UserStatus = 'active' | 'suspended';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AdminUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  status?: UserStatus;
}

export interface AdminUserChanges {
  name?: string;
  email?: string;
  roles?: Role[];
  status?: UserStatus;
}
