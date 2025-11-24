import { apiClient } from './client';
import { User } from '../../types/user';

export const authApi = {
  /**
   * Get the current authenticated user
   * @returns User object if authenticated
   * @throws Error if not authenticated
   */
  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<User>('/v1/me');
  },

  /**
   * Logout the current user
   */
  logout: async (): Promise<void> => {
    return apiClient.post<void>('/v1/auth/logout');
  },

  /**
   * Get the login URL (for reference, typically use window.location.href)
   */
  getLoginUrl: (): string => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    return `${apiBaseUrl}/v1/auth/login`;
  },
};
