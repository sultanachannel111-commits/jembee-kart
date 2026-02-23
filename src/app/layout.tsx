import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import DynamicCategories from "@/components/DynamicCategories";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/providers/auth-provider"; // ✅ ADD THIS

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
        <AuthProvider> {/* ✅ WRAP EVERYTHING */}
          <CartProvider>

            {/* 🔥 DYNAMIC CATEGORIES */}
            <DynamicCategories />

            {/* MAIN CONTENT */}
            {children}

          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
