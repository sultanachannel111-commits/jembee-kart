import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jembee Store",
  description: "Premium WhatsApp Based Store by Jembee",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="
          min-h-screen 
          bg-gradient-to-br 
          from-gray-50 
          via-white 
          to-gray-100 
          text-gray-900 
          antialiased
        "
      >
        {children}
      </body>
    </html>
  );
}
