import type { Metadata } from 'next';
import './globals.css';
import { AiOfficerChatbot } from '../components/AiOfficerChatbot';

export const metadata: Metadata = {
  title: 'தமிழ்நாடு அரசு — ஓட்டுநர் உரிம விண்ணப்ப மறுஆய்வு முகப்புப்பலகை',
  description: 'Tamil Nadu Driving Licence Application Review Officer Dashboard (RTO Portal)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ta">
      <body className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased flex flex-col">
        {children}
        <AiOfficerChatbot />
      </body>
    </html>
  );
}
