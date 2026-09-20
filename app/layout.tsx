import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { MagicalSky } from '@/components/magical-sky';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://manifestos.studio'),
  title: {
    default: 'ManifestOS.studio',
    template: '%s · ManifestOS.studio',
  },
  description: 'ManifestOS is a free problem-solving network. Don\'t bring us an app idea. Bring us a problem.',
  icons: {
    icon: [{ url: '/logo.png', type: 'image/png' }],
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  openGraph: {
    type: 'website',
    url: 'https://manifestos.studio',
    siteName: 'ManifestOS.studio',
    title: 'ManifestOS.studio',
    description: 'ManifestOS is a free problem-solving network. Don\'t bring us an app idea. Bring us a problem.',
    images: [{ url: '/logo.png', width: 1254, height: 1254, alt: 'ManifestOS.studio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ManifestOS.studio',
    description: 'ManifestOS is a free problem-solving network. Don\'t bring us an app idea. Bring us a problem.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className={`${outfit.className} bg-void text-pearl antialiased`}>
        <MagicalSky />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
