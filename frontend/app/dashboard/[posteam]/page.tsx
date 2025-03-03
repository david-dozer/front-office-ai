'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ordinalSuffixOf } from '../../utils/OLDisplayStats';

export default function DashboardPage() {
  const { posteam } = useParams();
  const [team, setTeam] = useState<any>(null);
  const [teamColor, setTeamColor] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/teams')
      .then(response => response.json())
      .then(data => {
        const foundTeam = data.find((t: any) => t.posteam === posteam);
        if (foundTeam) {
          setTeam(foundTeam);
          if (foundTeam.team_color2) {
            setTeamColor(foundTeam.team_color2);
          }
        }
      })
      .catch(error => console.error('Error fetching team data:', error));
  }, [posteam]);

  // Return a loading state until team data is available.
  if (!team) {
    return <div>Loading...</div>;
  }

  const groupedStats = [
    {
      groupLabel: "Scoring & Efficiency",
      stats: [
        { label: "Points Scored", statKey: "PointsScored", rankKey: "PointsScored_Rank" },
        { label: "% Scoring Drives", statKey: "PctScoreDrives", rankKey: "PctScoreDrives_Rank" },
        { label: "Total Yards", statKey: "TotalYds", rankKey: "TotalYds_Rank" },
      ],
    },
    {
      groupLabel: "Passing",
      stats: [
        { label: "Passing Yards", statKey: "PassingYds", rankKey: "PassingYds_Rank" },
        { label: "Passing TD", statKey: "PassingTD", rankKey: "PassingTD_Rank" },
        { label: "Passing 1st Downs", statKey: "Passing1stD", rankKey: "Passing1stD_Rank" },
        { label: "Interceptions", statKey: "Int", rankKey: "Int_Rank" },
      ],
    },
    {
      groupLabel: "Rushing",
      stats: [
        { label: "Rushing Yards", statKey: "RushingYds", rankKey: "RushingYds_Rank" },
        { label: "Yards per Carry", statKey: "Y/A", rankKey: "Y/A_Rank" },
        { label: "Rushing TD", statKey: "RushingTD", rankKey: "RushingTD_Rank" }
      ],
    },
    {
      groupLabel: "Turnovers",
      stats: [
        { label: "Total Turnovers", statKey: "TotalTO", rankKey: "TotalTO_Rank" },
        { label: "Turnover %", statKey: "TO%", rankKey: "TO%_Rank" },
      ],
    },
  ];

  return (
    <div>
      {/* Topbar (Header) */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">
          Offensive Scheme:{" "}
          {team.posteam === 'DET' || team.posteam === 'KC'
            ? 'Versatile/Hybrid'
            : team.scheme}
        </h1>
      </div>

      {/* Main Content */}
      <div className="container-fluid">
        {groupedStats.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-1">
            <h4 className="text-gray-800 mb-3">{group.groupLabel}</h4>
            <div className="row">
              {group.stats.map((stat, index) => {
                let displayStat;
                if (stat.statKey === "TO%" || stat.statKey === "PctScoreDrives") {
                  displayStat = Number(team[stat.statKey]).toFixed(1) + "%";
                } else if (stat.statKey === "Y/A") {
                  displayStat = Number(team[stat.statKey]).toFixed(1);
                } else {
                  displayStat = Number(team[stat.statKey]).toFixed(0);
                }
                return (
                  <div key={index} className="col-xl-3 col-md-6 mb-4">
                    <div
                      className="card shadow h-100 py-2"
                      style={{ borderLeft: `0.25rem solid ${teamColor || '#858796'}` }}
                    >
                      <div className="card-body">
                        <div className="row no-gutters align-items-center">
                          <div className="col mr-2">
                            <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                              {stat.label}
                            </div>
                            <div className="h5 mb-0 font-weight-bold text-gray-800">
                              {displayStat}
                            </div>
                          </div>
                          <div className="col-auto">
                            <div className="p mb-0 font-weight-bold text-gray-800">
                              {ordinalSuffixOf(Number(team[stat.rankKey]))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
