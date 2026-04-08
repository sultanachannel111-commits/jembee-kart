"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function useTheme(initialTheme:any = {}) {

  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {

    const saved = localStorage.getItem("theme-cache");
    if (saved) {
      const parsed = JSON.parse(saved);
      setTheme(parsed);
      applyTheme(parsed); // 🔥 apply cached theme
    }

    const unsub = onSnapshot(doc(db, "settings", "theme"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();

        setTheme(data);
        applyTheme(data); // 🔥 apply live theme

        localStorage.setItem("theme-cache", JSON.stringify(data));
      }
    });

    return () => unsub();

  }, []);

  // 🔥 APPLY FUNCTION
  function applyTheme(t:any) {
    const root = document.documentElement;

    Object.keys(t).forEach((key) => {
      root.style.setProperty(`--${key}`, t[key]);
    });
  }

  return theme;
}
