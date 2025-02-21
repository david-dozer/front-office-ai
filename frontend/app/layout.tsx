// app/layout.tsx
import './globals.css'
import '../styles/sb-admin-2.css'
import Sidebar from './components/Sidebar'  // Adjusted path
import Header from './components/Header'      // Added import for Header

export const metadata = {
  title: 'NFL Free Agency AI',
  description: 'A Next.js project replicating SB Admin 2',
  link: [
    {
      rel: 'stylesheet',
      href: '/vendor/fontawesome-free/css/all.min.css', // Make sure this path is correct
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
      <head />
      
      {/* <Header /> */}
      <body>
        <div id="wrapper">
          <Sidebar />
          <div id="content-wrapper" className="d-flex flex-column">
            <div id="content">{children}</div>
          </div>
        </div></body>
    </html>
  )
}
