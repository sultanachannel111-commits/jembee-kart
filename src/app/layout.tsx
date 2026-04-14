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
      <body id="theme-body" className={`${inter.className} min-h-screen`}>
        {/* Saara client-side logic iske andar hai */}
        <ClientWrapper /> 
        
        <ThemeLoader />

        <AuthProvider>
          <CartProvider>
            <main className="pb-24 min-h-[80vh]">
              {children}
            </main>
            <Footer />
            <Navbar />
            <WhatsAppButton />
            <Toaster position="top-center" />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
