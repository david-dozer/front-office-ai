// app/dashboard/page.tsx
import React from 'react';

export default function DashboardPage() {
  return (
    <div>
      {/* Topbar (Header) */}
      <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
        <h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
      </nav>

      {/* Main Content */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-left-primary shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                      Earnings (Monthly)
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">$40,000</div>
                  </div>
                  <div className="col-auto">
                    <i className="fas fa-calendar fa-2x text-gray-300"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Add more cards/content */}
        </div>
      </div>
    </div>
  );
}
