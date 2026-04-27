import { api } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    Id: number;
    FirstName: string;
    LastName: string;
    Role: number;
  };
}

export interface MeResponse {
  authenticated: boolean;
  user: {
    Id: number | null;
    FirstName: string;
    LastName: string;
    Role: number;
  };
}

export const authAdapter = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    return response;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    return response;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('auth_token');
  },

  async me(): Promise<MeResponse> {
    return api.get<MeResponse>('/auth/me');
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password });
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
};
