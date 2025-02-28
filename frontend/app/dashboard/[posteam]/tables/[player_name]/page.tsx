'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CircularProgressBar from '@/app/components/CircularProgressBar';

export default function PlayerPage() {
  const params = useParams();
  const [playerData, setPlayerData] = useState<any>(null);

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
        {/* Left column: Player Info */}
        <div className="col-md-8">
          <div className="card shadow mb-4">
            <div className="card-body">
              <h4 className="card-title mb-2">{playerData.player_name}</h4>
              <p><strong>Age:</strong> {parseInt(playerData.age, 10)}</p>
              <p><strong>Height:</strong> {convertHeightToFeetInches(playerData.height)}</p>
              <p><strong>Weight:</strong> {playerData.weight}</p>
              <p><strong>YOE:</strong> {playerData.YOE}</p>
              <p><strong>Position:</strong> {playerData.Position}</p>
              <p><strong>Projected AAV:</strong> 
                {playerData.AAV ? ` $${(+playerData.AAV).toLocaleString()}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Circular Progress Bar */}
        <div className="col-md-4 d-flex align-items-center justify-content-center">
          <div className="card shadow" style={{ width: '250px', height: '250px' }}>
            <div className="card-body d-flex align-items-center justify-content-center">
              <CircularProgressBar 
                progress={(playerData.final_fit || 0) * 100} 
                size={200} 
                strokeWidth={15} 
                duration={1500} 
              />
            </div>
            <div className="text-center mb-2">
              <small className="text-muted">
                Player Fit: {(playerData.final_fit * 100).toFixed(1)}%
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Standard Stats */}
      <div className="row">
        <div className="col-md-12">
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
    </div>
  );
}
