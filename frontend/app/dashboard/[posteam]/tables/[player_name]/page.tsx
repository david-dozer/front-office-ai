'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CircularProgressBar from '@/app/components/CircularProgressBar';
import { renderQBAdvancedStats, renderQBNextGenStats } from '@/app/utils/QBDisplayStats';
import { renderRBAdvancedStats, renderRBNextGenStats, renderRBStandardReceivingStats } from '@/app/utils/RBDisplayStats';
import { renderWRAdvancedStats, renderWRNextGenStats } from '@/app/utils/WRDisplayStats';

const advancedStatsRenderers: Record<string, (playerData: any, teamScheme: string) => React.ReactElement> = {
  QB: renderQBAdvancedStats,
  RB: renderRBAdvancedStats,
  WR: renderWRAdvancedStats,
};

const nextGenStatsRenderers: Record<string, (playerData: any, teamScheme: string) => React.ReactElement> = {
  QB: renderQBNextGenStats,
  RB: renderRBNextGenStats,
  WR: renderWRNextGenStats,
};

export default function PlayerPage() {
  const params = useParams();
  const [playerData, setPlayerData] = useState<any>(null);
  const [teamScheme, setTeamScheme] = useState<string>('');

  // Fetch the player data
  useEffect(() => {
    if (!params?.posteam || !params?.player_name) return;

    async function fetchPlayer() {
      try {
        const positions = ['QB', 'RB', 'WR'];
        for (const pos of positions) {
          const res = await fetch(`http://localhost:5000/teams/${params.posteam}/${pos}info/${params.player_name}`, {
            cache: 'no-store',
          });
          if (res.ok) {
            const data = await res.json();
            setPlayerData(data);
            break;
          }
        }
      } catch (err) {
        console.error('Error fetching player data:', err);
      }
    }
    fetchPlayer();
  }, [params]);

  // Fetch the current team's scheme
  useEffect(() => {
    if (!params?.posteam) return;

    fetch('http://localhost:5000/teams')
      .then(response => response.json())
      .then(data => {
        const teamData = data.find((t: any) => t.posteam === params.posteam);
        if (teamData) {
          // set the team scheme
          if (teamData.scheme) {
            setTeamScheme(teamData.scheme);
          }
        }
      })
      .catch(error => console.error('Error fetching team data:', error));
  }, [params?.posteam]);

  function convertHeightToFeetInches(heightInInches: number) {
    const feet = Math.floor(heightInInches / 12);
    const inches = heightInInches % 12;
    return `${feet}'${inches}`;
  }

  if (!playerData) {
    return <div className="container-fluid">Loading player data...</div>;
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        {/* Player Info & Standard Stats in the same row */}
        <div className="col-md-8">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Player Information</h6>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Left column: Player Info */}
                <div className="col-md-8">
                  <h4 className="card-title mb-2"><strong>{playerData.player_name}</strong></h4>
                  <p><strong>Age:</strong> {parseInt(playerData.age, 10)}</p>
                  <p><strong>Height:</strong> {convertHeightToFeetInches(playerData.height)}</p>
                  <p><strong>Weight:</strong> {playerData.weight}</p>
                  <p><strong>YOE:</strong> {playerData.YOE}</p>
                  <p><strong>Position:</strong> {playerData.Position}</p>
                  <p><strong>Projected AAV:</strong> 
                    {playerData.AAV ? ` $${(+playerData.AAV).toLocaleString()}` : ''}
                  </p>
                </div>
  
                {/* Right column: Circular Progress Bar */}
                <div className="col-md-4 d-flex flex-column align-items-center justify-content-center ml-n5">
                  <CircularProgressBar 
                    progress={(playerData.final_fit || 0) * 100} 
                    size={250} 
                    strokeWidth={15} 
                    duration={1500}
                    headshotUrl={playerData.headshot_url} 
                  />
                  <small className="text-muted mt-2">
                    Player Fit: {(playerData.final_fit * 100).toFixed(1)}%
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Standard Stats Card moves into this row */}
        <div className="col-md-4">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Standard Stats</h6>
            </div>
            <div className="card-body">
              {/* Dynamically render player stats */}
              {playerData.Position === 'QB' && (
                <>
                  <p><strong>Passing TDs:</strong> {playerData.passing_tds}</p>
                  <p><strong>Passing Yards:</strong> {playerData.passing_yards}</p>
                  <p><strong>Interceptions:</strong> {playerData.interceptions}</p>
                  <p><strong>Games:</strong> {playerData.games}</p>
                </>
              )}
              {playerData.Position === 'RB' && (
                <>
                  <p><strong>Rushing TDs:</strong> {playerData.rushing_tds}</p>
                  <p><strong>Rushing Yards:</strong> {playerData.rushing_yards}</p>
                  <p><strong>Fumbles:</strong> {playerData.rushing_fumbles}</p>
                  <p><strong>Carries:</strong> {playerData.carries}</p>
                  <p><strong>Games:</strong> {playerData.games}</p>
                </>
              )}
              {playerData.Position === 'WR' && (
                <>
                  <p><strong>Receiving TDs:</strong> {playerData.receiving_tds}</p>
                  <p><strong>Catches:</strong> {playerData.receptions}</p>
                  <p><strong>Receiving Yards:</strong> {playerData.receiving_yards}</p>
                  <p><strong>Targets:</strong> {playerData.targets}</p>
                  <p><strong>Games:</strong> {playerData.games}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* position-specific Advanced and Next Gen Stats */}
      {/* {playerData.Position === 'QB' && ( */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Advanced Stats</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  {advancedStatsRenderers[playerData.Position]
                    ? advancedStatsRenderers[playerData.Position](playerData, teamScheme)
                    : null}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Next Gen Stats</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  {nextGenStatsRenderers[playerData.Position]
                    ? nextGenStatsRenderers[playerData.Position](playerData, teamScheme)
                    : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );  
}
