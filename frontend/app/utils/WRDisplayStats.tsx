import React from 'react';
// TODO: rankings out of 295
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

export function renderWRAdvancedStats(playerData: any, teamScheme: string): React.ReactElement {
  switch (teamScheme) {
    case 'Air Raid':
      return (
        <>
          <p><strong>Receiving Air Yards:</strong> {formatStat(playerData.receiving_air_yards, 'total')}</p>
          <p><strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch, 'total')}</p>
          <p><strong>Receiving EPA:</strong> {formatStat(playerData.receiving_epa, 'average')}</p>
          <p><strong>Target Share:</strong> {formatStat(playerData.target_share, 'average')}</p>
        </>
      );
    case 'Spread Option':
      return (
        <>
          <p><strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs, 'total')}</p>
          <p><strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch, 'total')}</p>
          <p><strong>RACR:</strong> {formatStat(playerData.racr, 'average')}</p>
          <p><strong>Receiving EPA:</strong> {formatStat(playerData.receiving_epa, 'average')}</p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p><strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs, 'total')}</p>
          <p><strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch, 'total')}</p>
          <p><strong>Air Yards Share:</strong> {formatStat(playerData.air_yards_share, 'average')}</p>
          <p><strong>Receiving EPA:</strong> {formatStat(playerData.receiving_epa, 'average')}</p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p><strong>Receiving Air Yards:</strong> {formatStat(playerData.receiving_air_yards, 'total')}</p>
          <p><strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch, 'total')}</p>
          <p><strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs, 'total')}</p>
          <p><strong>Receiving EPA:</strong> {formatStat(playerData.receiving_epa, 'average')}</p>
        </>
      );
    case 'Shanahan Wide Zone':
      return (
        <>
          <p><strong>Receiving EPA:</strong> {formatStat(playerData.receiving_epa, 'average')}</p>
          <p><strong>Receiving Fumbles:</strong> {formatStat(playerData.receiving_fumbles, 'total')}</p>
          <p><strong>Receiving Fumbles Lost:</strong> {formatStat(playerData.receiving_fumbles_lost, 'total')}</p>
          <p><strong>RACR:</strong> {formatStat(playerData.racr, 'average')}</p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p><strong>Receiving EPA:</strong> {formatStat(playerData.receiving_epa, 'average')}</p>
          <p><strong>Receiving Fumbles:</strong> {formatStat(playerData.receiving_fumbles, 'total')}</p>
          <p><strong>Receiving Fumbles Lost:</strong> {formatStat(playerData.receiving_fumbles_lost, 'total')}</p>
          <p><strong>Target Share:</strong> {formatStat(playerData.target_share, 'average')}</p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p><strong>Receiving Air Yards:</strong> {formatStat(playerData.receiving_air_yards, 'total')}</p>
          <p><strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch, 'total')}</p>
          <p><strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs, 'total')}</p>
          <p><strong>RACR:</strong> {formatStat(playerData.racr, 'average')}</p>
        </>
      );
    default:
      return <p>No advanced stats available for the selected scheme.</p>;
  }
}

export function renderWRNextGenStats(playerData: any, teamScheme: string): React.ReactElement {
  switch (teamScheme) {
    case 'Air Raid':
      return (
        <>
          <p><strong>NGS Avg Separation:</strong> {formatStat(playerData.ngs_avg_separation, 'average')}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {formatStat(playerData.ngs_avg_intended_air_yards, 'average')}</p>
          <p><strong>NGS Catch Percentage:</strong> {formatStat(playerData.ngs_catch_percentage, 'average')}%</p>
          <p><strong>NGS Avg Expected YAC:</strong> {formatStat(playerData.ngs_avg_expected_yac, 'average')}</p>
        </>
      );
    case 'Spread Option':
      return (
        <>
          <p><strong>NGS Avg Separation:</strong> {formatStat(playerData.ngs_avg_separation, 'average')}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {formatStat(playerData.ngs_avg_intended_air_yards, 'average')}</p>
          <p><strong>NGS Catch Percentage:</strong> {formatStat(playerData.ngs_catch_percentage, 'average')}%</p>
          <p><strong>NGS % Share of Intended Air Yards:</strong> {formatStat(playerData.ngs_percent_share_of_intended_air_yards, 'average')}</p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p><strong>NGS Avg Separation:</strong> {formatStat(playerData.ngs_avg_separation, 'average')}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {formatStat(playerData.ngs_avg_intended_air_yards, 'average')}</p>
          <p><strong>NGS % Share of Intended Air Yards:</strong> {formatStat(playerData.ngs_percent_share_of_intended_air_yards, 'average')}</p>
          <p><strong>NGS Catch Percentage:</strong> {formatStat(playerData.ngs_catch_percentage, 'average')}%</p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p><strong>NGS Avg Separation:</strong> {formatStat(playerData.ngs_avg_separation, 'average')}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {formatStat(playerData.ngs_avg_intended_air_yards, 'average')}</p>
          <p><strong>NGS Avg YAC Above Expectation:</strong> {formatStat(playerData.ngs_avg_yac_above_expectation, 'average')}</p>
          <p><strong>NGS Catch Percentage:</strong> {formatStat(playerData.ngs_catch_percentage, 'average')}%</p>
        </>
      );
    case 'Shanahan Wide Zone':
      return (
        <>
          <p><strong>NGS Avg Separation:</strong> {formatStat(playerData.ngs_avg_separation, 'average')}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {formatStat(playerData.ngs_avg_intended_air_yards, 'average')}</p>
          <p><strong>NGS Catch Percentage:</strong> {formatStat(playerData.ngs_catch_percentage, 'average')}%</p>
          <p><strong>NGS Avg YAC:</strong> {formatStat(playerData.ngs_avg_yac, 'average')}</p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p><strong>NGS Avg Separation:</strong> {formatStat(playerData.ngs_avg_separation, 'average')}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {formatStat(playerData.ngs_avg_intended_air_yards, 'average')}</p>
          <p><strong>NGS Catch Percentage:</strong> {formatStat(playerData.ngs_catch_percentage, 'average')}%</p>
          <p><strong>NGS Avg YAC:</strong> {formatStat(playerData.ngs_avg_yac, 'average')}</p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p><strong>NGS Avg Separation:</strong> {formatStat(playerData.ngs_avg_separation, 'average')}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {formatStat(playerData.ngs_avg_intended_air_yards, 'average')}</p>
          <p><strong>NGS Avg YAC Above Expectation:</strong> {formatStat(playerData.ngs_avg_yac_above_expectation, 'average')}</p>
          <p><strong>NGS % Share of Intended Air Yards:</strong> {formatStat(playerData.ngs_percent_share_of_intended_air_yards, 'average')}</p>
        </>
      );
    default:
      return <p>No next gen stats available for the selected scheme.</p>;
  }
}
