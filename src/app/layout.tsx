import "./globals.css";
import "@/styles/glass-theme.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body className="bg-gradient-to-br from-blue-50 to-purple-100">
        {children}
      </body>
    </html>
  );
}
