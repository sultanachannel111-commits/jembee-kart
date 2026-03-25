"use client";

import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

export default function ErrorTracker() {

  useEffect(() => {

    // 🔴 JS ERROR
    window.onerror = async (msg, url, line, col, error) => {
      try {
        await addDoc(collection(db, "errors"), {
          message: msg,
          file: url,
          line,
          column: col,
          stack: error?.stack || "",
          page: window.location.href,
          time: new Date()
        });
      } catch {}
    };

    // 🔴 PROMISE ERROR
    window.addEventListener("unhandledrejection", async (event) => {
      try {
        await addDoc(collection(db, "errors"), {
          message: event.reason?.message || "Promise Error",
          stack: event.reason?.stack || "",
          page: window.location.href,
          time: new Date()
        });
      } catch {}
    });

  }, []);

  return null;
}
