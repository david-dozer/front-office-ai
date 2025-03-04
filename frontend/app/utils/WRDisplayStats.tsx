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
  return (
    <span style={{ fontSize: "0.70em", color: "#666" }}>
      ({ordinalSuffixOf(rank)} out of 295 WRs)
    </span>
  );
}

export function renderWRAdvancedStats(playerData: any, teamScheme: string): React.ReactElement {
  switch (teamScheme) {
    case 'Air Raid':
      return (
        <>
          <p>
            <strong>Receiving Air Yards:</strong> {formatStat(playerData.receiving_air_yards, 'total')} {formatRank(playerData.receiving_air_yards_rank)}
          </p>
          <p>
            <strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch, 'total')} {formatRank(playerData.receiving_yards_after_catch_rank)}
          </p>
          <p>
            <strong>Receiving EPA:</strong> {formatStat(playerData.receiving_epa, 'average')} {formatRank(playerData.receiving_epa_rank)}
          </p>
          <p>
            <strong>Target Share:</strong> {formatStat(playerData.target_share * 100, 'average')}% {formatRank(playerData.target_share_rank)}
          </p>
        </>
      );
    case 'Spread Option':
      return (
        <>
          <p>
            <strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs, 'total')} {formatRank(playerData.receiving_first_downs_rank)}
          </p>
          <p>
            <strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch, 'total')} {formatRank(playerData.receiving_yards_after_catch_rank)}
          </p>
          <p>
            <strong>RACR:</strong> {formatStat(playerData.racr, 'average')} {formatRank(playerData.racr_rank)}
          </p>
          <p>
            <strong>Receiving EPA:</strong> {formatStat(playerData.receiving_epa, 'average')} {formatRank(playerData.receiving_epa_rank)}
          </p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p>
            <strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs, 'total')} {formatRank(playerData.receiving_first_downs_rank)}
          </p>
          <p>
            <strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch, 'total')} {formatRank(playerData.receiving_yards_after_catch_rank)}
          </p>
          <p>
            <strong>Air Yards Share:</strong> {formatStat(playerData.air_yards_share, 'average')} {formatRank(playerData.air_yards_share_rank)}
          </p>
          <p>
            <strong>Receiving EPA:</strong> {formatStat(playerData.receiving_epa, 'average')} {formatRank(playerData.receiving_epa_rank)}
          </p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p>
            <strong>Receiving Air Yards:</strong> {formatStat(playerData.receiving_air_yards, 'total')} {formatRank(playerData.receiving_air_yards_rank)}
          </p>
          <p>
            <strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch, 'total')} {formatRank(playerData.receiving_yards_after_catch_rank)}
          </p>
          <p>
            <strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs, 'total')} {formatRank(playerData.receiving_first_downs_rank)}
          </p>
          <p>
            <strong>Receiving EPA:</strong> {formatStat(playerData.receiving_epa, 'average')} {formatRank(playerData.receiving_epa_rank)}
          </p>
        </>
      );
    case 'Shanahan Wide Zone':
      return (
        <>
          <p>
            <strong>Receiving EPA:</strong> {formatStat(playerData.receiving_epa, 'average')} {formatRank(playerData.receiving_epa_rank)}
          </p>
          <p>
            <strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs, 'total')} {formatRank(playerData.receiving_first_downs_rank)}
          </p>
          <p>
            <strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch, 'total')} {formatRank(playerData.receiving_yards_after_catch_rank)}
          </p>
          <p>
            <strong>RACR:</strong> {formatStat(playerData.racr, 'average')} {formatRank(playerData.racr_rank)}
          </p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p>
            <strong>Receiving EPA:</strong> {formatStat(playerData.receiving_epa, 'average')} {formatRank(playerData.receiving_epa_rank)}
          </p>
          <p>
            <strong>Receiving Fumbles:</strong> {formatStat(playerData.receiving_fumbles, 'total')} {formatRank(playerData.receiving_fumbles_rank)}
          </p>
          <p>
            <strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs, 'total')} {formatRank(playerData.receiving_first_downs_rank)}
          </p>
          <p>
            <strong>Target Share:</strong> {formatStat(playerData.target_share * 100, 'average')}% {formatRank(playerData.target_share_rank)}
          </p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p>
            <strong>Receiving Air Yards:</strong> {formatStat(playerData.receiving_air_yards, 'total')} {formatRank(playerData.receiving_air_yards_rank)}
          </p>
          <p>
            <strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch, 'total')} {formatRank(playerData.receiving_yards_after_catch_rank)}
          </p>
          <p>
            <strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs, 'total')} {formatRank(playerData.receiving_first_downs_rank)}
          </p>
          <p>
            <strong>RACR:</strong> {formatStat(playerData.racr, 'average')} {formatRank(playerData.racr_rank)}
          </p>
        </>
      );
    default:
      return <p>No advanced stats available for the selected scheme.</p>;
  }
}

export function renderWRNextGenStats(playerData: any, teamScheme: string): React.ReactElement {
  // Check if any Next Gen Stats are empty
  if (
    playerData.ngs_avg_separation === "" ||
    playerData.ngs_avg_intended_air_yards === "" ||
    playerData.ngs_catch_percentage === "" ||
    playerData.ngs_avg_expected_yac === "" ||
    playerData.ngs_percent_share_of_intended_air_yards === "" ||
    playerData.ngs_avg_yac_above_expectation === "" ||
    playerData.ngs_avg_yac === ""
  ) {
    return <p>Not enough activity for Next Gen Stats...</p>;
  }

  switch (teamScheme) {
    case 'Air Raid':
      return (
        <>
          <p>
            <strong>Avg Separation:</strong> {formatStat(playerData.ngs_avg_separation, 'average')} {formatRank(playerData.ngs_avg_separation_rank)}
          </p>
          <p>
            <strong>Avg Intended Air Yards:</strong> {formatStat(playerData.ngs_avg_intended_air_yards, 'average')} {formatRank(playerData.ngs_avg_intended_air_yards_rank)}
          </p>
          <p>
            <strong>Catch Percentage:</strong> {formatStat(playerData.ngs_catch_percentage, 'average')}% {formatRank(playerData.ngs_catch_percentage_rank)}
          </p>
          <p>
            <strong>Avg Expected YAC:</strong> {formatStat(playerData.ngs_avg_expected_yac, 'average')} {formatRank(playerData.ngs_avg_expected_yac_rank)}
          </p>
        </>
      );
    case 'Spread Option':
    case 'West Coast':
    case 'West Coast McVay':
    case 'Shanahan Wide Zone':
    case 'Run Power':
    case 'Pistol Power Spread':
      return (
        <>
          <p>
            <strong>Avg Separation:</strong> {formatStat(playerData.ngs_avg_separation, 'average')} {formatRank(playerData.ngs_avg_separation_rank)}
          </p>
          <p>
            <strong>Avg Intended Air Yards:</strong> {formatStat(playerData.ngs_avg_intended_air_yards, 'average')} {formatRank(playerData.ngs_avg_intended_air_yards_rank)}
          </p>
          <p>
            <strong>Catch Percentage:</strong> {formatStat(playerData.ngs_catch_percentage, 'average')}% {formatRank(playerData.ngs_catch_percentage_rank)}
          </p>
          <p>
            <strong>Share of Intended Air Yards:</strong> {formatStat(playerData.ngs_percent_share_of_intended_air_yards, 'average')}% {formatRank(playerData.ngs_percent_share_of_intended_air_yards_rank)}
          </p>
        </>
      );
    default:
      return <p>No next gen stats available for the selected scheme.</p>;
  }
}
