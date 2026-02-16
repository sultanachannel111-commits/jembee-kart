import "./globals.css";
import Header from "@/components/header";

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
      <body className="bg-gradient-to-br from-gray-50 to-gray-200">
        <Header />
        {children}
      </body>
    </html>
  );
}
