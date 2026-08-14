import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FiveM Wiki",
  description: "Şehrin en kapsamlı karakter veritabanı ve wiki platformu",
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