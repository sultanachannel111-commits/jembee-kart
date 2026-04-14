"use client";
import { useEffect } from "react";
import { loadTheme } from "@/lib/themeLoader";
import { logError } from "@/lib/errorLogger";

export default function ClientWrapper() {
  useEffect(() => {
    loadTheme();
    window.onerror = (msg, url, line, col, error) => {
      logError({ message: msg, file: url, line, stack: error?.stack, page: window.location.href });
    };
    window.onunhandledrejection = (event) => {
      logError({ message: event.reason?.message || "Promise error", stack: event.reason?.stack, page: window.location.href });
    };
  }, []);
  return null;
}
