import React from 'react';
import { ordinalSuffixOf } from './OLDisplayStats';

export interface TEPlayerData {
  receiving_epa?: number | string;
  adv_receiving_epa_rank?: number;
  receiving_first_downs?: number | string;
  adv_receiving_first_downs_rank?: number;
  ngs_avg_yac?: number | string;
  adv_ngs_avg_yac_rank?: number;
  ngs_catch_percentage?: number | string;
  adv_ngs_catch_percentage_rank?: number;
  ngs_avg_separation?: number | string;
  adv_ngs_avg_separation_rank?: number;
}

// Helper to format stat values
function formatStat(value: string | number, type: 'total' | 'average'): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return value.toString();
  if (type === 'total') {
    return Number.isInteger(num) ? num.toString() : num.toFixed(0);
  } else if (type === 'average') {
    return num.toFixed(2);
  }
  return value.toString();
}

// Helper to format ranking output in smaller font
function formatRank(rank: number): React.ReactElement {
  return (
    <span style={{ fontSize: "0.70em", color: "#666" }}>
      ({ordinalSuffixOf(rank)} out of 154 TEs)
    </span>
  );
}

export function renderTEAdvancedStats(playerData: TEPlayerData, teamScheme: string): React.ReactElement {
  switch (teamScheme) {
    case 'Air Raid':
    case 'Spread Option':
    case 'West Coast':
    case 'West Coast McVay':
    case 'Shanahan Wide Zone':
    case 'Run Power':
    case 'Pistol Power Spread':
      return (
        <>
          <p>
            <strong>Receiving EPA:</strong> {formatStat(playerData.receiving_epa ?? 0, 'average')}{' '}
            {playerData.adv_receiving_epa_rank !== undefined && formatRank(playerData.adv_receiving_epa_rank)}
          </p>
          <p>
            <strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs ?? 0, 'total')}{' '}
            {playerData.adv_receiving_first_downs_rank !== undefined && formatRank(playerData.adv_receiving_first_downs_rank)}
          </p>
        </>
      );
    default:
      return <p>No advanced stats available for the selected scheme.</p>;
  }
}

export function renderTENextGenStats(playerData: TEPlayerData, teamScheme: string): React.ReactElement {
  switch (teamScheme) {
    case 'Air Raid':
    case 'Spread Option':
    case 'West Coast':
    case 'West Coast McVay':
    case 'Run Power':
    case 'Pistol Power Spread':
      return (
        <>
          <p>
            <strong>Yards After Catch:</strong> {formatStat(playerData.ngs_avg_yac ?? 0, 'average')}{' '}
            {playerData.adv_ngs_avg_yac_rank !== undefined && formatRank(playerData.adv_ngs_avg_yac_rank)}
          </p>
          <p>
            <strong>Catch%:</strong> {formatStat(playerData.ngs_catch_percentage ?? 0, 'average')}%{' '}
            {playerData.adv_ngs_catch_percentage_rank !== undefined && formatRank(playerData.adv_ngs_catch_percentage_rank)}
          </p>
          <p>
            <strong>Separation:</strong> {formatStat(playerData.ngs_avg_separation ?? 0, 'average')}{' '}
            {playerData.adv_ngs_avg_separation_rank !== undefined && formatRank(playerData.adv_ngs_avg_separation_rank)}
          </p>
        </>
      );
    default:
      return <p>No Next Gen stats available for the selected scheme.</p>;
  }
}
