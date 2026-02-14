import axios, { AxiosInstance, AxiosError } from 'axios';
import AppConstants from '../config/constants';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: AppConstants.apiUrl,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Note: We're using Bearer tokens, not cookies, so withCredentials is not needed
  // withCredentials: true, // Only needed if using cookies/sessions
  // Reject on 401 (redirect to login) and 5xx; accept 2xx and 4xx (except 401) for component handling
  validateStatus: (status) => (status >= 200 && status < 300) || (status >= 403 && status < 500),
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AppConstants.tokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle common errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error: AxiosError) => {
    console.error('API Error:', error.message);
    
    // Handle 401 unauthorized - redirect to login, preserve destination for post-login redirect
    if (error.response?.status === 401) {
      localStorage.removeItem(AppConstants.tokenKey);
      localStorage.removeItem(AppConstants.userKey);
      const currentPath = window.location.pathname + window.location.search;
      // Use URL param since window.location doesn't support state
      const redirect = currentPath && currentPath !== '/login' ? `?redirect=${encodeURIComponent(currentPath)}` : '';
      window.location.href = `/login${redirect}`;
    }
    
    return Promise.reject(error);
  }
);

export default api;




