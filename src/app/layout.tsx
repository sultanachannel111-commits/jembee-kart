import Header from "@/components/header";
import "./globals.css";

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
      <body className="bg-gray-50 text-gray-900">
        <Header />
        {children}
      </body>
    </html>
  );
}
