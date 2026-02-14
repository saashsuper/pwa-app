// API Configuration
// Matches the Flutter app's AppConstants

const PRODUCTION_API_URL = 'https://absolute.saashmagna.com/mobile-api';
const PRODUCTION_BASE_URL = 'https://absolute.saashmagna.com';
const DEV_API_URL = 'http://localhost:5173/mobile-api'; // Uses Vite proxy to backend

const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';

// API URL: dev uses local (proxy), production uses absolute.saashmagna.com
// Override with VITE_API_URL in .env
const getApiUrl = (): string => {
  const url = import.meta.env.VITE_API_URL;
  if (url && String(url).trim()) {
    const u = String(url).trim();
    return u.endsWith('/mobile-api') ? u : `${u.replace(/\/$/, '')}/mobile-api`;
  }
  return isDev ? DEV_API_URL : PRODUCTION_API_URL;
};

// Base URL: backend root for images/storage (always production URL)
// In dev, images still load from backend
const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_BASE_URL;
  if (url && String(url).trim()) {
    return String(url).trim().replace(/\/$/, '');
  }
  return PRODUCTION_BASE_URL;
};

const API_URL = getApiUrl();
const BASE_URL = getBaseUrl();

// Log API URL in development for debugging
if (isDev) {
  console.log('🌐 API URL:', API_URL);
  console.log('🏠 Base URL:', BASE_URL);
  console.log('🔧 Environment:', import.meta.env.MODE);
}

export const AppConstants = {
  // API Configuration
  apiUrl: API_URL,
  baseUrl: BASE_URL,

  // App Information
  appName: 'Absolute Property Management',
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
    updateFcmToken: '/auth/update-fcm-token',
    updatePushSubscription: '/auth/update-push-subscription',
    vapidPublicKey: '/auth/vapid-public-key',
    workOrders: '/work-orders/my-work-orders',
    workOrderDetail: '/work-orders',
    inspections: '/inspections/my-inspections',
    inspectionDetail: '/inspections',
    blockIssueDetail: '/block-issues',
    blocks: '/blocks',
    myBlocks: '/blocks/my-blocks',
    issues: '/block-issues',
    myIssues: '/block-issues/my-issues',
  }
};

export default AppConstants;

