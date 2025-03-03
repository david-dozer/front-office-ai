import React from 'react';
import { ordinalSuffixOf } from './OLDisplayStats';

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
  return <span style={{ fontSize: "0.70em", color: "#666" }}>({ordinalSuffixOf(rank)} out of 154 TEs)</span>;
}

export function renderTEAdvancedStats(playerData: any, teamScheme: string): React.ReactElement {
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
          <p><strong>Receiving EPA:</strong> {formatStat(playerData.receiving_epa, 'average')} {formatRank(playerData.adv_receiving_epa_rank)}</p>
          <p><strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs, 'total')} {formatRank(playerData.adv_receiving_first_downs_rank)}</p>
        </>
      );
    default:
      return <p>No advanced stats available for the selected scheme.</p>;
  }
}

export function renderTENextGenStats(playerData: any, teamScheme: string): React.ReactElement {
  switch (teamScheme) {
    case 'Air Raid':
    case 'Spread Option':
    case 'West Coast':
    case 'West Coast McVay':
    case 'Run Power':
    case 'Pistol Power Spread':
      return (
        <>
          <p><strong>Yards After Catch:</strong> {formatStat(playerData.ngs_avg_yac, 'average')} {formatRank(playerData.adv_ngs_avg_yac_rank)}</p>
          <p><strong>Catch%:</strong> {formatStat(playerData.ngs_catch_percentage, 'average')}% {formatRank(playerData.adv_ngs_catch_percentage_rank)}</p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p><strong>Separation:</strong> {formatStat(playerData.ngs_avg_separation, 'average')} {formatRank(playerData.adv_ngs_avg_separation_rank)}</p>
        </>
      );
    default:
      return <p>No Next Gen stats available for the selected scheme.</p>;
  }
}
