import React from 'react';

export function renderWRAdvancedStats(playerData: any, teamScheme: string): React.ReactElement {
  switch (teamScheme) {
    case 'Air Raid':
      return (
        <>
          <p><strong>Receiving Air Yards:</strong> {playerData.receiving_air_yards}</p>
          <p><strong>Receiving Yards After Catch:</strong> {playerData.receiving_yards_after_catch}</p>
          <p><strong>Receiving EPA:</strong> {playerData.receiving_epa}</p>
          <p><strong>Target Share:</strong> {playerData.target_share}</p>
        </>
      );
    case 'Spread Option':
      return (
        <>
          <p><strong>Receiving First Downs:</strong> {playerData.receiving_first_downs}</p>
          <p><strong>Receiving Yards After Catch:</strong> {playerData.receiving_yards_after_catch}</p>
          <p><strong>RACR:</strong> {playerData.racr}</p>
          <p><strong>Receiving EPA:</strong> {playerData.receiving_epa}</p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p><strong>Receiving First Downs:</strong> {playerData.receiving_first_downs}</p>
          <p><strong>Receiving Yards After Catch:</strong> {playerData.receiving_yards_after_catch}</p>
          <p><strong>Air Yards Share:</strong> {playerData.air_yards_share}</p>
          <p><strong>Receiving EPA:</strong> {playerData.receiving_epa}</p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p><strong>Receiving Air Yards:</strong> {playerData.receiving_air_yards}</p>
          <p><strong>Receiving Yards After Catch:</strong> {playerData.receiving_yards_after_catch}</p>
          <p><strong>Receiving First Downs:</strong> {playerData.receiving_first_downs}</p>
          <p><strong>Receiving 2pt Conversions:</strong> {playerData.receiving_2pt_conversions}</p>
        </>
      );
    case 'Shanahan Wide Zone':
      return (
        <>
          <p><strong>Receiving EPA:</strong> {playerData.receiving_epa}</p>
          <p><strong>Receiving Fumbles:</strong> {playerData.receiving_fumbles}</p>
          <p><strong>Receiving Fumbles Lost:</strong> {playerData.receiving_fumbles_lost}</p>
          <p><strong>RACR:</strong> {playerData.racr}</p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p><strong>Receiving EPA:</strong> {playerData.receiving_epa}</p>
          <p><strong>Receiving Fumbles:</strong> {playerData.receiving_fumbles}</p>
          <p><strong>Receiving Fumbles Lost:</strong> {playerData.receiving_fumbles_lost}</p>
          <p><strong>Target Share:</strong> {playerData.target_share}</p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p><strong>Receiving Air Yards:</strong> {playerData.receiving_air_yards}</p>
          <p><strong>Receiving Yards After Catch:</strong> {playerData.receiving_yards_after_catch}</p>
          <p><strong>Receiving First Downs:</strong> {playerData.receiving_first_downs}</p>
          <p><strong>RACR:</strong> {playerData.racr}</p>
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
          <p><strong>NGS Avg Separation:</strong> {playerData.ngs_avg_separation}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {playerData.ngs_avg_intended_air_yards}</p>
          <p><strong>NGS Catch Percentage:</strong> {playerData.ngs_catch_percentage}</p>
          <p><strong>NGS Avg Expected YAC:</strong> {playerData.ngs_avg_expected_yac}</p>
        </>
      );
    case 'Spread Option':
      return (
        <>
          <p><strong>NGS Avg Separation:</strong> {playerData.ngs_avg_separation}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {playerData.ngs_avg_intended_air_yards}</p>
          <p><strong>NGS Catch Percentage:</strong> {playerData.ngs_catch_percentage}</p>
          <p><strong>NGS % Share of Intended Air Yards:</strong> {playerData.ngs_percent_share_of_intended_air_yards}</p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p><strong>NGS Avg Separation:</strong> {playerData.ngs_avg_separation}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {playerData.ngs_avg_intended_air_yards}</p>
          <p><strong>NGS % Share of Intended Air Yards:</strong> {playerData.ngs_percent_share_of_intended_air_yards}</p>
          <p><strong>NGS Catch Percentage:</strong> {playerData.ngs_catch_percentage}</p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p><strong>NGS Avg Separation:</strong> {playerData.ngs_avg_separation}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {playerData.ngs_avg_intended_air_yards}</p>
          <p><strong>NGS Avg YAC Above Expectation:</strong> {playerData.ngs_avg_yac_above_expectation}</p>
          <p><strong>NGS Catch Percentage:</strong> {playerData.ngs_catch_percentage}</p>
        </>
      );
    case 'Shanahan Wide Zone':
      return (
        <>
          <p><strong>NGS Avg Separation:</strong> {playerData.ngs_avg_separation}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {playerData.ngs_avg_intended_air_yards}</p>
          <p><strong>NGS Catch Percentage:</strong> {playerData.ngs_catch_percentage}</p>
          <p><strong>NGS Avg YAC:</strong> {playerData.ngs_avg_yac}</p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p><strong>NGS Avg Separation:</strong> {playerData.ngs_avg_separation}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {playerData.ngs_avg_intended_air_yards}</p>
          <p><strong>NGS Catch Percentage:</strong> {playerData.ngs_catch_percentage}</p>
          <p><strong>NGS Avg YAC:</strong> {playerData.ngs_avg_yac}</p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p><strong>NGS Avg Separation:</strong> {playerData.ngs_avg_separation}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {playerData.ngs_avg_intended_air_yards}</p>
          <p><strong>NGS Avg YAC Above Expectation:</strong> {playerData.ngs_avg_yac_above_expectation}</p>
          <p><strong>NGS % Share of Intended Air Yards:</strong> {playerData.ngs_percent_share_of_intended_air_yards}</p>
        </>
      );
    default:
      return <p>No next gen stats available for the selected scheme.</p>;
  }
}
