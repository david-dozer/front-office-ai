import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const Header: React.FC = () => {
  const { posteam } = useParams();
  const router = useRouter();
  const [teamColor, setTeamColor] = useState<string | null>(null);
  const [teamLogo, setTeamLogo] = useState<string | null>(null);
  const [capSpace, setCapSpace] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/teams')
      .then(response => response.json())
      .then(data => {
        const teamData = data.find((t: any) => t.posteam === posteam);
        if (teamData) {
          if (teamData.team_color2) {
            setTeamColor(teamData.team_color2);
          }
          if (teamData.team_logo_espn) {
            setTeamLogo(teamData.team_logo_espn);
          }
          if (teamData.cap_space_all) {
            setCapSpace(teamData.cap_space_all);
          }
        }
      })
      .catch(error => console.error('Error fetching team data:', error));
  }, [posteam]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <nav 
      className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow"
      style={{ borderBottom: `0.25rem solid ${teamColor || '#858796'}` }}
    >
      {/* Back Button */}
      <button onClick={() => router.back()} className="btn btn-link">
        <i className="fa-solid fa-arrow-left"></i>
      </button>

      {/* Sidebar Toggle (Topbar) */}
      <button 
        id="sidebarToggleTop" 
        className="btn btn-link d-md-none rounded-circle mr-3"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <i className="fa fa-bars"></i>
      </button>

      <div id="sidebar" className={`collapse ${sidebarOpen ? 'show' : ''}`}>
        {/* Sidebar content */}
      </div>

      {/* Centered Cap Space */}
      <div className="ml-auto text-right">
        {capSpace !== null && (
          <span>
            <strong>Cap Space:</strong> <strong>{formatCurrency(capSpace)}</strong>
          </span>
        )}
      </div>

      {/* Topbar Navbar */}
      <ul className="navbar-nav ml-auto">
        {/* Nav Item - User Information with Dropdown */}
        <li className="nav-item dropdown no-arrow">
          <a 
            className="nav-link dropdown-toggle" 
            href="#" 
            id="userDropdown" 
            role="button" 
            data-toggle="dropdown" 
            aria-haspopup="true" 
            aria-expanded="false"
          >
            <img 
              className="img-profile rounded-circle border border-dark border-5 p-01" 
              src={teamLogo || '/next.svg'} 
              alt="Profile" 
            />
          </a>
          <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
          <a 
            className="dropdown-item" 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              router.push("/landing");
            }}
          >
            Select another team
          </a>
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Header;
