import axios from 'axios';
import { API_ENDPOINTS } from '@/constants/api.constants';
import { authService } from '@/services/auth.service';

class HttpService {
  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.initializeInterceptors();
  }

  initializeInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        // Get session from auth service
        const session = authService.getStoredSession();
        if (session?.token) {
          config.headers.Authorization = `Bearer ${session.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => {
        // Handle specific error cases
        if (error.response?.status === 401) {
          // Clear session through auth service
          authService.clearSession();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic CRUD methods
  get(endpoint, params = {}) {
    return this.client.get(endpoint, { params });
  }

  post(endpoint, data = {}) {
    return this.client.post(endpoint, data);
  }

  put(endpoint, data = {}) {
    return this.client.put(endpoint, data);
  }

  delete(endpoint) {
    return this.client.delete(endpoint);
  }
}

export const httpService = new HttpService();
