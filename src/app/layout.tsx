import "./globals.css";
import { Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/home/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ThemeLoader from "@/components/ThemeLoader";
import { Toaster } from "react-hot-toast";
import ClientWrapper from "@/components/ClientWrapper";

const inter = Inter({ subsets: ["latin"] });

// 🔥 SEO ke liye metadata add karna zaroori hai
export const metadata = {
  title: "Jembee Kart | Official Store",
  description: "Shop the latest oversized and graphic t-shirts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>

      <body
        id="theme-body"
        className={`${inter.className} min-h-screen transition-colors duration-300`}
      >
        {/* 🔥 Sabse pehle ClientWrapper load hoga logic ke liye */}
        <ClientWrapper /> 
        
        {/* 🔥 Theme Loader */}
        <ThemeLoader />

        <AuthProvider>
          <CartProvider>
            {/* Main Content Area */}
            <main className="pb-24 min-h-[80vh]">
              {children}
            </main>

            {/* Components */}
            <Footer />
            <Navbar />
            <WhatsAppButton />
            
            {/* Toast Notifications */}
            <Toaster position="top-center" />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
