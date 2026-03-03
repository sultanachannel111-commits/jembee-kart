// src/lib/firebase-messaging.ts

import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "./firebase";

/**
 * 🔔 Request Notification Permission
 * and get FCM Token
 */
export const requestNotificationPermission = async () => {
  try {
    const messaging = await getFirebaseMessaging();

    if (!messaging) {
      console.log("❌ Messaging not supported");
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("❌ Notification permission denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey:
        "BMUm_DXY2GUDH6e2og-3HuEhRvbUZ9WMVd4qK6cIlfaHh7utGR_zDfEEiVp2os_jgCDHupeh5bUrqHe5EYyg",
    });

    if (!token) {
      console.log("❌ Failed to get FCM token");
      return null;
    }

    console.log("✅ FCM Token:", token);
    return token;

  } catch (error) {
    console.error("🔥 FCM Error:", error);
    return null;
  }
};

/**
 * 🔔 Listen for Foreground Notifications
 */
export const listenForForegroundMessages = async (
  callback: (payload: any) => void
) => {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return;

    onMessage(messaging, (payload) => {
      console.log("📩 Foreground Notification:", payload);
      callback(payload);
    });

  } catch (error) {
    console.error("Foreground listener error:", error);
  }
};
