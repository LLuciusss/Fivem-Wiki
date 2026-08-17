import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FiveM Wiki",
  description: "FiveM'in en kapsamlı karakter veritabanı ve wiki platformlarından birisi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}