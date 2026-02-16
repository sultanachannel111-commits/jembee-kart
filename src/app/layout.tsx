// src/app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JEMBEE KART",
  description: "Premium WhatsApp Based Shopping Experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f1f3f6] text-gray-900">
        {children}
      </body>
    </html>
  );
}
