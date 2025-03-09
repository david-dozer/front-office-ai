"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CircularProgressBar from '@/app/components/CircularProgressBar';
import { renderQBAdvancedStats, renderQBNextGenStats, renderRushingStats } from '@/app/utils/QBDisplayStats';
import { renderRBAdvancedStats, renderRBNextGenStats, renderRBStandardReceivingStats } from '@/app/utils/RBDisplayStats';
import { renderWRAdvancedStats, renderWRNextGenStats } from '@/app/utils/WRDisplayStats';
import { renderTEAdvancedStats, renderTENextGenStats } from '@/app/utils/TEDisplayStats';
import OLDisplayStats, { OLPlayerData } from '@/app/utils/OLDisplayStats';

interface PlayerData {
  player_name?: string;
  name?: string;
  age?: number | string;
  height?: number;
  weight?: number | string;
  YOE?: number | string;
  yoe?: number | string;
  pos?: string;
  Position?: string;
  market_value?: number;
  final_fit?: number;
  final_rating?: number;
  headshot_url?: string;
  season?: string;
  // QB Stats
  passing_tds?: number;
  passing_yards?: number;
  interceptions?: number;
  games?: number;
  // RB Stats
  rushing_tds?: number;
  rushing_yards?: number;
  rushing_fumbles?: number;
  carries?: number;
  // WR Stats
  receiving_tds?: number;
  receptions?: number;
  receiving_yards?: number;
  targets?: number;
}

// New interface for team data returned by the endpoint.
interface TeamData {
  posteam: string;
  scheme?: string;
}

const advancedStatsRenderers: Record<string, (playerData: PlayerData, teamScheme: string) => React.ReactElement> = {
  QB: renderQBAdvancedStats as unknown as (playerData: PlayerData, teamScheme: string) => React.ReactElement,
  RB: renderRBAdvancedStats as unknown as (playerData: PlayerData, teamScheme: string) => React.ReactElement,
  WR: renderWRAdvancedStats as unknown as (playerData: PlayerData, teamScheme: string) => React.ReactElement,
  TE: renderTEAdvancedStats as unknown as (playerData: PlayerData, teamScheme: string) => React.ReactElement,
};

const nextGenStatsRenderers: Record<string, (playerData: PlayerData, teamScheme: string) => React.ReactElement> = {
  QB: renderQBNextGenStats as unknown as (playerData: PlayerData, teamScheme: string) => React.ReactElement,
  RB: renderRBNextGenStats as unknown as (playerData: PlayerData, teamScheme: string) => React.ReactElement,
  WR: renderWRNextGenStats as unknown as (playerData: PlayerData, teamScheme: string) => React.ReactElement,
  TE: renderTENextGenStats as unknown as (playerData: PlayerData, teamScheme: string) => React.ReactElement,
};


// Helper to format whole number stats using a named parameter "statType"
function formatStat(value: string | number, statType: 'total' | 'average'): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) {
    return value.toString();
  }
  if (statType === 'total') {
    return Number.isInteger(num) ? num.toString() : num.toFixed(0);
  } else if (statType === 'average') {
    return num.toFixed(2);
  }
  return num.toString();
}

export default function PlayerPage() {
  const params = useParams();
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [teamScheme, setTeamScheme] = useState<string>('');
  // const totalCount = 366;
  const offensiveLinePositions = ['OT', 'G', 'C', 'OL'];

  // Fetch the player data from multiple endpoints (QB, RB, WR, TE, and oline)
  useEffect(() => {
    if (!params?.posteam || !params?.player_name) return;

    async function fetchPlayer() {
      try {
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
            const data: PlayerData = await res.json();
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
      .then((data: TeamData[]) => {
        const teamData = data.find((t) => t.posteam === params.posteam);
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
                  <p><strong>Age:</strong> {parseInt(String(playerData.age), 10)}</p>
                  <p><strong>Height:</strong> {convertHeightToFeetInches(playerData.height || 0)}</p>
                  <p><strong>Weight:</strong> {formatStat(playerData.weight || 0, 'total')} lbs</p>
                  <p><strong>YOE:</strong> {playerData.YOE || playerData.yoe} years </p>
                  <p>
                    <strong>Position:</strong> {playerData.pos || playerData.Position}
                  </p>
                  <p>
                    <strong>Projected AAV:</strong> 
                    {(playerData.market_value) ? ` $${(+ (playerData.market_value)).toLocaleString()}` : ''}
                  </p>
                </div>
                {/* Right: Circular Progress Bar */}
                <div className="col-12 col-md-4 d-flex flex-column align-items-center justify-content-center ml-md-n5 ml-0">
                  <CircularProgressBar 
                    progress={(playerData.final_fit || playerData.final_rating || 0) * 100} 
                    size={225} 
                    strokeWidth={15} 
                    duration={1500}
                    headshotUrl={playerData.headshot_url} 
                  />
                  <small className="text-muted mt-2">
                    Player Fit: {(((playerData.final_fit ?? playerData.final_rating) ?? 0) * 100).toFixed(1)}%
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Standard Stats Card for non-offensive linemen */}
        {!isOLine && (
          <div className="col-md-4">
            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Standard Stats {playerData.season}</h6>
              </div>
              <div className="card-body">
                {playerData.Position === 'QB' && (
                  <>
                    <p><strong>Passing TDs:</strong> {formatStat(playerData.passing_tds || 0, 'total')}</p>
                    <p><strong>Passing Yards:</strong> {formatStat(playerData.passing_yards || 0, 'total')}</p>
                    <p><strong>Interceptions:</strong> {formatStat(playerData.interceptions || 0, 'total')}</p>
                    <p><strong>Games:</strong> {formatStat(playerData.games || 0, 'total')}</p>
                  </>
                )}
                {playerData.Position === 'RB' && (
                  <>
                    <p><strong>Rushing TDs:</strong> {formatStat(playerData.rushing_tds || 0, 'total')}</p>
                    <p><strong>Rushing Yards:</strong> {formatStat(playerData.rushing_yards || 0, 'total')}</p>
                    <p><strong>Fumbles:</strong> {formatStat(playerData.rushing_fumbles || 0, 'total')}</p>
                    <p><strong>Carries:</strong> {formatStat(playerData.carries || 0, 'total')}</p>
                    <p><strong>Games:</strong> {formatStat(playerData.games || 0, 'total')}</p>
                  </>
                )}
                {playerData.Position === 'WR' && (
                  <>
                    <p><strong>Receiving TDs:</strong> {formatStat(playerData.receiving_tds || 0, 'total')}</p>
                    <p><strong>Catches:</strong> {formatStat(playerData.receptions || 0, 'total')}</p>
                    <p><strong>Receiving Yards:</strong> {formatStat(playerData.receiving_yards || 0, 'total')}</p>
                    <p><strong>Targets:</strong> {formatStat(playerData.targets || 0, 'total')}</p>
                    <p><strong>Games:</strong> {formatStat(playerData.games || 0, 'total')}</p>
                  </>
                )}
                {playerData.Position === 'TE' && (
                  <>
                    <p><strong>Receiving TDs:</strong> {formatStat(playerData.receiving_tds || 0, 'total')}</p>
                    <p><strong>Catches:</strong> {formatStat(playerData.receptions || 0, 'total')}</p>
                    <p><strong>Receiving Yards:</strong> {formatStat(playerData.receiving_yards || 0, 'total')}</p>
                    <p><strong>Targets:</strong> {formatStat(playerData.targets || 0, 'total')}</p>
                    <p><strong>Games:</strong> {formatStat(playerData.games || 0, 'total')}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Render OL advanced stats if the player is an offensive lineman */}
      {isOLine && (
        <div className="row mb-4">
          <div className="col-md-12">
            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">2024 Stats</h6>
              </div>
              <div className="card-body">
              <OLDisplayStats playerData={playerData as OLPlayerData} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced and Next Gen Stats for non-offensive linemen */}
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
                    {playerData.Position &&
                      advancedStatsRenderers[playerData.Position as keyof typeof advancedStatsRenderers]
                        ? advancedStatsRenderers[playerData.Position as keyof typeof advancedStatsRenderers](playerData, teamScheme)
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
                    {playerData.Position &&
                      nextGenStatsRenderers[playerData.Position as keyof typeof nextGenStatsRenderers]
                        ? nextGenStatsRenderers[playerData.Position as keyof typeof nextGenStatsRenderers](playerData, teamScheme)
                        : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conditional Rushing Stats for QBs */}
      {!isOLine &&
        playerPos === 'QB' &&
        ["PISTOL POWER SPREAD", "SPREAD OPTION", "SHANAHAN WIDE ZONE", "RUN POWER"].includes(teamScheme.toUpperCase()) && (
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card shadow mb-4">
                <div className="card-header py-3">
                  <h6 className="m-0 font-weight-bold text-primary">Rushing Stats</h6>
                </div>
                <div className="card-body">
                  {renderRushingStats(playerData)}
                </div>
              </div>
            </div>
          </div>
      )}

      {/* Conditional Standard Receiving Stats Card for RBs */}
      {!isOLine &&
        playerPos === 'RB' &&
        ["AIR RAID", "WEST COAST", "WEST COAST MCVAY", "MCVAY SYSTEM"].includes(teamScheme.toUpperCase()) && (
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card shadow mb-4">
                <div className="card-header py-3">
                  <h6 className="m-0 font-weight-bold text-primary">Receiving Stats</h6>
                </div>
                <div className="card-body">
                  {renderRBStandardReceivingStats(playerData)}
                </div>
              </div>
            </div>
          </div>
      )}
    </div>
  );
}
