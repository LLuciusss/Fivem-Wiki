import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FiveM Wiki',
  description: 'FiveM karakter arşivi ve hikaye yönetim sistemi.',
  metadataBase: new URL('https://fivem-wiki.vercel.app'),
  openGraph: {
    title: 'FiveM Wiki',
    description: 'FiveM karakter arşivi ve hikaye yönetim sistemi.',
    url: 'https://fivem-wiki.vercel.app',
    siteName: 'FiveM Wiki',
    images: [
      {
        url: 'https://fivem-wiki.vercel.app/fivemwiki.png',
        width: 1200,
        height: 630,
        alt: 'FiveM Wiki Önizleme Görseli',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FiveM Wiki',
    description: 'FiveM karakter arşivi ve hikaye yönetim sistemi.',
    images: ['https://fivem-wiki.vercel.app/fivemwiki.png'], 
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}