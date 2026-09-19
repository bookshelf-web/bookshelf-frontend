export type Role = 'reader' | 'buyer' | 'seller' | 'admin';

/** Roles a person can choose for themselves. `admin` is granted by the platform. */
export type SelfServiceRole = Exclude<Role, 'admin'>;

export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  roles?: SelfServiceRole[];
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
