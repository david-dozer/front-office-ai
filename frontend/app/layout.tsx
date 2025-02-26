// app/layout.tsx
import './globals.css'
import Head from 'next/head';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../styles/sb-admin-2.css'
import LayoutWrapper from './components/LayoutWrapper';

export const metadata = {
  title: 'NFL Free Agency AI',
  description: 'A Next.js project replicating SB Admin 2',
  link: [
    // {
    //   rel: 'stylesheet',
    //   href: '/vendor/fontawesome-free/css/all.min.css', // Make sure this path is correct
    // },
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i',
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Head>
        {/* <link rel="stylesheet" href="/vendor/fontawesome-free/css/all.min.css" /> */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" />
      </Head>
      <body>
        <LayoutWrapper>{children}</LayoutWrapper> {/* Wrap everything in the LayoutWrapper */}
      </body>
    </html>
  );
}
