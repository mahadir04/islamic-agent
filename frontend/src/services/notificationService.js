import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// Play a pleasant chime tone using Web Audio API (works without external asset loading)
export const playAlertSound = (type = 'chime') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    if (type === 'adhan') {
      // Spiritual warm minor triad chime
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(554.37, ctx.currentTime + 0.3); // C#5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.6); // E5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.8);
    } else {
      // Gentle notification double chime
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    }
  } catch (e) {
    console.warn('Audio chime playback failed:', e);
  }
};

/**
 * Check current notification permission status across Web and Native Android
 * @returns {Promise<'granted' | 'denied' | 'prompt'>}
 */
export const checkNotificationPermission = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      const perm = await LocalNotifications.checkPermissions();
      return perm.display; // 'granted', 'denied', or 'prompt'
    }
    if ('Notification' in window) {
      return Notification.permission; // 'granted', 'denied', 'default'
    }
  } catch (e) {
    console.error('Error checking notification permission:', e);
  }
  return 'denied';
};

/**
 * Request notification permission across Web and Native Android
 * @returns {Promise<boolean>}
 */
export const requestNotificationPermission = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      const res = await LocalNotifications.requestPermissions();
      return res.display === 'granted';
    }
    if ('Notification' in window) {
      const res = await Notification.requestPermission();
      return res === 'granted';
    }
  } catch (e) {
    console.error('Error requesting notification permission:', e);
  }
  return false;
};

/**
 * Send an immediate or scheduled notification alert (System + In-App Toast)
 */
export const sendNotificationAlert = async ({
  title = 'Noor Islamic Guidance',
  body = 'Time for reflection and prayer',
  type = 'prayer',
  id = Math.floor(Math.random() * 100000)
}) => {
  // 1. Play alert chime
  playAlertSound(type === 'adhan' ? 'adhan' : 'chime');

  // 2. Dispatch in-app alert banner event
  window.dispatchEvent(
    new CustomEvent('noor:alert', {
      detail: { title, body, type, id, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    })
  );

  // 3. System notification (Native Android or Web)
  try {
    if (Capacitor.isNativePlatform()) {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display === 'granted') {
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id,
              sound: 'beep.wav',
              schedule: { at: new Date(Date.now() + 200) },
              smallIcon: 'ic_launcher'
            }
          ]
        });
        return true;
      }
    } else if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/logo192.png',
        badge: '/favicon.ico',
        tag: 'noor-notification'
      });
      return true;
    }
  } catch (e) {
    console.error('System notification delivery failed:', e);
  }
  return false;
};
