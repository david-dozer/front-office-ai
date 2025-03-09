// app/layout.tsx
import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/sb-admin-2.css';
import LayoutWrapper from './components/LayoutWrapper';
import { Nunito } from 'next/font/google';

const nunito = Nunito({
  subsets: ['latin'],
  weight: [
    '200', '300', '400',
    '600', '700', '800', '900'
  ],
});

export const metadata = {
  title: 'NFL Free Agency AI',
  description: 'A Next.js project replicating SB Admin 2',
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico',
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.className}>
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
