import api from './api';
import AppConstants from '../config/constants';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  is_active: boolean | number;
  email_verified_at?: string;
  user_type?: {
    id: number;
    name: string;
    description?: string;
  };
  contract_company?: {
    id: number;
    name: string;
    description?: string;
  } | null;
  roles?: Array<{
    id: number;
    name: string;
  }>;
  fcm_token?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  message?: string;
}

class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<{ token: string; user?: User }> {
    try {
      const response = await api.post<LoginResponse>(
        AppConstants.endpoints.login,
        credentials
      );

      if (response.data.success && response.data.token) {
        const token = response.data.token;

        // Save token
        localStorage.setItem(AppConstants.tokenKey, token);

        console.log('Login successful! Token saved:', token.substring(0, 20) + '...');

        // Fetch user data
        const user = await this.getCurrentUser();

        return { token, user: user || undefined };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  }

  /**
   * Logout - clear local storage
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint (optional - token will be invalidated server-side)
      await api.post(AppConstants.endpoints.logout).catch(() => {
        // Ignore errors on logout endpoint
      });
    } finally {
      // Always clear local storage
      localStorage.removeItem(AppConstants.tokenKey);
      localStorage.removeItem(AppConstants.userKey);
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem(AppConstants.tokenKey);

      if (!token) {
        return null;
      }

      const response = await api.get<User>(AppConstants.endpoints.user);

      if (response.status === 200 && response.data) {
        // Save user data to local storage
        localStorage.setItem(AppConstants.userKey, JSON.stringify(response.data));
        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Get user from local storage (cached)
   */
  getCachedUser(): User | null {
    try {
      const userStr = localStorage.getItem(AppConstants.userKey);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(AppConstants.tokenKey);
  }

  /**
   * Get auth token
   */
  getToken(): string | null {
    return localStorage.getItem(AppConstants.tokenKey);
  }

  /**
   * Update FCM token - deprecated, use updatePushSubscription for Web Push.
   */
  async updateFcmToken(_fcmToken: string | null): Promise<void> {
    // No-op: PWA uses Web Push (updatePushSubscription) instead
  }

  /**
   * Update push subscription for web push notifications.
   * Call after login when the user grants notification permission.
   * Pass the subscription object from navigator.serviceWorker.ready.then(reg => reg.pushManager.subscribe(...))
   */
  async updatePushSubscription(subscription: PushSubscription | null): Promise<void> {
    try {
      const token = localStorage.getItem(AppConstants.tokenKey);
      if (!token || !subscription) return;

      const payload = subscription.toJSON();
      await api.post(AppConstants.endpoints.updatePushSubscription, {
        endpoint: payload.endpoint,
        keys: payload.keys,
        contentEncoding: 'aesgcm',
      });
    } catch (error) {
      console.warn('Failed to update push subscription:', error);
    }
  }
}

export default new AuthService();




