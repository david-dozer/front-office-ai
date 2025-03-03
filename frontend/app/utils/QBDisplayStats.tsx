import React from 'react';
// TODO: rankings out of 97 QBs
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

export function renderQBAdvancedStats(playerData: any, teamScheme: string): React.ReactElement {
  switch (teamScheme) {
    case 'Air Raid':
      return (
        <>
          <p><strong>Passing EPA:</strong> {formatStat(playerData.passing_epa, 'average')}</p>
          <p><strong>Passing Air Yards:</strong> {formatStat(playerData.passing_air_yards, 'total')}</p>
          <p><strong>Sacks:</strong> {formatStat(playerData.sacks, 'total')}</p>
          <p><strong>Sack Fumbles:</strong> {formatStat(playerData.sack_fumbles, 'total')}</p>
        </>
      );
    case 'Spread Option':
      return (
        <>
          <p><strong>Passing EPA:</strong> {formatStat(playerData.passing_epa, 'average')}</p>
          <p><strong>Passing Air Yards:</strong> {formatStat(playerData.passing_air_yards, 'total')}</p>
          <p><strong>Sacks:</strong> {formatStat(playerData.sacks, 'total')}</p>
          <p><strong>Sack Fumbles:</strong> {formatStat(playerData.sack_fumbles, 'total')}</p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p><strong>Passing EPA:</strong> {formatStat(playerData.passing_epa, 'average')}</p>
          <p><strong>Passing Yards After Catch:</strong> {formatStat(playerData.passing_yards_after_catch, 'total')}</p>
          <p><strong>Sacks:</strong> {formatStat(playerData.sacks, 'total')}</p>
          <p><strong>Sack Fumbles:</strong> {formatStat(playerData.sack_fumbles, 'total')}</p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p><strong>Passing EPA:</strong> {formatStat(playerData.passing_epa, 'average')}</p>
          <p><strong>Passing First Downs:</strong> {formatStat(playerData.passing_first_downs, 'total')}</p>
          <p><strong>Sacks:</strong> {formatStat(playerData.sacks, 'total')}</p>
          <p><strong>Sack Fumbles:</strong> {formatStat(playerData.sack_fumbles, 'total')}</p>
        </>
      );
    case 'Shanahan Wide Zone':
      return (
        <>
          <p><strong>Passing EPA:</strong> {formatStat(playerData.passing_epa, 'average')}</p>
          <p><strong>Sacks:</strong> {formatStat(playerData.sacks, 'total')}</p>
          <p><strong>Sack Yards:</strong> {formatStat(playerData.sack_yards, 'total')}</p>
          <p><strong>Sack Fumbles:</strong> {formatStat(playerData.sack_fumbles, 'total')}</p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p><strong>Passing EPA:</strong> {formatStat(playerData.passing_epa, 'average')}</p>
          <p><strong>Sacks:</strong> {formatStat(playerData.sacks, 'total')}</p>
          <p><strong>Sack Yards:</strong> {formatStat(playerData.sack_yards, 'total')}</p>
          <p><strong>Sack Fumbles:</strong> {formatStat(playerData.sack_fumbles, 'total')}</p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p><strong>Passing EPA:</strong> {formatStat(playerData.passing_epa, 'average')}</p>
          <p><strong>Passing Air Yards:</strong> {formatStat(playerData.passing_air_yards, 'total')}</p>
          <p><strong>Sacks:</strong> {formatStat(playerData.sacks, 'total')}</p>
          <p><strong>Sack Fumbles:</strong> {formatStat(playerData.sack_fumbles, 'total')}</p>
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
          <p><strong>NGS Avg Time to Throw:</strong> {formatStat(playerData.ngs_avg_time_to_throw, 'average')}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {formatStat(playerData.ngs_avg_intended_air_yards, 'average')}</p>
          <p><strong>NGS Completion %:</strong> {formatStat(playerData.ngs_completion_percentage, 'average')}</p>
          <p><strong>NGS Passer Rating:</strong> {formatStat(playerData.ngs_passer_rating, 'average')}</p>
        </>
      );
    case 'Spread Option':
      return (
        <>
          <p><strong>NGS Avg Time to Throw:</strong> {formatStat(playerData.ngs_avg_time_to_throw, 'average')}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {formatStat(playerData.ngs_avg_intended_air_yards, 'average')}</p>
          <p><strong>NGS Completion %:</strong> {formatStat(playerData.ngs_completion_percentage, 'average')}</p>
          <p><strong>NGS Passer Rating:</strong> {formatStat(playerData.ngs_passer_rating, 'average')}</p>
          <p><strong>Rushing Yards:</strong> {formatStat(playerData.rushing_yards, 'total')}</p>
          <p><strong>Carries:</strong> {formatStat(playerData.carries, 'total')}</p>
          <p><strong>Rushing TDs:</strong> {formatStat(playerData.rushing_tds, 'total')}</p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p><strong>NGS Completion %:</strong> {formatStat(playerData.ngs_completion_percentage, 'average')}</p>
          <p><strong>NGS Expected Completion %:</strong> {formatStat(playerData.ngs_expected_completion_percentage, 'average')}</p>
          <p><strong>NGS Avg Air Yards Differential:</strong> {formatStat(playerData.ngs_avg_air_yards_differential, 'average')}</p>
          <p><strong>NGS Passer Rating:</strong> {formatStat(playerData.ngs_passer_rating, 'average')}</p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p><strong>NGS Avg Time to Throw:</strong> {formatStat(playerData.ngs_avg_time_to_throw, 'average')}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {formatStat(playerData.ngs_avg_intended_air_yards, 'average')}</p>
          <p><strong>NGS Completion %:</strong> {formatStat(playerData.ngs_completion_percentage, 'average')}</p>
          <p><strong>NGS Passer Rating:</strong> {formatStat(playerData.ngs_passer_rating, 'average')}</p>
        </>
      );
    case 'Shanahan Wide Zone':
      return (
        <>
          <p><strong>NGS Completion %:</strong> {formatStat(playerData.ngs_completion_percentage, 'average')}</p>
          <p><strong>NGS Passer Rating:</strong> {formatStat(playerData.ngs_passer_rating, 'average')}</p>
          <p><strong>NGS Avg Time to Throw:</strong> {formatStat(playerData.ngs_avg_time_to_throw, 'average')}</p>
          <p><strong>NGS Completion % Above Expectation:</strong> {formatStat(playerData.ngs_completion_percentage_above_expectation, 'average')}</p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p><strong>NGS Avg Time to Throw:</strong> {formatStat(playerData.ngs_avg_time_to_throw, 'average')}</p>
          <p><strong>NGS Completion %:</strong> {formatStat(playerData.ngs_completion_percentage, 'average')}</p>
          <p><strong>NGS Passer Rating:</strong> {formatStat(playerData.ngs_passer_rating, 'average')}</p>
          <p><strong>NGS Expected Completion %:</strong> {formatStat(playerData.ngs_expected_completion_percentage, 'average')}</p>
          <p><strong>Rushing Yards:</strong> {formatStat(playerData.rushing_yards, 'total')}</p>
          <p><strong>Carries:</strong> {formatStat(playerData.carries, 'total')}</p>
          <p><strong>Rushing TDs:</strong> {formatStat(playerData.rushing_tds, 'total')}</p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p><strong>NGS Avg Time to Throw:</strong> {formatStat(playerData.ngs_avg_time_to_throw, 'average')}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {formatStat(playerData.ngs_avg_intended_air_yards, 'average')}</p>
          <p><strong>NGS Completion %:</strong> {formatStat(playerData.ngs_completion_percentage, 'average')}</p>
          <p><strong>NGS Passer Rating:</strong> {formatStat(playerData.ngs_passer_rating, 'average')}</p>
          <p><strong>Rushing Yards:</strong> {formatStat(playerData.rushing_yards, 'total')}</p>
          <p><strong>Carries:</strong> {formatStat(playerData.carries, 'total')}</p>
          <p><strong>Rushing TDs:</strong> {formatStat(playerData.rushing_tds, 'total')}</p>
        </>
      );
    default:
      return <p>No next gen stats available for the selected scheme.</p>;
  }
}
