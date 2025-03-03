"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import CircularProgressBar from '@/app/components/CircularProgressBar';
import { renderQBAdvancedStats, renderQBNextGenStats } from '@/app/utils/QBDisplayStats';
import { renderRBAdvancedStats, renderRBNextGenStats, renderRBStandardReceivingStats } from '@/app/utils/RBDisplayStats';
import { renderWRAdvancedStats, renderWRNextGenStats } from '@/app/utils/WRDisplayStats';
import { renderTEAdvancedStats, renderTENextGenStats} from '@/app/utils/TEDisplayStats';
import OLDisplayStats from '@/app/utils/OLDisplayStats';

const advancedStatsRenderers: Record<string, (playerData: any, teamScheme: string) => React.ReactElement> = {
  QB: renderQBAdvancedStats,
  RB: renderRBAdvancedStats,
  WR: renderWRAdvancedStats,
  TE: renderTEAdvancedStats
};

const nextGenStatsRenderers: Record<string, (playerData: any, teamScheme: string) => React.ReactElement> = {
  QB: renderQBNextGenStats,
  RB: renderRBNextGenStats,
  WR: renderWRNextGenStats,
  TE: renderTENextGenStats
};

// Helper to format whole number stats
function formatStat(value: string | number, type: 'total'): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) {
    return value.toString();
  }
  return Number.isInteger(num) ? num.toString() : num.toFixed(0);
}

export default function PlayerPage() {
  const params = useParams();
  const [playerData, setPlayerData] = useState<any>(null);
  const [teamScheme, setTeamScheme] = useState<string>('');
  // Total count for offensive linemen rankings
  const totalCount = 366;

  // Array of offensive line positions (for these players, position is under "pos")
  const offensiveLinePositions = ['OT', 'G', 'C', 'OL'];

  // Fetch the player data from multiple endpoints (QB, RB, WR, and oline)
  useEffect(() => {
    if (!params?.posteam || !params?.player_name) return;

    async function fetchPlayer() {
      try {
        // Try endpoints for QB, RB, WR, and then oline
        const positions = ['QB', 'RB', 'WR', 'TE', 'oline'];
        for (const pos of positions) {
          let url = '';
          if (pos.toLowerCase() === 'oline') {
            url = `http://localhost:5000/teams/${params.posteam}/olineinf/${params.player_name}`;
          } else {
            url = `http://localhost:5000/teams/${params.posteam}/${pos}info/${params.player_name}`;
          }
          const res = await fetch(url, { cache: 'no-store' });
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
        if (teamData && teamData.scheme) {
          setTeamScheme(teamData.scheme);
        }
      })
      .catch(error => console.error('Error fetching team data:', error));
  }, [params?.posteam]);

  function convertHeightToFeetInches(heightInInches: number) {
    const feet = Math.floor(heightInInches / 12);
    const inches = heightInInches % 12;
    return `${feet}'${inches}"`;
  }

  if (!playerData) {
    return <div className="container-fluid">Loading player data...</div>;
  }

  // Determine player's position using the "pos" field if available, else "Position"
  const playerPos = (playerData.pos || playerData.Position || '').toUpperCase();
  const isOLine = offensiveLinePositions.includes(playerPos);

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        {/* Player Info & Standard Stats Row */}
        <div className="col-md-8">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Player Information</h6>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Left: Player Info */}
                <div className="col-md-8">
                  <h4 className="card-title mb-2">
                    <strong>{playerData.player_name || playerData.name}</strong>
                  </h4>
                  <p><strong>Age:</strong> {parseInt(playerData.age, 10)}</p>
                  <p><strong>Height:</strong> {convertHeightToFeetInches(playerData.height)}</p>
                  <p><strong>Weight:</strong> {formatStat(playerData.weight, 'total')} lbs</p>
                  <p><strong>YOE:</strong> {playerData.YOE || playerData.yoe} years </p>
                  <p>
                    <strong>Position:</strong> {playerData.pos || playerData.Position}
                  </p>
                  <p>
                    <strong>Projected AAV:</strong> 
                    {(playerData.aav || playerData.AAV) ? ` $${(+ (playerData.aav || playerData.AAV)).toLocaleString()}` : ''}
                  </p>
                </div>
                {/* Right: Circular Progress Bar */}
                <div className="col-md-4 d-flex flex-column align-items-center justify-content-center ml-n5">
                  <CircularProgressBar 
                    progress={(playerData.final_fit || playerData.final_rating || 0) * 100} 
                    size={222} 
                    strokeWidth={15} 
                    duration={1500}
                    headshotUrl={playerData.headshot_url} 
                  />
                  <small className="text-muted mt-2">
                    Player Fit: {((playerData.final_fit || playerData.final_rating)*100).toFixed(1)}%
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* For non-OLine players, Standard Stats Card */}
        {!isOLine && (
          <div className="col-md-4">
            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Standard Stats {playerData.season}</h6>
              </div>
              <div className="card-body">
                {playerData.Position === 'QB' && (
                  <>
                    <p><strong>Passing TDs:</strong> {formatStat(playerData.passing_tds, 'total')}</p>
                    <p><strong>Passing Yards:</strong> {formatStat(playerData.passing_yards, 'total')}</p>
                    <p><strong>Interceptions:</strong> {formatStat(playerData.interceptions, 'total')}</p>
                    <p><strong>Games:</strong> {formatStat(playerData.games, 'total')}</p>
                  </>
                )}
                {playerData.Position === 'RB' && (
                  <>
                    <p><strong>Rushing TDs:</strong> {formatStat(playerData.rushing_tds, 'total')}</p>
                    <p><strong>Rushing Yards:</strong> {formatStat(playerData.rushing_yards, 'total')}</p>
                    <p><strong>Fumbles:</strong> {formatStat(playerData.rushing_fumbles, 'total')}</p>
                    <p><strong>Carries:</strong> {formatStat(playerData.carries, 'total')}</p>
                    <p><strong>Games:</strong> {formatStat(playerData.games, 'total')}</p>
                  </>
                )}
                {playerData.Position === 'WR' || playerData.Position === 'TE' && (
                  <>
                    <p><strong>Receiving TDs:</strong> {formatStat(playerData.receiving_tds, 'total')}</p>
                    <p><strong>Catches:</strong> {formatStat(playerData.receptions, 'total')}</p>
                    <p><strong>Receiving Yards:</strong> {formatStat(playerData.receiving_yards, 'total')}</p>
                    <p><strong>Targets:</strong> {formatStat(playerData.targets, 'total')}</p>
                    <p><strong>Games:</strong> {formatStat(playerData.games, 'total')}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* If the player is an offensive lineman or TE (using the "pos" field) render OL or TE advanced stats */}
      {isOLine && (
        <div className="row mb-4">
          <div className="col-md-12">
            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">2024 Stats</h6>
              </div>
              <div className="card-body">
                <OLDisplayStats playerData={playerData} totalCount={totalCount} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced and Next Gen Stats for non-OLine players */}
      {!isOLine && (
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
      )}
    </div>
  );
}
