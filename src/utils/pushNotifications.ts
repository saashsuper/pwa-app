/**
 * Web Push Notifications - registers push subscription with the backend.
 * Call after login when the user grants notification permission.
 */

import api from '../services/api';
import AppConstants from '../config/constants';

/**
 * Convert base64 URL-safe to Uint8Array for push subscription
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Register the push service worker (call once on app init).
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.register('/sw-push.js', { scope: '/' });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (error) {
    console.warn('Service worker registration failed:', error);
    return null;
  }
}

/**
 * Request notification permission and subscribe to push.
 * Call after user logs in (e.g. from dashboard or after login redirect).
 */
export async function registerPushSubscription(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported');
    return false;
  }

  // Ensure service worker is registered
  const reg = await registerServiceWorker();
  if (!reg) return false;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return false;
  }

  try {
    // Get VAPID public key from backend
    const keyResponse = await api.get<{ publicKey: string }>(AppConstants.endpoints.vapidPublicKey);
    const publicKey = keyResponse.data?.publicKey;
    if (!publicKey) {
      console.warn('VAPID public key not found');
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    // subscription.toJSON() returns { endpoint, keys: { p256dh, auth } } - backend expects this format
    const payload = subscription.toJSON();
    await api.post(AppConstants.endpoints.updatePushSubscription, {
      endpoint: payload.endpoint,
      keys: payload.keys,
      contentEncoding: 'aesgcm',
    });

    return true;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return false;
  }
}

/**
 * Unsubscribe from push (call on logout)
 */
export async function unsubscribePush(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
    }
  } catch (error) {
    console.warn('Push unsubscribe failed:', error);
  }
}
