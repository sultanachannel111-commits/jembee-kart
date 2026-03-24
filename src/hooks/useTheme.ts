"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function useTheme(initialTheme:any = {}) {

  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {

    // 🔥 1. instant load from cache
    const saved = localStorage.getItem("theme-cache");
    if (saved) {
      setTheme(JSON.parse(saved));
    }

    // 🔥 2. realtime update
    const unsub = onSnapshot(doc(db, "settings", "theme"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();

        setTheme(data);

        // 💾 save offline
        localStorage.setItem("theme-cache", JSON.stringify(data));
      }
    });

    return () => unsub();

  }, []);

  return theme;
}
