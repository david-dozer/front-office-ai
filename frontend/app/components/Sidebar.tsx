'use client';
import React from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import useSWR from 'swr';

type Team = {
  posteam: string;
  team_color?: string;
  team_name?: string;
  // ...other properties
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const Sidebar: React.FC = () => {
  const { posteam } = useParams();
  const pathname = usePathname();

  // SWR fetches and caches the teams data.
  const { data: teams, error } = useSWR<Team[]>(
    'http://localhost:5000/teams',
    fetcher,
    {
      revalidateOnFocus: false,    // Avoid re-fetching when the window refocuses
      dedupingInterval: 60000,       // Cache is reused for 60 seconds
    }
  );

  // Determine the current team from the fetched list.
  const team = teams ? teams.find((t) => t.posteam === posteam) : null;

  // Utility: darkens a hex color by a given percentage.
  function darkenColor(hex: string, percent: number): string {
    let color = hex.startsWith('#') ? hex.slice(1) : hex;
    const num = parseInt(color, 16);
    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;
    r = Math.max(0, Math.floor(r * (100 - percent) / 100));
    g = Math.max(0, Math.floor(g * (100 - percent) / 100));
    b = Math.max(0, Math.floor(b * (100 - percent) / 100));
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  const isDashboardActive = pathname === `/dashboard/${posteam}`;
  const isTablesActive = pathname.startsWith(`/dashboard/${posteam}/tables`);

  // Compute sidebar style if team_color exists.
  let sidebarStyle = {};
  if (team && team.team_color) {
    const darkColor = darkenColor(team.team_color, 20);
    sidebarStyle = {
      backgroundColor: team.team_color,
      backgroundImage: `linear-gradient(180deg, ${team.team_color} 10%, ${darkColor} 100%)`,
      backgroundSize: 'cover',
    };
  }

  return (
    <ul
      className="navbar-nav sidebar sidebar-dark accordion"
      id="accordionSidebar"
      style={sidebarStyle}
    >
      {/* Sidebar - Brand */}
      <div
        className="sidebar-brand d-flex align-items-center justify-content-center"
      >
        {/* <div className="sidebar-brand-icon">
          <i className="fas fa-laugh-wink"></i>
        </div> */}
        <div className="sidebar-brand-text mx-3">
          {team ? team.team_name : "Select A Team"}
        </div>
      </div>

      <hr className="sidebar-divider my-0" />

      {/* Information Nav Item */}
      <li className={`nav-item ${isDashboardActive ? 'active' : ''}`}>
        <Link href={`/dashboard/${posteam}`} className="nav-link">
          <i className="fas fa-fw fa-tachometer-alt"></i>
          <span>Information</span>
        </Link>
      </li>

      {/* Tables Nav Item */}
      <li className={`nav-item ${isTablesActive ? 'active' : ''}`}>
        <Link href={`/dashboard/${posteam}/tables`} className="nav-link">
          <i className="fas fa-fw fa-table"></i>
          <span>Players Available</span>
        </Link>
      </li>

      <hr className="sidebar-divider" />
      {/* Additional nav items */}
    </ul>
  );
};

export default Sidebar;
