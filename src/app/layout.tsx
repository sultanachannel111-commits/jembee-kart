"use client";

import "./globals.css";
import { Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { loadTheme } from "@/lib/themeLoader";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  useEffect(()=>{
loadTheme();
},[]);
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#f472b6" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
      </head>

      <body className={`${inter.className} bg-pink-50 pb-16`}>
        <AuthProvider>
          <CartProvider>
            {children}
            {/* Bottom Navbar */}
            {/* <Navbar /> */}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
