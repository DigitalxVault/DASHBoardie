import type { Metadata, Viewport } from 'next';
import { montserrat } from '@/lib/fonts';
import { AudioProvider } from '@/providers/AudioProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'LoFi Immersive Interface',
  description: 'Board Game Interactive Dashboard',
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
    <html lang="en" className={montserrat.variable}>
      <body className="min-h-screen text-text-primary antialiased">
        <AudioProvider>
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}
