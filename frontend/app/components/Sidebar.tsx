'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

type Team = {
  posteam: string;
  team_color?: string; // expects a hex code, e.g., "#4e73df"
  // ...other properties
};

const Sidebar: React.FC = () => {
  const { posteam } = useParams();
  const pathname = usePathname();
  const [team, setTeam] = useState<Team | null>(null);

  // Utility to darken a hex color by a given percentage
  function darkenColor(hex: string, percent: number): string {
    // Remove the '#' if present
    let color = hex.startsWith('#') ? hex.slice(1) : hex;
    const num = parseInt(color, 16);
    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;

    // Reduce each color channel by the percentage
    r = Math.max(0, Math.floor(r * (100 - percent) / 100));
    g = Math.max(0, Math.floor(g * (100 - percent) / 100));
    b = Math.max(0, Math.floor(b * (100 - percent) / 100));

    // Convert back to hex and return with leading '#'
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  useEffect(() => {
    async function fetchTeamData() {
      const res = await fetch('http://127.0.0.1:5000/teams', { cache: 'no-store' });
      const teams: Team[] = await res.json();
      const currentTeam = teams.find((t) => t.posteam === posteam);
      setTeam(currentTeam || null);
    }
    if (posteam) {
      fetchTeamData();
    }
  }, [posteam]);

  const isDashboardActive =
    pathname === `/dashboard/${posteam}`;
  const isTablesActive = pathname.startsWith(`/dashboard/${posteam}/tables`);


  // Compute the gradient style using the team_color if available
  let sidebarStyle = {};
  if (team && team.team_color) {
    const darkColor = darkenColor(team.team_color, 20); // darken by 20%
    sidebarStyle = {
      backgroundColor: team.team_color,
      backgroundImage: `linear-gradient(180deg, ${team.team_color} 10%, ${darkColor} 100%)`,
      backgroundSize: 'cover'
    };
  }

  return (
    <ul className="navbar-nav sidebar sidebar-dark accordion" id="accordionSidebar" style={sidebarStyle}>
      {/* Sidebar - Brand */}
      <a className="sidebar-brand d-flex align-items-center justify-content-center" href="/">
        <div className="sidebar-brand-icon">
          <i className="fas fa-laugh-wink"></i>
        </div>
        <div className="sidebar-brand-text mx-3">Select A Team</div>
      </a>

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
