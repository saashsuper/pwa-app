import { useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationsContext';

/**
 * Listens for push notification messages from the service worker
 * and adds them to the in-app notification list.
 */
export default function NotificationListener() {
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PUSH_NOTIFICATION' && event.data?.payload) {
        const p = event.data.payload;
        addNotification({
          title: p.title || 'Notification',
          body: p.body || '',
          url: p.url,
          work_order_id: p.work_order_id,
        });
      }
    };

    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
  }, [addNotification]);

  return null;
}
