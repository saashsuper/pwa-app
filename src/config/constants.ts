// API Configuration
// Matches the Flutter app's AppConstants

// Determine API URL based on environment
// Development: Use VITE_API_URL from .env.local or default to DDEV URL
// Production: Use VITE_API_URL from environment or default to production URL
const getApiUrl = (): string => {
  // Check if VITE_API_URL is explicitly set (highest priority)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check if we're in development mode
  if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
    // Default to DDEV local development URL with port 8443
    return 'https://proman.ddev.site:8443/mobile-api';
  }
  
  // Production fallback
  return 'https://saashmagna.com/mobile-api';
};

const API_URL = getApiUrl();

// Log API URL in development for debugging
if (import.meta.env.DEV) {
  console.log('🌐 API URL:', API_URL);
  console.log('🔧 Environment:', import.meta.env.MODE);
  console.log('📝 VITE_API_URL:', import.meta.env.VITE_API_URL || 'not set');
}

export const AppConstants = {
  // API Configuration
  apiUrl: API_URL,
  baseUrl: API_URL.replace('/mobile-api', ''),

  // App Information
  appName: 'APM Mobile',
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

