import React from 'react';
import { ordinalSuffixOf } from './OLDisplayStats';

interface QBPlayerData {
  // Advanced stats keys
  passing_epa?: number | string;
  passing_epa_rank?: number;
  passing_yards?: number | string;
  passing_yards_after_catch?: number | string;
  pass_yards_minus_yac_rank?: number;
  sacks?: number | string;
  sacks_rank?: number;
  sack_fumbles?: number | string;
  sack_fumbles_rank?: number;
  passing_first_downs?: number | string;
  passing_first_downs_rank?: number;
  // Next Gen stats keys
  ngs_avg_time_to_throw?: number | string;
  ngs_avg_time_to_throw_rank?: number;
  ngs_avg_intended_air_yards?: number | string;
  ngs_avg_intended_air_yards_rank?: number;
  ngs_completion_percentage?: number | string;
  ngs_completion_percentage_rank?: number;
  ngs_passer_rating?: number | string;
  ngs_passer_rating_rank?: number;
  ngs_expected_completion_percentage?: number | string;
  ngs_expected_completion_percentage_rank?: number;
  ngs_avg_air_yards_differential?: number | string;
  ngs_avg_air_yards_differential_rank?: number;
  ngs_completion_percentage_above_expectation?: number | string;
  ngs_completion_percentage_above_expectation_rank?: number;
  // Rushing stats keys
  rushing_yards?: number | string;
  carries?: number | string;
  carries_rank?: number;
  rushing_tds?: number | string;
  rushing_tds_rank?: number;
}

function formatStat(value: string | number, type: 'total' | 'average'): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) {
    return value.toString();
  }
  if (type === 'total') {
    return Number.isInteger(num) ? num.toString() : num.toFixed(0);
  } else if (type === 'average') {
    return num.toFixed(2);
  }
  return value.toString();
}

function formatRank(rank: number): React.ReactElement {
  return (
    <span style={{ fontSize: "0.70em", color: "#666" }}>
      ({ordinalSuffixOf(rank)} out of 295 QBs)
    </span>
  );
}

export function renderQBAdvancedStats(playerData: QBPlayerData, teamScheme: string): React.ReactElement {
  switch (teamScheme) {
    case 'Air Raid':
      return (
        <>
          <p>
            <strong title="Expected Points Added (EPA) measures how explosive this QB is.">
              Passing EPA:
            </strong>{' '}
            {formatStat(playerData.passing_epa ?? 0, 'average')}{' '}
            {playerData.passing_epa_rank !== undefined && formatRank(playerData.passing_epa_rank)}
          </p>
          <p>
            <strong>Completed Air Yards:</strong>{' '}
            {formatStat(
              (Number(playerData.passing_yards) - Number(playerData.passing_yards_after_catch)) || 0,
              'total'
            )}{' '}
            {playerData.pass_yards_minus_yac_rank !== undefined && formatRank(playerData.pass_yards_minus_yac_rank)}
          </p>
          <p>
            <strong>Sacks:</strong>{' '}
            {formatStat(playerData.sacks ?? 0, 'total')}{' '}
            {playerData.sacks_rank !== undefined && formatRank(playerData.sacks_rank)}
          </p>
          <p>
            <strong>Sack Fumbles:</strong>{' '}
            {formatStat(playerData.sack_fumbles ?? 0, 'total')}{' '}
            {playerData.sack_fumbles_rank !== undefined && formatRank(playerData.sack_fumbles_rank)}
          </p>
        </>
      );
    case 'Spread Option':
      return (
        <>
          <p>
            <strong title="Expected Points Added (EPA) measures how explosive this QB is.">
              Passing EPA:
            </strong>{' '}
            {formatStat(playerData.passing_epa ?? 0, 'average')}{' '}
            {playerData.passing_epa_rank !== undefined && formatRank(playerData.passing_epa_rank)}
          </p>
          <p>
            <strong>Completed Air Yards:</strong>{' '}
            {formatStat(
              (Number(playerData.passing_yards) - Number(playerData.passing_yards_after_catch)) || 0,
              'total'
            )}{' '}
            {playerData.pass_yards_minus_yac_rank !== undefined && formatRank(playerData.pass_yards_minus_yac_rank)}
          </p>
          <p>
            <strong>Sacks:</strong>{' '}
            {formatStat(playerData.sacks ?? 0, 'total')}{' '}
            {playerData.sacks_rank !== undefined && formatRank(playerData.sacks_rank)}
          </p>
          <p>
            <strong>Sack Fumbles:</strong>{' '}
            {formatStat(playerData.sack_fumbles ?? 0, 'total')}{' '}
            {playerData.sack_fumbles_rank !== undefined && formatRank(playerData.sack_fumbles_rank)}
          </p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p>
            <strong title="Expected Points Added (EPA) measures how explosive this QB is.">
              Passing EPA:
            </strong>{' '}
            {formatStat(playerData.passing_epa ?? 0, 'average')}{' '}
            {playerData.passing_epa_rank !== undefined && formatRank(playerData.passing_epa_rank)}
          </p>
          <p>
            <strong>Passing Yards After Catch:</strong>{' '}
            {formatStat(playerData.passing_yards_after_catch ?? 0, 'total')}{' '}
            {playerData.passing_yards_after_catch !== undefined &&
              playerData.pass_yards_minus_yac_rank !== undefined &&
              formatRank(playerData.pass_yards_minus_yac_rank)}
          </p>
          <p>
            <strong>Sacks:</strong>{' '}
            {formatStat(playerData.sacks ?? 0, 'total')}{' '}
            {playerData.sacks_rank !== undefined && formatRank(playerData.sacks_rank)}
          </p>
          <p>
            <strong>Sack Fumbles:</strong>{' '}
            {formatStat(playerData.sack_fumbles ?? 0, 'total')}{' '}
            {playerData.sack_fumbles_rank !== undefined && formatRank(playerData.sack_fumbles_rank)}
          </p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p>
            <strong title="Expected Points Added (EPA) measures how explosive this QB is.">
              Passing EPA:
            </strong>{' '}
            {formatStat(playerData.passing_epa ?? 0, 'average')}{' '}
            {playerData.passing_epa_rank !== undefined && formatRank(playerData.passing_epa_rank)}
          </p>
          <p>
            <strong>Passing First Downs:</strong>{' '}
            {formatStat(playerData.passing_first_downs ?? 0, 'total')}{' '}
            {playerData.passing_first_downs_rank !== undefined && formatRank(playerData.passing_first_downs_rank)}
          </p>
          <p>
            <strong>Passing Yards After Catch:</strong>{' '}
            {formatStat(playerData.passing_yards_after_catch ?? 0, 'total')}{' '}
            {playerData.passing_yards_after_catch !== undefined &&
              playerData.pass_yards_minus_yac_rank !== undefined &&
              formatRank(playerData.pass_yards_minus_yac_rank)}
          </p>
          <p>
            <strong>Sacks:</strong>{' '}
            {formatStat(playerData.sacks ?? 0, 'total')}{' '}
            {playerData.sacks_rank !== undefined && formatRank(playerData.sacks_rank)}
          </p>
          <p>
            <strong>Sack Fumbles:</strong>{' '}
            {formatStat(playerData.sack_fumbles ?? 0, 'total')}{' '}
            {playerData.sack_fumbles_rank !== undefined && formatRank(playerData.sack_fumbles_rank)}
          </p>
        </>
      );
    case 'Shanahan Wide Zone':
      return (
        <>
          <p>
            <strong title="Expected Points Added (EPA) measures how explosive this QB is.">
              Passing EPA:
            </strong>{' '}
            {formatStat(playerData.passing_epa ?? 0, 'average')}{' '}
            {playerData.passing_epa_rank !== undefined && formatRank(playerData.passing_epa_rank)}
          </p>
          <p>
            <strong>Completed Air Yards:</strong>{' '}
            {formatStat(
              (Number(playerData.passing_yards) - Number(playerData.passing_yards_after_catch)) || 0,
              'total'
            )}{' '}
            {playerData.pass_yards_minus_yac_rank !== undefined && formatRank(playerData.pass_yards_minus_yac_rank)}
          </p>
          <p>
            <strong>Sacks:</strong>{' '}
            {formatStat(playerData.sacks ?? 0, 'total')}{' '}
            {playerData.sacks_rank !== undefined && formatRank(playerData.sacks_rank)}
          </p>
          <p>
            <strong>Sack Fumbles:</strong>{' '}
            {formatStat(playerData.sack_fumbles ?? 0, 'total')}{' '}
            {playerData.sack_fumbles_rank !== undefined && formatRank(playerData.sack_fumbles_rank)}
          </p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p>
            <strong title="Expected Points Added (EPA) measures how explosive this QB is.">
              Passing EPA:
            </strong>{' '}
            {formatStat(playerData.passing_epa ?? 0, 'average')}{' '}
            {playerData.passing_epa_rank !== undefined && formatRank(playerData.passing_epa_rank)}
          </p>
          <p>
            <strong>Sacks:</strong>{' '}
            {formatStat(playerData.sacks ?? 0, 'total')}{' '}
            {playerData.sacks_rank !== undefined && formatRank(playerData.sacks_rank)}
          </p>
          <p>
            <strong>Sack Fumbles:</strong>{' '}
            {formatStat(playerData.sack_fumbles ?? 0, 'total')}{' '}
            {playerData.sack_fumbles_rank !== undefined && formatRank(playerData.sack_fumbles_rank)}
          </p>
          <p>
            <strong>Passing First Downs:</strong>{' '}
            {formatStat(playerData.passing_first_downs ?? 0, 'total')}{' '}
            {playerData.passing_first_downs_rank !== undefined && formatRank(playerData.passing_first_downs_rank)}
          </p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p>
            <strong title="Expected Points Added (EPA) measures how explosive this QB is.">
              Passing EPA:
            </strong>{' '}
            {formatStat(playerData.passing_epa ?? 0, 'average')}{' '}
            {playerData.passing_epa_rank !== undefined && formatRank(playerData.passing_epa_rank)}
          </p>
          <p>
            <strong>Completed Air Yards:</strong>{' '}
            {formatStat(
              (Number(playerData.passing_yards) - Number(playerData.passing_yards_after_catch)) || 0,
              'total'
            )}{' '}
            {playerData.pass_yards_minus_yac_rank !== undefined && formatRank(playerData.pass_yards_minus_yac_rank)}
          </p>
          <p>
            <strong>Sacks:</strong>{' '}
            {formatStat(playerData.sacks ?? 0, 'total')}{' '}
            {playerData.sacks_rank !== undefined && formatRank(playerData.sacks_rank)}
          </p>
          <p>
            <strong>Sack Fumbles:</strong>{' '}
            {formatStat(playerData.sack_fumbles ?? 0, 'total')}{' '}
            {playerData.sack_fumbles_rank !== undefined && formatRank(playerData.sack_fumbles_rank)}
          </p>
        </>
      );
    default:
      return <p>No advanced stats available for the selected scheme.</p>;
  }
}

export function renderQBNextGenStats(playerData: QBPlayerData, teamScheme: string): React.ReactElement {
  switch (teamScheme) {
    case 'Air Raid':
      return (
        <>
          <p>
            <strong>NGS Avg Time to Throw:</strong>{' '}
            {formatStat(playerData.ngs_avg_time_to_throw ?? 0, 'average')}{' '}
            {playerData.ngs_avg_time_to_throw_rank !== undefined && formatRank(playerData.ngs_avg_time_to_throw_rank)}
          </p>
          <p>
            <strong>NGS Avg Intended Air Yards:</strong>{' '}
            {formatStat(playerData.ngs_avg_intended_air_yards ?? 0, 'average')}{' '}
            {playerData.ngs_avg_intended_air_yards_rank !== undefined && formatRank(playerData.ngs_avg_intended_air_yards_rank)}
          </p>
          <p>
            <strong>NGS Completion %:</strong>{' '}
            {formatStat(playerData.ngs_completion_percentage ?? 0, 'average')}{' '}
            {playerData.ngs_completion_percentage_rank !== undefined && formatRank(playerData.ngs_completion_percentage_rank)}
          </p>
          <p>
            <strong>NGS Passer Rating:</strong>{' '}
            {formatStat(playerData.ngs_passer_rating ?? 0, 'average')}{' '}
            {playerData.ngs_passer_rating_rank !== undefined && formatRank(playerData.ngs_passer_rating_rank)}
          </p>
        </>
      );
    case 'Spread Option':
      return (
        <>
          <p>
            <strong>NGS Avg Time to Throw:</strong>{' '}
            {formatStat(playerData.ngs_avg_time_to_throw ?? 0, 'average')}{' '}
            {playerData.ngs_avg_time_to_throw_rank !== undefined && formatRank(playerData.ngs_avg_time_to_throw_rank)}
          </p>
          <p>
            <strong>NGS Avg Intended Air Yards:</strong>{' '}
            {formatStat(playerData.ngs_avg_intended_air_yards ?? 0, 'average')}{' '}
            {playerData.ngs_avg_intended_air_yards_rank !== undefined && formatRank(playerData.ngs_avg_intended_air_yards_rank)}
          </p>
          <p>
            <strong>NGS Completion %:</strong>{' '}
            {formatStat(playerData.ngs_completion_percentage ?? 0, 'average')}{' '}
            {playerData.ngs_completion_percentage_rank !== undefined && formatRank(playerData.ngs_completion_percentage_rank)}
          </p>
          <p>
            <strong>NGS Passer Rating:</strong>{' '}
            {formatStat(playerData.ngs_passer_rating ?? 0, 'average')}{' '}
            {playerData.ngs_passer_rating_rank !== undefined && formatRank(playerData.ngs_passer_rating_rank)}
          </p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p>
            <strong>NGS Completion %:</strong>{' '}
            {formatStat(playerData.ngs_completion_percentage ?? 0, 'average')}{' '}
            {playerData.ngs_completion_percentage_rank !== undefined && formatRank(playerData.ngs_completion_percentage_rank)}
          </p>
          <p>
            <strong>NGS Expected Completion %:</strong>{' '}
            {formatStat(playerData.ngs_expected_completion_percentage ?? 0, 'average')}{' '}
            {playerData.ngs_expected_completion_percentage_rank !== undefined && formatRank(playerData.ngs_expected_completion_percentage_rank)}
          </p>
          <p>
            <strong>NGS Avg Air Yards Differential:</strong>{' '}
            {formatStat(playerData.ngs_avg_air_yards_differential ?? 0, 'average')}{' '}
            {playerData.ngs_avg_air_yards_differential_rank !== undefined && formatRank(playerData.ngs_avg_air_yards_differential_rank)}
          </p>
          <p>
            <strong>NGS Passer Rating:</strong>{' '}
            {formatStat(playerData.ngs_passer_rating ?? 0, 'average')}{' '}
            {playerData.ngs_passer_rating_rank !== undefined && formatRank(playerData.ngs_passer_rating_rank)}
          </p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p>
            <strong>NGS Avg Time to Throw:</strong>{' '}
            {formatStat(playerData.ngs_avg_time_to_throw ?? 0, 'average')}{' '}
            {playerData.ngs_avg_time_to_throw_rank !== undefined && formatRank(playerData.ngs_avg_time_to_throw_rank)}
          </p>
          <p>
            <strong>NGS Avg Intended Air Yards:</strong>{' '}
            {formatStat(playerData.ngs_avg_intended_air_yards ?? 0, 'average')}{' '}
            {playerData.ngs_avg_intended_air_yards_rank !== undefined && formatRank(playerData.ngs_avg_intended_air_yards_rank)}
          </p>
          <p>
            <strong>NGS Completion %:</strong>{' '}
            {formatStat(playerData.ngs_completion_percentage ?? 0, 'average')}{' '}
            {playerData.ngs_completion_percentage_rank !== undefined && formatRank(playerData.ngs_completion_percentage_rank)}
          </p>
          <p>
            <strong>NGS Passer Rating:</strong>{' '}
            {formatStat(playerData.ngs_passer_rating ?? 0, 'average')}{' '}
            {playerData.ngs_passer_rating_rank !== undefined && formatRank(playerData.ngs_passer_rating_rank)}
          </p>
        </>
      );
    case 'Shanahan Wide Zone':
      return (
        <>
          <p>
            <strong>NGS Completion %:</strong>{' '}
            {formatStat(playerData.ngs_completion_percentage ?? 0, 'average')}{' '}
            {playerData.ngs_completion_percentage_rank !== undefined && formatRank(playerData.ngs_completion_percentage_rank)}
          </p>
          <p>
            <strong>NGS Passer Rating:</strong>{' '}
            {formatStat(playerData.ngs_passer_rating ?? 0, 'average')}{' '}
            {playerData.ngs_passer_rating_rank !== undefined && formatRank(playerData.ngs_passer_rating_rank)}
          </p>
          <p>
            <strong>NGS Avg Time to Throw:</strong>{' '}
            {formatStat(playerData.ngs_avg_time_to_throw ?? 0, 'average')}{' '}
            {playerData.ngs_avg_time_to_throw_rank !== undefined && formatRank(playerData.ngs_avg_time_to_throw_rank)}
          </p>
          <p>
            <strong>NGS Completion % Above Expectation:</strong>{' '}
            {formatStat(playerData.ngs_completion_percentage_above_expectation ?? 0, 'average')}{' '}
            {playerData.ngs_completion_percentage_above_expectation_rank !== undefined && formatRank(playerData.ngs_completion_percentage_above_expectation_rank)}
          </p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p>
            <strong>NGS Avg Time to Throw:</strong>{' '}
            {formatStat(playerData.ngs_avg_time_to_throw ?? 0, 'average')}{' '}
            {playerData.ngs_avg_time_to_throw_rank !== undefined && formatRank(playerData.ngs_avg_time_to_throw_rank)}
          </p>
          <p>
            <strong>NGS Completion %:</strong>{' '}
            {formatStat(playerData.ngs_completion_percentage ?? 0, 'average')}{' '}
            {playerData.ngs_completion_percentage_rank !== undefined && formatRank(playerData.ngs_completion_percentage_rank)}
          </p>
          <p>
            <strong>NGS Passer Rating:</strong>{' '}
            {formatStat(playerData.ngs_passer_rating ?? 0, 'average')}{' '}
            {playerData.ngs_passer_rating_rank !== undefined && formatRank(playerData.ngs_passer_rating_rank)}
          </p>
          <p>
            <strong>NGS Expected Completion %:</strong>{' '}
            {formatStat(playerData.ngs_expected_completion_percentage ?? 0, 'average')}{' '}
            {playerData.ngs_expected_completion_percentage_rank !== undefined && formatRank(playerData.ngs_expected_completion_percentage_rank)}
          </p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p>
            <strong>NGS Avg Time to Throw:</strong>{' '}
            {formatStat(playerData.ngs_avg_time_to_throw ?? 0, 'average')}{' '}
            {playerData.ngs_avg_time_to_throw_rank !== undefined && formatRank(playerData.ngs_avg_time_to_throw_rank)}
          </p>
          <p>
            <strong>NGS Avg Intended Air Yards:</strong>{' '}
            {formatStat(playerData.ngs_avg_intended_air_yards ?? 0, 'average')}{' '}
            {playerData.ngs_avg_intended_air_yards_rank !== undefined && formatRank(playerData.ngs_avg_intended_air_yards_rank)}
          </p>
          <p>
            <strong>NGS Completion %:</strong>{' '}
            {formatStat(playerData.ngs_completion_percentage ?? 0, 'average')}{' '}
            {playerData.ngs_completion_percentage_rank !== undefined && formatRank(playerData.ngs_completion_percentage_rank)}
          </p>
          <p>
            <strong>NGS Passer Rating:</strong>{' '}
            {formatStat(playerData.ngs_passer_rating ?? 0, 'average')}{' '}
            {playerData.ngs_passer_rating_rank !== undefined && formatRank(playerData.ngs_passer_rating_rank)}
          </p>
        </>
      );
    default:
      return <p>No next gen stats available for the selected scheme.</p>;
  }
}

export function renderRushingStats(playerData: QBPlayerData): React.ReactElement {
  const rushingYards = Number(playerData.rushing_yards) || 0;
  const carries = Number(playerData.carries) || 0;
  const yardsPerCarry = carries !== 0 ? rushingYards / carries : 0;

  return (
    <>
      <p>
        <strong>Rushing Yards:</strong>{' '}
        {formatStat(playerData.rushing_yards ?? 0, 'total')}
        <span style={{ fontSize: "0.70em", color: "#666" }}>
          {` (${formatStat(yardsPerCarry, 'average')} yards per rush)`}
        </span>
      </p>
      <p>
        <strong>Carries:</strong>{' '}
        {formatStat(playerData.carries ?? 0, 'total')}{' '}
        {playerData.carries_rank !== undefined && formatRank(playerData.carries_rank)}
      </p>
      <p>
        <strong>Rushing TDs:</strong>{' '}
        {formatStat(playerData.rushing_tds ?? 0, 'total')}{' '}
        {playerData.rushing_tds_rank !== undefined && formatRank(playerData.rushing_tds_rank)}
      </p>
    </>
  );
}
