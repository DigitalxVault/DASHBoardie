import type { Metadata, Viewport } from 'next';
import { montserrat } from '@/lib/fonts';
import { AudioProvider } from '@/providers/AudioProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dash-Boardie',
  description: 'Modular Dashboard Builder for Tabletop Gaming',
  openGraph: {
    title: 'Dash-Boardie',
    description: 'Modular Dashboard Builder for Tabletop Gaming',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Dash-Boardie',
    description: 'Modular Dashboard Builder for Tabletop Gaming',
  },
};

export const viewport: Viewport = {
  themeColor: '#EEEEF5',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.variable} suppressHydrationWarning>
      <body className="min-h-screen text-text-primary antialiased">
        <AudioProvider>
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}
