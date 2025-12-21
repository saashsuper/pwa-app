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
  // Don't reject on any status code - handle in components
  validateStatus: (status) => status < 500,
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
    
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem(AppConstants.tokenKey);
      localStorage.removeItem(AppConstants.userKey);
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;




