// API Configuration
// Matches the Flutter app's AppConstants

// Use for local development with DDEV
// For production, use environment variables
const API_URL = import.meta.env.VITE_API_URL || 'https://proman.ddev.site/mobile-api';

export const AppConstants = {
  // API Configuration
  apiUrl: API_URL,
  baseUrl: API_URL.replace('/mobile-api', ''),

  // App Information
  appName: 'PROMAN',
  appSubtitle: 'Property Management',

  // Colors (matching Flutter app)
  primaryColor: '#2196F3',
  secondaryColor: '#2196F3',

  // Storage Keys
  tokenKey: 'auth_token',
  userKey: 'user_data',

  // API Endpoints
  endpoints: {
    login: '/auth/login',
    logout: '/auth/logout',
    user: '/auth/user',
    workOrders: '/work-orders/my-work-orders',
    workOrderDetail: '/work-orders',
    inspections: '/inspections/my-inspections',
    inspectionDetail: '/inspections',
    blockIssueDetail: '/block-issues',
  }
};

export default AppConstants;

