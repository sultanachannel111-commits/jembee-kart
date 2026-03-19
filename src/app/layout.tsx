"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { loadTheme } from "@/lib/themeLoader";
import { Toaster } from "react-hot-toast";
import ThemeLoader from "@/components/ThemeLoader";
import WhatsAppButton from "@/components/WhatsAppButton";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  /* =========================
     LOAD WEBSITE THEME
  ========================= */
  useEffect(() => {
    loadTheme();
  }, []);

  return (
    <html lang="en">
      <head>

        {/* ✅ iPhone Status Bar */}
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />

        {/* ✅ Viewport */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

      </head>

      <body
        id="theme-body"
        className={`${inter.className} pb-16 min-h-screen transition-colors duration-300`}
      >

        {/* 🔥 STATUS BAR + THEME LOADER */}
        <ThemeLoader />

        <AuthProvider>
          <CartProvider>

            {/* WEBSITE CONTENT */}
            {children}

            {/* TOAST */}
            <Toaster position="top-center" />

            {/* BOTTOM NAV */}
            <Navbar />
            {/* 💬 WhatsApp Button (GLOBAL) */}
            <WhatsAppButton /
            
          </CartProvider>
        </AuthProvider>

      </body>
    </html>
  );
}
