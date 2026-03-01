import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/providers/auth-provider";
import Navbar from "@/components/Navbar"; // 🔥 ADD THIS

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JembeeKart",
  description: "Modern Ecommerce Platform",
  themeColor: "#f472b6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          </CartProvider>
        </AuthProvider>

        {/* 🔥 BOTTOM NAVBAR WITH LIVE CART BADGE */}
        {/* <Navbar /> */}
      </body>
    </html>
  );
}
