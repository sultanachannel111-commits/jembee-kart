"use client";

import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

export default function ErrorTracker() {

  useEffect(() => {

    let lastError = "";

    const saveError = async (data:any) => {
      try {
        // ❌ duplicate avoid
        if (lastError === data.message) return;
        lastError = data.message;

        await addDoc(collection(db, "errors"), {
          ...data,
          page: window.location.href,
          time: new Date()
        });
      } catch (err) {
        console.log("Save error failed", err);
      }
    };

    // 🔴 JS ERROR
    const handleError = (msg:any, url:any, line:any, col:any, error:any) => {
      saveError({
        message: error?.message || msg || "JS Error",
        file: url,
        line,
        column: col,
        stack: error?.stack || ""
      });
    };

    // 🔴 PROMISE ERROR
    const handlePromise = (event:any) => {
      saveError({
        message: event.reason?.message || "Promise Error",
        stack: event.reason?.stack || ""
      });
    };

    window.onerror = handleError;
    window.addEventListener("unhandledrejection", handlePromise);

    // ✅ CLEANUP
    return () => {
      window.onerror = null;
      window.removeEventListener("unhandledrejection", handlePromise);
    };

  }, []);

  return null;
}
