'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ordinalSuffixOf } from '../../utils/OLDisplayStats';

interface Team {
  posteam: string;
  scheme?: string;
  team_color2?: string;
  
  // Scoring & Efficiency
  PointsScored?: number;
  PointsScored_Rank?: number;
  PctScoreDrives?: number;
  PctScoreDrives_Rank?: number;
  TotalYds?: number;
  TotalYds_Rank?: number;

  // Passing
  PassingYds?: number;
  PassingYds_Rank?: number;
  PassingTD?: number;
  PassingTD_Rank?: number;
  Passing1stD?: number;
  Passing1stD_Rank?: number;
  Int?: number;
  Int_Rank?: number;

  // Rushing
  RushingYds?: number;
  RushingYds_Rank?: number;
  Y_A?: number;  // Adjusted to avoid syntax issues with "Y/A"
  Y_A_Rank?: number;
  RushingTD?: number;
  RushingTD_Rank?: number;

  // Turnovers
  TotalTO?: number;
  TotalTO_Rank?: number;
  TO_Percent?: number;  // Adjusted from "TO%"
  TO_Percent_Rank?: number;
  
  // Additional properties
  [key: string]: number | string | undefined;  // Catch-all for unknown keys
}

export default function DashboardPage() {
  const { posteam } = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [teamColor, setTeamColor] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/teams')
      .then(response => response.json())
      .then(data => {
        const foundTeam = data.find((t: Team) => t.posteam === posteam);
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
        { label: "Passing TDs", statKey: "PassingTD", rankKey: "PassingTD_Rank" },
        { label: "Passing 1st Downs", statKey: "Passing1stD", rankKey: "Passing1stD_Rank" },
        { label: "Interceptions", statKey: "Int", rankKey: "Int_Rank" },
      ],
    },
    {
      groupLabel: "Rushing",
      stats: [
        { label: "Rushing Yards", statKey: "RushingYds", rankKey: "RushingYds_Rank" },
        { label: "Yards per Carry", statKey: "Y_A", rankKey: "Y_A_Rank" },
        { label: "Rushing TDs", statKey: "RushingTD", rankKey: "RushingTD_Rank" },
      ],
    },
    {
      groupLabel: "Turnovers",
      stats: [
        { label: "Total Turnovers", statKey: "TotalTO", rankKey: "TotalTO_Rank" },
        { label: "Turnover %", statKey: "TO_Percent", rankKey: "TO_Percent_Rank" },
      ],
    },
  ];  

  return (
    <div className="container-fluid">
      {/* Header Section */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">
          Offensive Scheme:{" "}
          {team.posteam === "DET" || team.posteam === "KC"
            ? "Versatile/Hybrid"
            : team.scheme || "Unknown"}
        </h1>
      </div>
  
      {/* Main Stats Section */}
      {groupedStats.map((group, groupIndex) => (
        <div key={groupIndex} className="mb-4">
          <h4 className="text-gray-800 mb-3">{group.groupLabel}</h4>
          <div className="row">
            {group.stats.map((stat, index) => {
              const value = team[stat.statKey];
              const rank = team[stat.rankKey];
  
              // Format numerical values properly
              let displayStat = value !== undefined ? Number(value).toFixed(0) : "N/A";
              if (stat.statKey === "TO_Percent" || stat.statKey === "PctScoreDrives") {
                displayStat = value !== undefined ? Number(value).toFixed(1) + "%" : "N/A";
              } else if (stat.statKey === "Y_A") {
                displayStat = value !== undefined ? Number(value).toFixed(1) : "N/A";
              }
  
              return (
                <div key={index} className="col-xl-3 col-md-6 mb-4">
                  <div
                    className="card shadow h-100 py-2"
                    style={{
                      borderLeft: `0.25rem solid ${teamColor || "#858796"}`,
                    }}
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
                            {rank !== undefined ? ordinalSuffixOf(Number(rank)) : "N/A"}
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
  );  
}
