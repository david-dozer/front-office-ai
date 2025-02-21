// app/components/Sidebar.tsx
import React from 'react';
import Link from 'next/link'

const Sidebar: React.FC = () => {
  return (
    <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
      {/* Sidebar - Brand */}
      <a className="sidebar-brand d-flex align-items-center justify-content-center" href="/">
        <div className="sidebar-brand-icon">
          <i className="fas fa-laugh-wink"></i>
        </div>
        <div className="sidebar-brand-text mx-3">Select A Team</div>
      </a>

      {/* Divider */}
      <hr className="sidebar-divider my-0" />

      {/* Nav Item - Dashboard */}
      <li className="nav-item active">
        <a className="nav-link" href="/dashboard">
          <i className="fas fa-fw fa-tachometer-alt"></i>
          <span>Information</span>
        </a>
      </li>

      {/* Tables Nav Item */}
      <li className="nav-item">
        <Link href="/dashboard/tables" className="nav-link">
          <i className="fas fa-fw fa-table"></i>
          <span>Players Available</span>
        </Link>
      </li>

      {/* Divider */}
      <hr className="sidebar-divider" />

      {/* Add more nav items as needed */}
    </ul>
  );
};

export default Sidebar;
