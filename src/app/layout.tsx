import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/providers/auth-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JembeeKart",
  description: "Modern Ecommerce Platform",
  themeColor: "#f472b6", // Pink-400 (Header match)
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
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    </head>
    <body className={inter.className}>
      <AuthProvider>
        <CartProvider>

          {/* ❌ DynamicCategories removed from here */}

          {children}

        </CartProvider>
      </AuthProvider>
    </body>
  </html>
);

            {/* ❌ DynamicCategories removed from here */}

            {children}

          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
