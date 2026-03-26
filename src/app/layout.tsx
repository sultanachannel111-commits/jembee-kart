"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/home/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ThemeLoader from "@/components/ThemeLoader";
import { useEffect } from "react";
import { loadTheme } from "@/lib/themeLoader";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  useEffect(() => {
    loadTheme();
  }, []);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>

      <body
        id="theme-body"
        className={`${inter.className} min-h-screen transition-colors duration-300`}
      >
        {/* 🔥 THEME */}
        <ThemeLoader />

        <AuthProvider>
          <CartProvider>

            {/* 🔥 MAIN CONTENT */}
            <div className="pb-24">
              {children}
            </div>
            <Toaster position="top-center" />

            {/* 🔥 FOOTER */}
            <Footer />

            {/* 🔥 NAVBAR */}
            <Navbar />

            {/* 🔥 WHATSAPP BUTTON */}
            <WhatsAppButton />

            {/* 🔥 TOAST */}
            <Toaster position="top-center" />

          </CartProvider>
        </AuthProvider>

      </body>
    </html>
  );
}
