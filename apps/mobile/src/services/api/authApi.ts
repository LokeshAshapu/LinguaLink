import { ApiClient } from './client';
import { User, LanguageCode } from '@lingualink/types';

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    console.log('[AUTH] Logging in:', email);
    return ApiClient.post<AuthResponse>('/auth/login', { email, password });
  },

  async register(data: {
    email: string;
    password: string;
    displayName: string;
    nativeLanguage?: LanguageCode;
    preferredListeningLanguage?: LanguageCode;
    uiLanguage?: LanguageCode;
  }): Promise<AuthResponse> {
    console.log('[AUTH] Registering user:', data.email);
    return ApiClient.post<AuthResponse>('/auth/register', data);
  },

  async getMe(): Promise<{ user: User }> {
    return ApiClient.get<{ user: User }>('/auth/me');
  },
};
