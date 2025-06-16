import { subscribeNotification, unsubscribeNotification } from '../data/api';
import { getAuth } from './auth';
import CONFIG from '../config';

export function isPushNotificationSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function unsubscribePush() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return { error: true, message: 'No subscription found' };

    const auth = getAuth();
    if (!auth) return { error: true, message: 'User not authenticated' };

    const result = await unsubscribeNotification(subscription.endpoint, auth.token);
    await subscription.unsubscribe();
    return result;
  } catch (error) {
    return { error: true, message: error.message };
  }
}

export async function subscribePush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { error: true, message: 'Push notifications not supported' };
  }

  // Minta izin notifikasi
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { error: true, message: 'Notification permission denied' };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
    });

    const auth = getAuth();
    if (!auth) return { error: true, message: 'User not authenticated' };

    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')))),
      },
    };

    return await subscribeNotification(subscriptionData, auth.token);
  } catch (error) {
    return { error: true, message: error.message };
  }
}
