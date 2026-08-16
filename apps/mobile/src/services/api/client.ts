import { ENV } from '../../config/env';
import { storage } from '../storage/storage';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export class ApiClient {
  private static async getHeaders(extraHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
    const token = await storage.getItem('auth_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...extraHeaders,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  public static async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getHeaders();
    try {
      const response = await fetch(`${ENV.API_URL}${endpoint}`, {
        method: 'GET',
        headers,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }
      return data as T;
    } catch (err: any) {
      if (err.message && err.message.includes('HTTP error')) throw err;
      throw new Error(`Cannot connect to backend server at ${ENV.API_URL}. Please verify backend is running on your PC.`);
    }
  }

  public static async post<T>(endpoint: string, body: any = {}): Promise<T> {
    const headers = await this.getHeaders();
    try {
      const response = await fetch(`${ENV.API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }
      return data as T;
    } catch (err: any) {
      if (err.message && (err.message.includes('HTTP error') || err.message.includes('Validation') || err.message.includes('Unauthorized') || err.message.includes('Invalid'))) {
        throw err;
      }
      throw new Error(`Cannot connect to backend server at ${ENV.API_URL}. Please verify backend is running on your PC.`);
    }
  }

  public static async patch<T>(endpoint: string, body: any = {}): Promise<T> {
    const headers = await this.getHeaders();
    try {
      const response = await fetch(`${ENV.API_URL}${endpoint}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }
      return data as T;
    } catch (err: any) {
      if (err.message && err.message.includes('HTTP error')) throw err;
      throw new Error(`Cannot connect to backend server at ${ENV.API_URL}. Please verify backend is running on your PC.`);
    }
  }

  public static async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getHeaders();
    try {
      const response = await fetch(`${ENV.API_URL}${endpoint}`, {
        method: 'DELETE',
        headers,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }
      return data as T;
    } catch (err: any) {
      if (err.message && err.message.includes('HTTP error')) throw err;
      throw new Error(`Cannot connect to backend server at ${ENV.API_URL}. Please verify backend is running on your PC.`);
    }
  }
}
