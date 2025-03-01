import React from 'react';

export function renderRBAdvancedStats(playerData: any, teamScheme: string): React.ReactElement {
  switch (teamScheme) {
    case 'Air Raid':
      return (
        <>
          <p><strong>Rushing EPA:</strong> {playerData.rushing_epa}</p>
          <p><strong>Receiving Air Yards:</strong> {playerData.receiving_air_yards}</p>
          <p><strong>Receiving Yards After Catch:</strong> {playerData.receiving_yards_after_catch}</p>
          <p><strong>Receiving First Downs:</strong> {playerData.receiving_first_downs}</p>
          <p><strong>RACR:</strong> {playerData.racr}</p>
        </>
      );
    case 'Spread Option':
      return (
        <>
          <p><strong>Rushing EPA:</strong> {playerData.rushing_epa}</p>
          <p><strong>Rushing First Downs:</strong> {playerData.rushing_first_downs}</p>
          <p><strong>Receiving Yards After Catch:</strong> {playerData.receiving_yards_after_catch}</p>
          <p><strong>Receiving First Downs:</strong> {playerData.receiving_first_downs}</p>
          <p><strong>RACR:</strong> {playerData.racr}</p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p><strong>Rushing EPA:</strong> {playerData.rushing_epa}</p>
          <p><strong>Receiving Yards After Catch:</strong> {playerData.receiving_yards_after_catch}</p>
          <p><strong>Receiving First Downs:</strong> {playerData.receiving_first_downs}</p>
          <p><strong>Receiving Air Yards:</strong> {playerData.receiving_air_yards}</p>
          <p><strong>RACR:</strong> {playerData.racr}</p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p><strong>Rushing EPA:</strong> {playerData.rushing_epa}</p>
          <p><strong>Rushing First Downs:</strong> {playerData.rushing_first_downs}</p>
          <p><strong>Receiving First Downs:</strong> {playerData.receiving_first_downs}</p>
          <p><strong>Receiving Yards After Catch:</strong> {playerData.receiving_yards_after_catch}</p>
          <p><strong>Receiving EPA:</strong> {playerData.receiving_epa}</p>
        </>
      );
    case 'Shanahan Wide Zone':
      return (
        <>
          <p><strong>Rushing EPA:</strong> {playerData.rushing_epa}</p>
          <p><strong>Rushing First Downs:</strong> {playerData.rushing_first_downs}</p>
          <p><strong>Rushing 2pt Conversions:</strong> {playerData.rushing_2pt_conversions}</p>
          <p><strong>Rushing Fumbles Lost:</strong> {playerData.rushing_fumbles_lost}</p>
          <p><strong>Receiving Air Yards:</strong> {playerData.receiving_air_yards}</p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p><strong>Rushing EPA:</strong> {playerData.rushing_epa}</p>
          <p><strong>Rushing First Downs:</strong> {playerData.rushing_first_downs}</p>
          <p><strong>Rushing 2pt Conversions:</strong> {playerData.rushing_2pt_conversions}</p>
          <p><strong>Rushing Fumbles Lost:</strong> {playerData.rushing_fumbles_lost}</p>
          <p><strong>Receiving First Downs:</strong> {playerData.receiving_first_downs}</p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p><strong>Rushing EPA:</strong> {playerData.rushing_epa}</p>
          <p><strong>Rushing First Downs:</strong> {playerData.rushing_first_downs}</p>
          <p><strong>Receiving Yards After Catch:</strong> {playerData.receiving_yards_after_catch}</p>
          <p><strong>Receiving First Downs:</strong> {playerData.receiving_first_downs}</p>
          <p><strong>RACR:</strong> {playerData.racr}</p>
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
          <p><strong>NGS Efficiency:</strong> {playerData.ngs_efficiency}</p>
          <p><strong>NGS Avg Time to LOS:</strong> {playerData.ngs_avg_time_to_los}</p>
          <p><strong>NGS Avg Rush Yards:</strong> {playerData.ngs_avg_rush_yards}</p>
          <p><strong>NGS Expected Rush Yards:</strong> {playerData.ngs_expected_rush_yards}</p>
          <p><strong>NGS Rush Yards Over Expected:</strong> {playerData.ngs_rush_yards_over_expected}</p>
        </>
      );
    case 'Spread Option':
      return (
        <>
          <p><strong>NGS Efficiency:</strong> {playerData.ngs_efficiency}</p>
          <p><strong>NGS Avg Rush Yards:</strong> {playerData.ngs_avg_rush_yards}</p>
          <p><strong>NGS Expected Rush Yards:</strong> {playerData.ngs_expected_rush_yards}</p>
          <p><strong>NGS Rush Yards Over Expected:</strong> {playerData.ngs_rush_yards_over_expected}</p>
          <p><strong>NGS Rush Yards Over Expected per Att:</strong> {playerData.ngs_rush_yards_over_expected_per_att}</p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p><strong>NGS Efficiency:</strong> {playerData.ngs_efficiency}</p>
          <p><strong>NGS Avg Time to LOS:</strong> {playerData.ngs_avg_time_to_los}</p>
          <p><strong>NGS Avg Rush Yards:</strong> {playerData.ngs_avg_rush_yards}</p>
          <p><strong>NGS Expected Rush Yards:</strong> {playerData.ngs_expected_rush_yards}</p>
          <p><strong>NGS Rush Yards Over Expected:</strong> {playerData.ngs_rush_yards_over_expected}</p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p><strong>NGS Efficiency:</strong> {playerData.ngs_efficiency}</p>
          <p><strong>NGS Avg Rush Yards:</strong> {playerData.ngs_avg_rush_yards}</p>
          <p><strong>NGS Expected Rush Yards:</strong> {playerData.ngs_expected_rush_yards}</p>
          <p><strong>NGS Rush Yards Over Expected:</strong> {playerData.ngs_rush_yards_over_expected}</p>
          <p><strong>NGS Avg Time to LOS:</strong> {playerData.ngs_avg_time_to_los}</p>
        </>
      );
    case 'Shanahan Wide Zone':
      return (
        <>
          <p><strong>NGS Efficiency:</strong> {playerData.ngs_efficiency}</p>
          <p><strong>NGS Avg Rush Yards:</strong> {playerData.ngs_avg_rush_yards}</p>
          <p><strong>NGS Expected Rush Yards:</strong> {playerData.ngs_expected_rush_yards}</p>
          <p><strong>NGS Rush Yards Over Expected:</strong> {playerData.ngs_rush_yards_over_expected}</p>
          <p><strong>NGS Rush Yards Over Expected per Att:</strong> {playerData.ngs_rush_yards_over_expected_per_att}</p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p><strong>NGS Efficiency:</strong> {playerData.ngs_efficiency}</p>
          <p><strong>NGS Avg Rush Yards:</strong> {playerData.ngs_avg_rush_yards}</p>
          <p><strong>NGS Expected Rush Yards:</strong> {playerData.ngs_expected_rush_yards}</p>
          <p><strong>NGS Rush Yards Over Expected:</strong> {playerData.ngs_rush_yards_over_expected}</p>
          <p><strong>NGS Rush Yards Over Expected per Att:</strong> {playerData.ngs_rush_yards_over_expected_per_att}</p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p><strong>NGS Efficiency:</strong> {playerData.ngs_efficiency}</p>
          <p><strong>NGS Avg Rush Yards:</strong> {playerData.ngs_avg_rush_yards}</p>
          <p><strong>NGS Expected Rush Yards:</strong> {playerData.ngs_expected_rush_yards}</p>
          <p><strong>NGS Rush Yards Over Expected:</strong> {playerData.ngs_rush_yards_over_expected}</p>
          <p><strong>NGS Rush Yards Over Expected per Att:</strong> {playerData.ngs_rush_yards_over_expected_per_att}</p>
        </>
      );
    default:
      return <p>No next gen stats available for the selected scheme.</p>;
  }
}

export function renderRBStandardReceivingStats(playerData: any): React.ReactElement {
  return (
    <>
      <p><strong>Receptions:</strong> {playerData.receptions}</p>
      <p><strong>Targets:</strong> {playerData.targets}</p>
      <p><strong>Receiving Yards:</strong> {playerData.receiving_yards}</p>
      <p><strong>Receiving TDs:</strong> {playerData.receiving_tds}</p>
      <p><strong>Receiving Fumbles:</strong> {playerData.receiving_fumbles}</p>
      <p><strong>Receiving Fumbles Lost:</strong> {playerData.receiving_fumbles_lost}</p>
    </>
  );
}
