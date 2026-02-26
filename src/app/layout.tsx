import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/providers/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JembeeKart",
  description: "Modern Ecommerce Platform",
  themeColor: "#f472b6", // Header Pink Match
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Android Chrome Status Bar Color */}
        <meta name="theme-color" content="#f472b6" />
        {/* iPhone Status Bar Style */}
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>

      <body className={`${inter.className} bg-pink-50`}>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
