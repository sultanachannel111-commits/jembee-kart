"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { loadTheme } from "@/lib/themeLoader";
import { Toaster } from "react-hot-toast";

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
        <meta name="theme-color" content="#f472b6" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
      </head>

      {/* IMPORTANT: theme-body id for theme builder */}
      <body
        id="theme-body"
        className={`${inter.className} pb-16 transition-colors duration-300`}
      >

        <AuthProvider>
          <CartProvider>

            {/* WEBSITE CONTENT */}
            {children}

            {/* TOAST NOTIFICATIONS */}
            <Toaster position="top-center" />

            {/* BOTTOM NAVBAR */}
            <Navbar />

          </CartProvider>
        </AuthProvider>

      </body>
    </html>
  );
}
