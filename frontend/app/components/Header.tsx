import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const Header: React.FC = () => {
  const { posteam } = useParams();
  const [teamColor, setTeamColor] = useState<string | null>(null);
  const [teamLogo, setTeamLogo] = useState<string | null>(null);

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
        }
      })
      .catch(error => console.error('Error fetching team data:', error));
  }, [posteam]);

  return (
    <nav 
      className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow"
      style={{ borderBottom: `0.25rem solid ${teamColor || '#858796'}` }}
    >
      {/* Sidebar Toggle (Topbar) */}
      <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3">
        <i className="fa fa-bars"></i>
      </button>

      {/* Topbar Navbar */}
      <ul className="navbar-nav ml-auto">
        {/* Nav Item - User Information */}
        <li className="nav-item dropdown no-arrow">
          <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button">
            <span className="mr-2 d-none d-lg-inline text-gray-600 small"></span>
            <img 
              className="img-profile rounded-circle border border-dark border-5 p-01" 
              src={teamLogo || '/next.svg'} 
              alt="Profile" 
            />
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Header;
