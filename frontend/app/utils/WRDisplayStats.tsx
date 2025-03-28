import React from 'react';
import { ordinalSuffixOf } from './OLDisplayStats';

export interface WRPlayerData {
  // Advanced Stats
  receiving_air_yards?: number | string;
  receiving_air_yards_rank?: number;
  receiving_yards_after_catch?: number | string;
  receiving_yards_after_catch_rank?: number;
  receiving_epa?: number | string;
  receiving_epa_rank?: number;
  target_share?: number;
  target_share_rank?: number;
  receiving_first_downs?: number | string;
  receiving_first_downs_rank?: number;
  racr?: number | string;
  racr_rank?: number;
  air_yards_share?: number | string;
  air_yards_share_rank?: number;
  // Next Gen Stats for WR
  ngs_avg_separation?: number | string;
  ngs_avg_separation_rank?: number;
  ngs_avg_intended_air_yards?: number | string;
  ngs_avg_intended_air_yards_rank?: number;
  ngs_catch_percentage?: number | string;
  ngs_catch_percentage_rank?: number;
  ngs_avg_expected_yac?: number | string;
  ngs_avg_expected_yac_rank?: number;
  ngs_percent_share_of_intended_air_yards?: number | string;
  ngs_percent_share_of_intended_air_yards_rank?: number;
  ngs_avg_yac_above_expectation?: number | string;
  ngs_avg_yac?: number | string;
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
      ({ordinalSuffixOf(rank)} out of 295 WRs)
    </span>
  );
}

export function renderWRAdvancedStats(playerData: WRPlayerData, teamScheme: string): React.ReactElement {
  switch (teamScheme) {
    case 'Air Raid':
      return (
        <>
          <p>
            <strong>Receiving Air Yards:</strong> {formatStat(playerData.receiving_air_yards ?? 0, 'total')}{' '}
            {playerData.receiving_air_yards_rank !== undefined && formatRank(playerData.receiving_air_yards_rank)}
          </p>
          <p>
            <strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch ?? 0, 'total')}{' '}
            {playerData.receiving_yards_after_catch_rank !== undefined && formatRank(playerData.receiving_yards_after_catch_rank)}
          </p>
          <p>
            <strong title="Expected Points Added (EPA) measures how explosive a receiver is.">
              Receiving EPA:
            </strong>{' '}
            {formatStat(playerData.receiving_epa ?? 0, 'average')}{' '}
            {playerData.receiving_epa_rank !== undefined && formatRank(playerData.receiving_epa_rank)}
          </p>
          <p>
            <strong>Target Share:</strong> {formatStat((playerData.target_share ?? 0) * 100, 'average')}%{' '}
            {playerData.target_share_rank !== undefined && formatRank(playerData.target_share_rank)}
          </p>
        </>
      );
    case 'Spread Option':
      return (
        <>
          <p>
            <strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs ?? 0, 'total')}{' '}
            {playerData.receiving_first_downs_rank !== undefined && formatRank(playerData.receiving_first_downs_rank)}
          </p>
          <p>
            <strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch ?? 0, 'total')}{' '}
            {playerData.receiving_yards_after_catch_rank !== undefined && formatRank(playerData.receiving_yards_after_catch_rank)}
          </p>
          <p>
            <strong title="RACR is a measure of how well a receiver converts air yards to receiving yards.">
              RACR:
            </strong>{' '}
            {formatStat(playerData.racr ?? 0, 'average')}{' '}
            {playerData.racr_rank !== undefined && formatRank(playerData.racr_rank)}
          </p>
          <p>
            <strong title="Expected Points Added (EPA) measures how explosive a receiver is.">
              Receiving EPA:
            </strong>{' '}
            {formatStat(playerData.receiving_epa ?? 0, 'average')}{' '}
            {playerData.receiving_epa_rank !== undefined && formatRank(playerData.receiving_epa_rank)}
          </p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p>
            <strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs ?? 0, 'total')}{' '}
            {playerData.receiving_first_downs_rank !== undefined && formatRank(playerData.receiving_first_downs_rank)}
          </p>
          <p>
            <strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch ?? 0, 'total')}{' '}
            {playerData.receiving_yards_after_catch_rank !== undefined && formatRank(playerData.receiving_yards_after_catch_rank)}
          </p>
          <p>
            <strong>Air Yards Share:</strong> {formatStat(playerData.air_yards_share ?? 0, 'average')}{' '}
            {playerData.air_yards_share_rank !== undefined && formatRank(playerData.air_yards_share_rank)}
          </p>
          <p>
            <strong title="Expected Points Added (EPA) measures how explosive a receiver is.">
              Receiving EPA:
            </strong>{' '}
            {formatStat(playerData.receiving_epa ?? 0, 'average')}{' '}
            {playerData.receiving_epa_rank !== undefined && formatRank(playerData.receiving_epa_rank)}
          </p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p>
            <strong>Receiving Air Yards:</strong> {formatStat(playerData.receiving_air_yards ?? 0, 'total')}{' '}
            {playerData.receiving_air_yards_rank !== undefined && formatRank(playerData.receiving_air_yards_rank)}
          </p>
          <p>
            <strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch ?? 0, 'total')}{' '}
            {playerData.receiving_yards_after_catch_rank !== undefined && formatRank(playerData.receiving_yards_after_catch_rank)}
          </p>
          <p>
            <strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs ?? 0, 'total')}{' '}
            {playerData.receiving_first_downs_rank !== undefined && formatRank(playerData.receiving_first_downs_rank)}
          </p>
          <p>
            <strong title="Expected Points Added (EPA) measures how explosive a receiver is.">
              Receiving EPA:
            </strong>{' '}
            {formatStat(playerData.receiving_epa ?? 0, 'average')}{' '}
            {playerData.receiving_epa_rank !== undefined && formatRank(playerData.receiving_epa_rank)}
          </p>
        </>
      );
    case 'Shanahan Wide Zone':
      return (
        <>
          <p>
            <strong title="Expected Points Added (EPA) measures how explosive a receiver is.">
              Receiving EPA:
            </strong>{' '}
            {formatStat(playerData.receiving_epa ?? 0, 'average')}{' '}
            {playerData.receiving_epa_rank !== undefined && formatRank(playerData.receiving_epa_rank)}
          </p>
          <p>
            <strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs ?? 0, 'total')}{' '}
            {playerData.receiving_first_downs_rank !== undefined && formatRank(playerData.receiving_first_downs_rank)}
          </p>
          <p>
            <strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch ?? 0, 'total')}{' '}
            {playerData.receiving_yards_after_catch_rank !== undefined && formatRank(playerData.receiving_yards_after_catch_rank)}
          </p>
          <p>
            <strong title="RACR is a measure of how well a receiver converts air yards to receiving yards.">
              RACR:
            </strong>{' '}
            {formatStat(playerData.racr ?? 0, 'average')}{' '}
            {playerData.racr_rank !== undefined && formatRank(playerData.racr_rank)}
          </p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p>
            <strong title="Expected Points Added (EPA) measures how explosive a receiver is.">
              Receiving EPA:
            </strong>{' '}
            {formatStat(playerData.receiving_epa ?? 0, 'average')}{' '}
            {playerData.receiving_epa_rank !== undefined && formatRank(playerData.receiving_epa_rank)}
          </p>
          <p>
            <strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs ?? 0, 'total')}{' '}
            {playerData.receiving_first_downs_rank !== undefined && formatRank(playerData.receiving_first_downs_rank)}
          </p>
          <p>
            <strong>Target Share:</strong> {formatStat((playerData.target_share ?? 0) * 100, 'average')}%{' '}
            {playerData.target_share_rank !== undefined && formatRank(playerData.target_share_rank)}
          </p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p>
            <strong>Receiving Air Yards:</strong> {formatStat(playerData.receiving_air_yards ?? 0, 'total')}{' '}
            {playerData.receiving_air_yards_rank !== undefined && formatRank(playerData.receiving_air_yards_rank)}
          </p>
          <p>
            <strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch ?? 0, 'total')}{' '}
            {playerData.receiving_yards_after_catch_rank !== undefined && formatRank(playerData.receiving_yards_after_catch_rank)}
          </p>
          <p>
            <strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs ?? 0, 'total')}{' '}
            {playerData.receiving_first_downs_rank !== undefined && formatRank(playerData.receiving_first_downs_rank)}
          </p>
          <p>
            <strong title="RACR is a measure of how well a receiver converts air yards to receiving yards.">
              RACR:
            </strong>{' '}
            {formatStat(playerData.racr ?? 0, 'average')}{' '}
            {playerData.racr_rank !== undefined && formatRank(playerData.racr_rank)}
          </p>
        </>
      );
    default:
      return <p>No advanced stats available for the selected scheme.</p>;
  }
}

export function renderWRNextGenStats(playerData: WRPlayerData, teamScheme: string): React.ReactElement {
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
            <strong>Avg Separation:</strong> {formatStat(playerData.ngs_avg_separation ?? 0, 'average')}{' '}
            {playerData.ngs_avg_separation_rank !== undefined && formatRank(playerData.ngs_avg_separation_rank)}
          </p>
          <p>
            <strong>Avg Intended Air Yards:</strong> {formatStat(playerData.ngs_avg_intended_air_yards ?? 0, 'average')}{' '}
            {playerData.ngs_avg_intended_air_yards_rank !== undefined && formatRank(playerData.ngs_avg_intended_air_yards_rank)}
          </p>
          <p>
            <strong>Catch Percentage:</strong> {formatStat(playerData.ngs_catch_percentage ?? 0, 'average')}%{' '}
            {playerData.ngs_catch_percentage_rank !== undefined && formatRank(playerData.ngs_catch_percentage_rank)}
          </p>
          <p>
            <strong>Avg Expected YAC:</strong> {formatStat(playerData.ngs_avg_expected_yac ?? 0, 'average')}{' '}
            {playerData.ngs_avg_expected_yac_rank !== undefined && formatRank(playerData.ngs_avg_expected_yac_rank)}
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
            <strong>Avg Separation:</strong> {formatStat(playerData.ngs_avg_separation ?? 0, 'average')}{' '}
            {playerData.ngs_avg_separation_rank !== undefined && formatRank(playerData.ngs_avg_separation_rank)}
          </p>
          <p>
            <strong>Avg Intended Air Yards:</strong> {formatStat(playerData.ngs_avg_intended_air_yards ?? 0, 'average')}{' '}
            {playerData.ngs_avg_intended_air_yards_rank !== undefined && formatRank(playerData.ngs_avg_intended_air_yards_rank)}
          </p>
          <p>
            <strong>Catch Percentage:</strong> {formatStat(playerData.ngs_catch_percentage ?? 0, 'average')}%{' '}
            {playerData.ngs_catch_percentage_rank !== undefined && formatRank(playerData.ngs_catch_percentage_rank)}
          </p>
          <p>
            <strong>Share of Intended Air Yards:</strong> {formatStat(playerData.ngs_percent_share_of_intended_air_yards ?? 0, 'average')}%{' '}
            {playerData.ngs_percent_share_of_intended_air_yards_rank !== undefined && formatRank(playerData.ngs_percent_share_of_intended_air_yards_rank)}
          </p>
        </>
      );
    default:
      return <p>No next gen stats available for the selected scheme.</p>;
  }
}
