"use client";

import { useEffect } from "react";
import { requestNotificationPermission } from "@/lib/firebase-messaging";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminPushSetup() {
  useEffect(() => {
    const setupPush = async () => {
      const token = await requestNotificationPermission();

      if (token) {
        await setDoc(doc(db, "adminTokens", "mainAdmin"), {
          token,
          createdAt: new Date(),
        });

        console.log("✅ Admin FCM token saved");
      }
    };

    setupPush();
  }, []);

  return null; // UI me kuch show nahi karega
}
