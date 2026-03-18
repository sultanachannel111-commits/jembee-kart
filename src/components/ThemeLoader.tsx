"use client";

import { useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ThemeLoader() {

  useEffect(() => {
    async function setThemeColor() {

      const snap = await getDoc(doc(db, "settings", "theme"));

      if (snap.exists()) {
        const theme = snap.data();

        if (theme?.statusBar) {
          let meta = document.querySelector('meta[name="theme-color"]');

          if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute("name", "theme-color");
            document.head.appendChild(meta);
          }

          meta.setAttribute("content", theme.statusBar);
        }
      }
    }

    setThemeColor();
  }, []);

  return null;
}
