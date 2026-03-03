// src/lib/firebase.ts

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

// 🔥 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBj29BLR64WHyFPRTWszEHGkyrMMTCpwkQ",
  authDomain: "studio-4213097962-b1ad6.firebaseapp.com",
  projectId: "studio-4213097962-b1ad6",
  storageBucket: "studio-4213097962-b1ad6.firebasestorage.app",
  messagingSenderId: "805890394961",
  appId: "1:805890394961:web:81d5ff06d6b8336804e170",
};

// ✅ Prevent multiple initialization (Next.js safe)
const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

// ✅ Core Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ Messaging (Safe for SSR)
let messaging: any = null;

export const getFirebaseMessaging = async () => {
  if (typeof window === "undefined") return null;

  const supported = await isSupported();

  if (!supported) return null;

  if (!messaging) {
    messaging = getMessaging(app);
  }

  return messaging;
};

export default app;
