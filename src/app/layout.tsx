// src/app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/providers/auth-provider";

export const metadata: Metadata = {
  title: "JEMBEE KART",
  description: "Premium Online Shopping Experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f1f3f6] text-gray-900 min-h-screen antialiased">

        <CartProvider>
          <AuthProvider>

            <div className="flex flex-col min-h-screen">

              <main className="flex-grow">
                {children}
              </main>

              <footer className="bg-gray-900 text-gray-300 text-center py-6 text-sm">
                <p className="font-semibold text-white mb-1">
                  JEMBEE KART
                </p>
                <p>Premium Print on Demand Store</p>
                <p className="mt-2 text-gray-500">
                  © {new Date().getFullYear()} All Rights Reserved
                </p>
              </footer>

            </div>

          </AuthProvider>
        </CartProvider>

      </body>
    </html>
  );
}
