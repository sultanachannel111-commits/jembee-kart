// src/lib/firebase.ts

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔥 Your Real Firebase Config
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

// ✅ Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
