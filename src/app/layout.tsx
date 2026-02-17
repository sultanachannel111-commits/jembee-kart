// src/app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JEMBEE KART",
  description: "Premium WhatsApp Based Shopping Experience",
  keywords: ["Jembee Kart", "WhatsApp Store", "Online Shopping"],
  authors: [{ name: "JEMBEE KART" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f1f3f6] text-gray-900 min-h-screen antialiased">
        
        {/* Main App Wrapper */}
        <div className="flex flex-col min-h-screen">
          
          {/* Page Content */}
          <main className="flex-grow">
            {children}
          </main>

          {/* Global Footer */}
          <footer className="bg-blue-900 text-white text-center py-4 text-sm">
            © {new Date().getFullYear()} JEMBEE KART | WhatsApp Shopping Experience
          </footer>

        </div>

      </body>
    </html>
  );
}
