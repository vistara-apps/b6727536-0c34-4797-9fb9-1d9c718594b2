import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VoiceFlow AI - Speak your tasks, master your day',
  description: 'Transform spoken thoughts into actionable to-do lists and scheduled calendar events with smart reminders.',
  keywords: ['voice', 'AI', 'tasks', 'calendar', 'productivity', 'Base', 'miniapp'],
  authors: [{ name: 'VoiceFlow AI Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
