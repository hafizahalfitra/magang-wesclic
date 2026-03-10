import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wesclic Indonesia Neotech",
  description: "Salary Prediction System - Wesclic Indonesia Neotech",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}