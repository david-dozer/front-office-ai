// app/dashboard/tables/page.tsx
import React from 'react';

export default function TablesPage() {
  return (
    <div>
      {/* Topbar */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Free Agents</h1>
      </div>

      {/* Page Content */}
      <div className="container-fluid">
        <div className="card shadow mb-4">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">Available Free Agents</h6>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered" width="100%" cellSpacing="0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Projected Salary</th>
                    <th>Age</th>
                    <th>Fit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Tiger Nixon</td>
                    <td>QB</td>
                    <td>$20,000,000</td>
                    <td>30</td>
                    <td>0.85</td>
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
