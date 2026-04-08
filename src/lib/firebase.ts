import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBj29BLR64WHyFPRTWszEHGkyrMMTCpwkQ",
  authDomain: "studio-4213097962-b1ad6.firebaseapp.com",
  projectId: "studio-4213097962-b1ad6",
  storageBucket: "studio-4213097962-b1ad6.firebasestorage.app",
  messagingSenderId: "805890394961",
  appId: "1:805890394961:web:81d5ff06d6b8336804e170",
};

// ✅ Next.js Safe Initialization
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// ✅ Initialize services only when 'app' is ready
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ Messaging (Strict Client Check)
export const getFirebaseMessaging = async () => {
  if (typeof window !== "undefined") {
    const supported = await isSupported();
    if (supported) {
      return getMessaging(app);
    }
  }
  return null;
};

export default app;
