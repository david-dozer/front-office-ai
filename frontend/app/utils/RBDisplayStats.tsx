import React from 'react';

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

export function renderRBAdvancedStats(playerData: any, teamScheme: string): React.ReactElement {
  switch (teamScheme) {
    case 'Air Raid':
      return (
        <>
          <p><strong>Rushing EPA:</strong> {formatStat(playerData.rushing_epa, 'average')}</p>
          <p><strong>Receiving Air Yards:</strong> {formatStat(playerData.receiving_air_yards, 'total')}</p>
          <p><strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch, 'total')}</p>
          <p><strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs, 'total')}</p>
          <p><strong>RACR:</strong> {formatStat(playerData.racr, 'average')}</p>
        </>
      );
    case 'Spread Option':
      return (
        <>
          <p><strong>Rushing EPA:</strong> {formatStat(playerData.rushing_epa, 'average')}</p>
          <p><strong>Rushing First Downs:</strong> {formatStat(playerData.rushing_first_downs, 'total')}</p>
          <p><strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch, 'total')}</p>
          <p><strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs, 'total')}</p>
          <p><strong>RACR:</strong> {formatStat(playerData.racr, 'average')}</p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p><strong>Rushing EPA:</strong> {formatStat(playerData.rushing_epa, 'average')}</p>
          <p><strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch, 'total')}</p>
          <p><strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs, 'total')}</p>
          <p><strong>Receiving Air Yards:</strong> {formatStat(playerData.receiving_air_yards, 'total')}</p>
          <p><strong>RACR:</strong> {formatStat(playerData.racr, 'average')}</p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p><strong>Rushing EPA:</strong> {formatStat(playerData.rushing_epa, 'average')}</p>
          <p><strong>Rushing First Downs:</strong> {formatStat(playerData.rushing_first_downs, 'total')}</p>
          <p><strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs, 'total')}</p>
          <p><strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch, 'total')}</p>
          <p><strong>Receiving EPA:</strong> {formatStat(playerData.receiving_epa, 'average')}</p>
        </>
      );
    case 'Shanahan Wide Zone':
      return (
        <>
          <p><strong>Rushing EPA:</strong> {formatStat(playerData.rushing_epa, 'average')}</p>
          <p><strong>Rushing First Downs:</strong> {formatStat(playerData.rushing_first_downs, 'total')}</p>
          <p><strong>Rushing 2pt Conversions:</strong> {formatStat(playerData.rushing_2pt_conversions, 'total')}</p>
          <p><strong>Rushing Fumbles Lost:</strong> {formatStat(playerData.rushing_fumbles_lost, 'total')}</p>
          <p><strong>Receiving Air Yards:</strong> {formatStat(playerData.receiving_air_yards, 'total')}</p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p><strong>Rushing EPA:</strong> {formatStat(playerData.rushing_epa, 'average')}</p>
          <p><strong>Rushing First Downs:</strong> {formatStat(playerData.rushing_first_downs, 'total')}</p>
          <p><strong>Rushing 2pt Conversions:</strong> {formatStat(playerData.rushing_2pt_conversions, 'total')}</p>
          <p><strong>Rushing Fumbles Lost:</strong> {formatStat(playerData.rushing_fumbles_lost, 'total')}</p>
          <p><strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs, 'total')}</p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p><strong>Rushing EPA:</strong> {formatStat(playerData.rushing_epa, 'average')}</p>
          <p><strong>Rushing First Downs:</strong> {formatStat(playerData.rushing_first_downs, 'total')}</p>
          <p><strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch, 'total')}</p>
          <p><strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs, 'total')}</p>
          <p><strong>RACR:</strong> {formatStat(playerData.racr, 'average')}</p>
        </>
      );
    default:
      return <p>No advanced stats available for the selected scheme.</p>;
  }
}

export function renderRBNextGenStats(playerData: any, teamScheme: string): React.ReactElement {
  switch (teamScheme) {
    case 'Air Raid':
      return (
        <>
          <p><strong>NGS Efficiency:</strong> {formatStat(playerData.ngs_efficiency, 'average')}</p>
          <p><strong>NGS Avg Time to LOS:</strong> {formatStat(playerData.ngs_avg_time_to_los, 'average')}</p>
          <p><strong>NGS Avg Rush Yards:</strong> {formatStat(playerData.ngs_avg_rush_yards, 'average')}</p>
          <p><strong>NGS Expected Rush Yards:</strong> {formatStat(playerData.ngs_expected_rush_yards, 'average')}</p>
          <p><strong>NGS Rush Yards Over Expected:</strong> {formatStat(playerData.ngs_rush_yards_over_expected, 'average')}</p>
        </>
      );
    case 'Spread Option':
      return (
        <>
          <p><strong>NGS Efficiency:</strong> {formatStat(playerData.ngs_efficiency, 'average')}</p>
          <p><strong>NGS Avg Rush Yards:</strong> {formatStat(playerData.ngs_avg_rush_yards, 'average')}</p>
          <p><strong>NGS Expected Rush Yards:</strong> {formatStat(playerData.ngs_expected_rush_yards, 'average')}</p>
          <p><strong>NGS Rush Yards Over Expected:</strong> {formatStat(playerData.ngs_rush_yards_over_expected, 'average')}</p>
          <p><strong>NGS Rush Yards Over Expected per Att:</strong> {formatStat(playerData.ngs_rush_yards_over_expected_per_att, 'average')}</p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p><strong>NGS Efficiency:</strong> {formatStat(playerData.ngs_efficiency, 'average')}</p>
          <p><strong>NGS Avg Time to LOS:</strong> {formatStat(playerData.ngs_avg_time_to_los, 'average')}</p>
          <p><strong>NGS Avg Rush Yards:</strong> {formatStat(playerData.ngs_avg_rush_yards, 'average')}</p>
          <p><strong>NGS Expected Rush Yards:</strong> {formatStat(playerData.ngs_expected_rush_yards, 'average')}</p>
          <p><strong>NGS Rush Yards Over Expected:</strong> {formatStat(playerData.ngs_rush_yards_over_expected, 'average')}</p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p><strong>NGS Efficiency:</strong> {formatStat(playerData.ngs_efficiency, 'average')}</p>
          <p><strong>NGS Avg Rush Yards:</strong> {formatStat(playerData.ngs_avg_rush_yards, 'average')}</p>
          <p><strong>NGS Expected Rush Yards:</strong> {formatStat(playerData.ngs_expected_rush_yards, 'average')}</p>
          <p><strong>NGS Rush Yards Over Expected:</strong> {formatStat(playerData.ngs_rush_yards_over_expected, 'average')}</p>
          <p><strong>NGS Avg Time to LOS:</strong> {formatStat(playerData.ngs_avg_time_to_los, 'average')}</p>
        </>
      );
    case 'Shanahan Wide Zone':
      return (
        <>
          <p><strong>NGS Efficiency:</strong> {formatStat(playerData.ngs_efficiency, 'average')}</p>
          <p><strong>NGS Avg Rush Yards:</strong> {formatStat(playerData.ngs_avg_rush_yards, 'average')}</p>
          <p><strong>NGS Expected Rush Yards:</strong> {formatStat(playerData.ngs_expected_rush_yards, 'average')}</p>
          <p><strong>NGS Rush Yards Over Expected:</strong> {formatStat(playerData.ngs_rush_yards_over_expected, 'average')}</p>
          <p><strong>NGS Rush Yards Over Expected per Att:</strong> {formatStat(playerData.ngs_rush_yards_over_expected_per_att, 'average')}</p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p><strong>NGS Efficiency:</strong> {formatStat(playerData.ngs_efficiency, 'average')}</p>
          <p><strong>NGS Avg Rush Yards:</strong> {formatStat(playerData.ngs_avg_rush_yards, 'average')}</p>
          <p><strong>NGS Expected Rush Yards:</strong> {formatStat(playerData.ngs_expected_rush_yards, 'average')}</p>
          <p><strong>NGS Rush Yards Over Expected:</strong> {formatStat(playerData.ngs_rush_yards_over_expected, 'average')}</p>
          <p><strong>NGS Rush Yards Over Expected per Att:</strong> {formatStat(playerData.ngs_rush_yards_over_expected_per_att, 'average')}</p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p><strong>NGS Efficiency:</strong> {formatStat(playerData.ngs_efficiency, 'average')}</p>
          <p><strong>NGS Avg Rush Yards:</strong> {formatStat(playerData.ngs_avg_rush_yards, 'average')}</p>
          <p><strong>NGS Expected Rush Yards:</strong> {formatStat(playerData.ngs_expected_rush_yards, 'average')}</p>
          <p><strong>NGS Rush Yards Over Expected:</strong> {formatStat(playerData.ngs_rush_yards_over_expected, 'average')}</p>
          <p><strong>NGS Rush Yards Over Expected per Att:</strong> {formatStat(playerData.ngs_rush_yards_over_expected_per_att, 'average')}</p>
        </>
      );
    default:
      return <p>No next gen stats available for the selected scheme.</p>;
  }
}

export function renderRBStandardReceivingStats(playerData: any): React.ReactElement {
  return (
    <>
      <p><strong>Receptions:</strong> {formatStat(playerData.receptions, 'total')}</p>
      <p><strong>Targets:</strong> {formatStat(playerData.targets, 'total')}</p>
      <p><strong>Receiving Yards:</strong> {formatStat(playerData.receiving_yards, 'total')}</p>
      <p><strong>Receiving TDs:</strong> {formatStat(playerData.receiving_tds, 'total')}</p>
      <p><strong>Receiving Fumbles:</strong> {formatStat(playerData.receiving_fumbles, 'total')}</p>
      <p><strong>Receiving Fumbles Lost:</strong> {formatStat(playerData.receiving_fumbles_lost, 'total')}</p>
    </>
  );
}
