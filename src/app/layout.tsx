import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import DynamicCategories from "@/components/DynamicCategories";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JembeeKart",
  description: "Modern Ecommerce Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          
          {/* HEADER (agar tumhara alag header component hai to yaha rakho) */}
          
          {/* 🔥 DYNAMIC CATEGORIES (Home ko touch nahi kiya) */}
          <DynamicCategories />

          {/* MAIN CONTENT */}
          {children}

        </CartProvider>
      </body>
    </html>
  );
}
