import React from 'react';
import { ordinalSuffixOf } from './OLDisplayStats';

// TODO: rankings out of 97 (adjust total count as needed)
function formatStat(value: string | number, type: 'total' | 'average'): string {
  // Convert string values to a number.
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) {
    return value.toString();
  }
  if (type === 'total') {
    // For total stats: if the value is an integer, show it without decimals.
    return Number.isInteger(num) ? num.toString() : num.toFixed(0);
  } else if (type === 'average') {
    // For averages, percentages, and EPA: round to two decimals.
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

export function renderQBAdvancedStats(playerData: any, teamScheme: string): React.ReactElement {
  switch (teamScheme) {
    case 'Air Raid':
      return (
        <>
          <p>
            <strong>Passing EPA:</strong> {formatStat(playerData.passing_epa, 'average')} {formatRank(playerData.passing_epa_rank)}
          </p>
          <p>
            <strong>Completed Air Yards:</strong> {formatStat(playerData.passing_yards - playerData.passing_yards_after_catch, 'total')} {formatRank(playerData.pass_yards_minus_yac_rank)}
          </p>
          <p>
            <strong>Sacks:</strong> {formatStat(playerData.sacks, 'total')} {formatRank(playerData.sacks_rank)}
          </p>
          <p>
            <strong>Sack Fumbles:</strong> {formatStat(playerData.sack_fumbles, 'total')} {formatRank(playerData.sack_fumbles_rank)}
          </p>
        </>
      );
    case 'Spread Option':
      return (
        <>
          <p>
            <strong>Passing EPA:</strong> {formatStat(playerData.passing_epa, 'average')} {formatRank(playerData.passing_epa_rank)}
          </p>
          <p>
            <strong>Completed Air Yards:</strong> {formatStat(playerData.passing_yards - playerData.passing_yards_after_catch, 'total')} {formatRank(playerData.pass_yards_minus_yac_rank)}
          </p>
          <p>
            <strong>Sacks:</strong> {formatStat(playerData.sacks, 'total')} {formatRank(playerData.sacks_rank)}
          </p>
          <p>
            <strong>Sack Fumbles:</strong> {formatStat(playerData.sack_fumbles, 'total')} {formatRank(playerData.sack_fumbles_rank)}
          </p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p>
            <strong>Passing EPA:</strong> {formatStat(playerData.passing_epa, 'average')} {formatRank(playerData.passing_epa_rank)}
          </p>
          <p>
            <strong>Passing Yards After Catch:</strong> {formatStat(playerData.passing_yards_after_catch, 'total')} {formatRank(playerData.passing_yards_after_catch_rank)}
          </p>
          <p>
            <strong>Sacks:</strong> {formatStat(playerData.sacks, 'total')} {formatRank(playerData.sacks_rank)}
          </p>
          <p>
            <strong>Sack Fumbles:</strong> {formatStat(playerData.sack_fumbles, 'total')} {formatRank(playerData.sack_fumbles_rank)}
          </p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p>
            <strong>Passing EPA:</strong> {formatStat(playerData.passing_epa, 'average')} {formatRank(playerData.passing_epa_rank)}
          </p>
          <p>
            <strong>Passing First Downs:</strong> {formatStat(playerData.passing_first_downs, 'total')} {formatRank(playerData.passing_first_downs_rank)}
          </p>
          <p>
            <strong>Passing Yards After Catch:</strong> {formatStat(playerData.passing_yards_after_catch, 'total')} {formatRank(playerData.passing_yards_after_catch_rank)}
          </p>
          <p>
            <strong>Sacks:</strong> {formatStat(playerData.sacks, 'total')} {formatRank(playerData.sacks_rank)}
          </p>
          <p>
            <strong>Sack Fumbles:</strong> {formatStat(playerData.sack_fumbles, 'total')} {formatRank(playerData.sack_fumbles_rank)}
          </p>
        </>
      );
    case 'Shanahan Wide Zone':
      return (
        <>
          <p>
            <strong>Passing EPA:</strong> {formatStat(playerData.passing_epa, 'average')} {formatRank(playerData.passing_epa_rank)}
          </p>
          <p>
            <strong>Completed Air Yards:</strong> {formatStat(playerData.passing_yards - playerData.passing_yards_after_catch, 'total')} {formatRank(playerData.pass_yards_minus_yac_rank)}
          </p>
          <p>
            <strong>Sacks:</strong> {formatStat(playerData.sacks, 'total')} {formatRank(playerData.sacks_rank)}
          </p>
          <p>
            <strong>Sack Fumbles:</strong> {formatStat(playerData.sack_fumbles, 'total')} {formatRank(playerData.sack_fumbles_rank)}
          </p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p>
            <strong>Passing EPA:</strong> {formatStat(playerData.passing_epa, 'average')} {formatRank(playerData.passing_epa_rank)}
          </p>
          <p>
            <strong>Sacks:</strong> {formatStat(playerData.sacks, 'total')} {formatRank(playerData.sacks_rank)}
          </p>
          <p>
            <strong>Sack Fumbles:</strong> {formatStat(playerData.sack_fumbles, 'total')} {formatRank(playerData.sack_fumbles_rank)}
          </p>
          <p>
            <strong>Passing First Downs:</strong> {formatStat(playerData.passing_first_downs, 'total')} {formatRank(playerData.passing_first_downs_rank)}
          </p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p>
            <strong>Passing EPA:</strong> {formatStat(playerData.passing_epa, 'average')} {formatRank(playerData.passing_epa_rank)}
          </p>
          <p>
            <strong>Completed Air Yards:</strong> {formatStat(playerData.passing_yards - playerData.passing_yards_after_catch, 'total')} {formatRank(playerData.pass_yards_minus_yac_rank)}
          </p>
          <p>
            <strong>Sacks:</strong> {formatStat(playerData.sacks, 'total')} {formatRank(playerData.sacks_rank)}
          </p>
          <p>
            <strong>Sack Fumbles:</strong> {formatStat(playerData.sack_fumbles, 'total')} {formatRank(playerData.sack_fumbles_rank)}
          </p>
        </>
      );
    default:
      return <p>No advanced stats available for the selected scheme.</p>;
  }
}

export function renderQBNextGenStats(playerData: any, teamScheme: string): React.ReactElement {
  switch (teamScheme) {
    case 'Air Raid':
      return (
        <>
          <p>
            <strong>NGS Avg Time to Throw:</strong> {formatStat(playerData.ngs_avg_time_to_throw, 'average')} {formatRank(playerData.ngs_avg_time_to_throw_rank)}
          </p>
          <p>
            <strong>NGS Avg Intended Air Yards:</strong> {formatStat(playerData.ngs_avg_intended_air_yards, 'average')} {formatRank(playerData.ngs_avg_intended_air_yards_rank)}
          </p>
          <p>
            <strong>NGS Completion %:</strong> {formatStat(playerData.ngs_completion_percentage, 'average')} {formatRank(playerData.ngs_completion_percentage_rank)}
          </p>
          <p>
            <strong>NGS Passer Rating:</strong> {formatStat(playerData.ngs_passer_rating, 'average')} {formatRank(playerData.ngs_passer_rating_rank)}
          </p>
        </>
      );
    case 'Spread Option':
      return (
        <>
          <p>
            <strong>NGS Avg Time to Throw:</strong> {formatStat(playerData.ngs_avg_time_to_throw, 'average')} {formatRank(playerData.ngs_avg_time_to_throw_rank)}
          </p>
          <p>
            <strong>NGS Avg Intended Air Yards:</strong> {formatStat(playerData.ngs_avg_intended_air_yards, 'average')} {formatRank(playerData.ngs_avg_intended_air_yards_rank)}
          </p>
          <p>
            <strong>NGS Completion %:</strong> {formatStat(playerData.ngs_completion_percentage, 'average')} {formatRank(playerData.ngs_completion_percentage_rank)}
          </p>
          <p>
            <strong>NGS Passer Rating:</strong> {formatStat(playerData.ngs_passer_rating, 'average')} {formatRank(playerData.ngs_passer_rating_rank)}
          </p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p>
            <strong>NGS Completion %:</strong> {formatStat(playerData.ngs_completion_percentage, 'average')} {formatRank(playerData.ngs_completion_percentage_rank)}
          </p>
          <p>
            <strong>NGS Expected Completion %:</strong> {formatStat(playerData.ngs_expected_completion_percentage, 'average')} {formatRank(playerData.ngs_expected_completion_percentage_rank)}
          </p>
          <p>
            <strong>NGS Avg Air Yards Differential:</strong> {formatStat(playerData.ngs_avg_air_yards_differential, 'average')} {formatRank(playerData.ngs_avg_air_yards_differential_rank)}
          </p>
          <p>
            <strong>NGS Passer Rating:</strong> {formatStat(playerData.ngs_passer_rating, 'average')} {formatRank(playerData.ngs_passer_rating_rank)}
          </p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p>
            <strong>NGS Avg Time to Throw:</strong> {formatStat(playerData.ngs_avg_time_to_throw, 'average')} {formatRank(playerData.ngs_avg_time_to_throw_rank)}
          </p>
          <p>
            <strong>NGS Avg Intended Air Yards:</strong> {formatStat(playerData.ngs_avg_intended_air_yards, 'average')} {formatRank(playerData.ngs_avg_intended_air_yards_rank)}
          </p>
          <p>
            <strong>NGS Completion %:</strong> {formatStat(playerData.ngs_completion_percentage, 'average')} {formatRank(playerData.ngs_completion_percentage_rank)}
          </p>
          <p>
            <strong>NGS Passer Rating:</strong> {formatStat(playerData.ngs_passer_rating, 'average')} {formatRank(playerData.ngs_passer_rating_rank)}
          </p>
        </>
      );
    case 'Shanahan Wide Zone':
      return (
        <>
          <p>
            <strong>NGS Completion %:</strong> {formatStat(playerData.ngs_completion_percentage, 'average')} {formatRank(playerData.ngs_completion_percentage_rank)}
          </p>
          <p>
            <strong>NGS Passer Rating:</strong> {formatStat(playerData.ngs_passer_rating, 'average')} {formatRank(playerData.ngs_passer_rating_rank)}
          </p>
          <p>
            <strong>NGS Avg Time to Throw:</strong> {formatStat(playerData.ngs_avg_time_to_throw, 'average')} {formatRank(playerData.ngs_avg_time_to_throw_rank)}
          </p>
          <p>
            <strong>NGS Completion % Above Expectation:</strong> {formatStat(playerData.ngs_completion_percentage_above_expectation, 'average')} {formatRank(playerData.ngs_completion_percentage_above_expectation_rank)}
          </p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p>
            <strong>NGS Avg Time to Throw:</strong> {formatStat(playerData.ngs_avg_time_to_throw, 'average')} {formatRank(playerData.ngs_avg_time_to_throw_rank)}
          </p>
          <p>
            <strong>NGS Completion %:</strong> {formatStat(playerData.ngs_completion_percentage, 'average')} {formatRank(playerData.ngs_completion_percentage_rank)}
          </p>
          <p>
            <strong>NGS Passer Rating:</strong> {formatStat(playerData.ngs_passer_rating, 'average')} {formatRank(playerData.ngs_passer_rating_rank)}
          </p>
          <p>
            <strong>NGS Expected Completion %:</strong> {formatStat(playerData.ngs_expected_completion_percentage, 'average')} {formatRank(playerData.ngs_expected_completion_percentage_rank)}
          </p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p>
            <strong>NGS Avg Time to Throw:</strong> {formatStat(playerData.ngs_avg_time_to_throw, 'average')} {formatRank(playerData.ngs_avg_time_to_throw_rank)}
          </p>
          <p>
            <strong>NGS Avg Intended Air Yards:</strong> {formatStat(playerData.ngs_avg_intended_air_yards, 'average')} {formatRank(playerData.ngs_avg_intended_air_yards_rank)}
          </p>
          <p>
            <strong>NGS Completion %:</strong> {formatStat(playerData.ngs_completion_percentage, 'average')} {formatRank(playerData.ngs_completion_percentage_rank)}
          </p>
          <p>
            <strong>NGS Passer Rating:</strong> {formatStat(playerData.ngs_passer_rating, 'average')} {formatRank(playerData.ngs_passer_rating_rank)}
          </p>
        </>
      );
    default:
      return <p>No next gen stats available for the selected scheme.</p>;
  }
}

export function renderRushingStats(playerData: any): React.ReactElement {
  // Convert values to numbers (defaulting to 0 if missing) to avoid division errors.
  const rushingYards = Number(playerData.rushing_yards) || 0;
  const carries = Number(playerData.carries) || 0;
  // Calculate yards per carry; if carries is 0, display as 0.
  const yardsPerCarry = carries !== 0 ? rushingYards / carries : 0;

  return (
    <>
      <p>
        <strong>Rushing Yards:</strong> {formatStat(playerData.rushing_yards, 'total')} 
        <span style={{ fontSize: "0.70em", color: "#666" }}>
          {` (${formatStat(yardsPerCarry, 'average')} yards per rush)`}
        </span>
      </p>
      <p>
        <strong>Carries:</strong> {formatStat(playerData.carries, 'total')} {formatRank(playerData.carries_rank)}
      </p>
      <p>
        <strong>Rushing TDs:</strong> {formatStat(playerData.rushing_tds, 'total')} {formatRank(playerData.rushing_tds_rank)}
      </p>
    </>
  );
}
