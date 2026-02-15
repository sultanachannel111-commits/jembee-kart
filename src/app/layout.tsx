import "./globals.css";           // Tailwind load hoga
import "@/styles/glass-theme.css"; // Glass effect

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
