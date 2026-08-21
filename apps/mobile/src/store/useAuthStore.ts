import { User } from '@lingualink/types';
import { authApi } from '../services/api/authApi';
import { storage } from '../services/storage/storage';

export interface AuthStoreState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export class AuthStore {
  private state: AuthStoreState = {
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  };

  private listeners: Array<() => void> = [];

  public getState(): AuthStoreState {
    return { ...this.state };
  }

  public setState(partial: Partial<AuthStoreState>) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public async loadStoredSession() {
    this.setState({ isLoading: true, error: null });
    try {
      const token = await storage.getItem('auth_token');
      if (token) {
        console.log('[AUTH] JWT received from storage');
        const res = await authApi.getMe();
        this.setState({
          token,
          user: res.user,
          isAuthenticated: true,
          isLoading: false,
        });
        console.log('[AUTH] Stored session restored for user:', res.user.displayName);
        return;
      }
    } catch (err: any) {
      console.warn('[AUTH] Restoring session failed:', err.message);
      await storage.removeItem('auth_token');
    }
    this.setState({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }

  public async login(email: string, password: string): Promise<boolean> {
    console.log('[AUTH] Login started');
    this.setState({ isLoading: true, error: null });
    try {
      const res = await authApi.login(email, password);
      console.log('[AUTH] JWT received');
      await storage.setItem('auth_token', res.token);
      this.setState({
        token: res.token,
        user: res.user,
        isAuthenticated: true,
        isLoading: false,
      });
      console.log('[AUTH] Login successful:', res.user.displayName);
      return true;
    } catch (err: any) {
      this.setState({
        isLoading: false,
        error: err.message || 'Login failed',
      });
      return false;
    }
  }

  public async logout() {
    await storage.removeItem('auth_token');
    this.setState({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    console.log('[AUTH] Logged out');
  }
}

export const authStore = new AuthStore();
