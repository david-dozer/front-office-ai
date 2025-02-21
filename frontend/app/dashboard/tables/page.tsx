// app/dashboard/tables/page.tsx
import React from 'react';

export default function TablesPage() {
  return (
    <div>
      {/* Topbar */}
      <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
        <h1 className="h3 mb-0 text-gray-800">Free Agents</h1>
      </nav>

      {/* Page Content */}
      <div className="container-fluid">
        <div className="card shadow mb-4">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">DataTables Example</h6>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered" width="100%" cellSpacing="0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Office</th>
                    <th>Age</th>
                    <th>Start date</th>
                    <th>Salary</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Tiger Nixon</td>
                    <td>System Architect</td>
                    <td>Edinburgh</td>
                    <td>61</td>
                    <td>2011/04/25</td>
                    <td>$320,800</td>
                  </tr>
                  {/* Add the remaining rows */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
