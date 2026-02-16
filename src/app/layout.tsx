import "./globals.css";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export const metadata = {
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
      <body className="bg-gray-100">

        {/* HEADER */}
        <header className="sticky top-0 z-50 bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">
              JEMBEE <span className="text-green-600">STORE</span>
            </Link>

            <nav className="hidden md:flex gap-8 font-medium">
              <Link href="/">Home</Link>
              <Link href="/orders">Orders</Link>
              <Link href="/dashboard">Dashboard</Link>
            </nav>

            <div className="flex items-center gap-4">
              <ShoppingCart />
              <a
                href="https://wa.me/917061369212"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </header>

        {children}

        {/* FOOTER */}
        <footer className="bg-gray-900 text-white mt-16">
          <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">
            <div>
              <h2 className="text-xl font-bold mb-3">JEMBEE STORE</h2>
              <p>Premium WhatsApp Based Shopping Experience.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/orders">Orders</Link></li>
                <li><Link href="/dashboard">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Contact</h3>
              <p>WhatsApp: 7061369212</p>
              <p>Email: support@jembee.com</p>
            </div>
          </div>

          <div className="text-center py-4 border-t border-gray-700">
            © 2026 JEMBEE STORE. All rights reserved.
          </div>
        </footer>

        {/* Floating WhatsApp Button */}
        <a
          href="https://wa.me/917061369212"
          className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-full shadow-lg"
        >
          Chat
        </a>

      </body>
    </html>
  );
}
