import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/header";

export const metadata: Metadata = {
  title: "JEMBEE STORE",
  description: "Premium WhatsApp Based Store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">

        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="pt-6">
          {children}
        </main>

      </body>
    </html>
  );
}
