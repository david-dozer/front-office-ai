"use client";

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import Sidebar from './Sidebar';
import Header from './Header';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname.startsWith('/landing');

  // implement some loading thing to account for footer issues?
  // if (isLoading) {
  //   return (
  //     <div style={{
  //       display: 'flex',
  //       flexDirection: 'column',
  //       alignItems: 'center',
  //       justifyContent: 'center',
  //       height: '100vh',
  //     }}>
  //       <ClipLoader color="green" loading={isLoading} size={125} speedMultiplier={0.5} />
  //       <p>Loading...</p>
  //     </div>
  //   );
  // }

  return (
    <>
      {/* Load required scripts */}
      <Script src="/vendor/jquery/jquery.min.js" strategy="beforeInteractive" />
      <Script src="/vendor/bootstrap/js/bootstrap.bundle.min.js" strategy="beforeInteractive" />
      <Script src="/vendor/jquery-easing/jquery.easing.min.js" strategy="beforeInteractive" />
      <Script src="/js/sb-admin-2.js" strategy="afterInteractive" />

      {/* Main wrapper with SB Admin 2 classes */}
      <div id="wrapper">
        {/* Sidebar */}
        {!isLandingPage && <Sidebar />}

        {/* Content Wrapper */}
        <div id="content-wrapper" className="d-flex flex-column">
          {/* Main Content */}
          <div id="content">
            {!isLandingPage && <Header />}
            
            {/* Begin Page Content */}
            <div className="container-fluid">
              {children}
            </div>
            {/* End Page Content */}
          </div>

          {/* Footer */}
          <footer className="sticky-footer bg-gray-200">
            <div className="container my-auto">
              <div className="copyright text-center my-auto">
                <span>Copyright © David Mendoza 2025</span>
              </div>
            </div>
          </footer>
          {/* End of Footer */}
        </div>
        {/* End of Content Wrapper */}
      </div>
      {/* End of Page Wrapper */}

      {/* Scroll to Top Button */}
      <a className="scroll-to-top rounded" href="#">
        <i className="fas fa-angle-up"></i>
      </a>
    </>
  );
}