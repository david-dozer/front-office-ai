'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function DashboardPage() {
  const { posteam } = useParams();
  const [teamColor, setTeamColor] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/teams')
      .then(response => response.json())
      .then(data => {
        const team = data.find((t: any) => t.posteam === posteam);
        if (team && team.team_color2) {
          setTeamColor(team.team_color2);
        }
      })
      .catch(error => console.error('Error fetching team data:', error));
  }, [posteam]);

  return (
    <div>
      {/* Topbar (Header) */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Offensive Scheme</h1>
      </div>

      {/* Main Content */}
      <div className="container-fluid">
        <div className="row">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="col-xl-3 col-md-6 mb-4">
              <div
                className="card shadow h-100 py-2"
                style={{ borderLeft: `0.25rem solid ${teamColor || '#858796'}` }}
              >
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
          ))}
        </div>
      </div>
    </div>
  );
}
