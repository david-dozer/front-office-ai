import React from 'react';

export function renderQBAdvancedStats(playerData: any, teamScheme: string): React.ReactElement {
  switch (teamScheme) {
    case 'Air Raid':
      return (
        <>
          <p><strong>Passing EPA:</strong> {playerData.passing_epa}</p>
          <p><strong>Passing Air Yards:</strong> {playerData.passing_air_yards}</p>
          <p><strong>Sacks:</strong> {playerData.sacks}</p>
          <p><strong>Sack Fumbles:</strong> {playerData.sack_fumbles}</p>
        </>
      );
    case 'Spread Option':
      return (
        <>
          <p><strong>Passing EPA:</strong> {playerData.passing_epa}</p>
          <p><strong>Passing Air Yards:</strong> {playerData.passing_air_yards}</p>
          <p><strong>Sacks:</strong> {playerData.sacks}</p>
          <p><strong>Sack Fumbles:</strong> {playerData.sack_fumbles}</p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p><strong>Passing EPA:</strong> {playerData.passing_epa}</p>
          <p><strong>Passing Yards After Catch:</strong> {playerData.passing_yards_after_catch}</p>
          <p><strong>Sacks:</strong> {playerData.sacks}</p>
          <p><strong>Sack Fumbles:</strong> {playerData.sack_fumbles}</p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p><strong>Passing EPA:</strong> {playerData.passing_epa}</p>
          <p><strong>Passing First Downs:</strong> {playerData.passing_first_downs}</p>
          <p><strong>Sacks:</strong> {playerData.sacks}</p>
          <p><strong>Sack Fumbles:</strong> {playerData.sack_fumbles}</p>
        </>
      );
    case 'Shanahan Wide Zone':
      return (
        <>
          <p><strong>Passing EPA:</strong> {playerData.passing_epa}</p>
          <p><strong>Sacks:</strong> {playerData.sacks}</p>
          <p><strong>Sack Yards:</strong> {playerData.sack_yards}</p>
          <p><strong>Sack Fumbles:</strong> {playerData.sack_fumbles}</p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p><strong>Passing EPA:</strong> {playerData.passing_epa}</p>
          <p><strong>Sacks:</strong> {playerData.sacks}</p>
          <p><strong>Sack Yards:</strong> {playerData.sack_yards}</p>
          <p><strong>Sack Fumbles:</strong> {playerData.sack_fumbles}</p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p><strong>Passing EPA:</strong> {playerData.passing_epa}</p>
          <p><strong>Passing Air Yards:</strong> {playerData.passing_air_yards}</p>
          <p><strong>Sacks:</strong> {playerData.sacks}</p>
          <p><strong>Sack Fumbles:</strong> {playerData.sack_fumbles}</p>
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
          <p><strong>NGS Avg Time to Throw:</strong> {playerData.ngs_avg_time_to_throw}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {playerData.ngs_avg_intended_air_yards}</p>
          <p><strong>NGS Completion %:</strong> {playerData.ngs_completion_percentage}</p>
          <p><strong>NGS Passer Rating:</strong> {playerData.ngs_passer_rating}</p>
        </>
      );
    case 'Spread Option':
      return (
        <>
          <p><strong>NGS Avg Time to Throw:</strong> {playerData.ngs_avg_time_to_throw}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {playerData.ngs_avg_intended_air_yards}</p>
          <p><strong>NGS Completion %:</strong> {playerData.ngs_completion_percentage}</p>
          <p><strong>NGS Passer Rating:</strong> {playerData.ngs_passer_rating}</p>
          <p><strong>Rushing Yards:</strong> {playerData.rushing_yards}</p>
          <p><strong>Carries:</strong> {playerData.carries}</p>
          <p><strong>Rushing TDs:</strong> {playerData.rushing_tds}</p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p><strong>NGS Completion %:</strong> {playerData.ngs_completion_percentage}</p>
          <p><strong>NGS Expected Completion %:</strong> {playerData.ngs_expected_completion_percentage}</p>
          <p><strong>NGS Avg Air Yards Differential:</strong> {playerData.ngs_avg_air_yards_differential}</p>
          <p><strong>NGS Passer Rating:</strong> {playerData.ngs_passer_rating}</p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p><strong>NGS Avg Time to Throw:</strong> {playerData.ngs_avg_time_to_throw}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {playerData.ngs_avg_intended_air_yards}</p>
          <p><strong>NGS Completion %:</strong> {playerData.ngs_completion_percentage}</p>
          <p><strong>NGS Passer Rating:</strong> {playerData.ngs_passer_rating}</p>
        </>
      );
    case 'Shanahan Wide Zone':
      return (
        <>
          <p><strong>NGS Completion %:</strong> {playerData.ngs_completion_percentage}</p>
          <p><strong>NGS Passer Rating:</strong> {playerData.ngs_passer_rating}</p>
          <p><strong>NGS Avg Time to Throw:</strong> {playerData.ngs_avg_time_to_throw}</p>
          <p><strong>NGS Completion % Above Expectation:</strong> {playerData.ngs_completion_percentage_above_expectation}</p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p><strong>NGS Avg Time to Throw:</strong> {playerData.ngs_avg_time_to_throw}</p>
          <p><strong>NGS Completion %:</strong> {playerData.ngs_completion_percentage}</p>
          <p><strong>NGS Passer Rating:</strong> {playerData.ngs_passer_rating}</p>
          <p><strong>NGS Expected Completion %:</strong> {playerData.ngs_expected_completion_percentage}</p>
          <p><strong>Rushing Yards:</strong> {playerData.rushing_yards}</p>
          <p><strong>Carries:</strong> {playerData.carries}</p>
          <p><strong>Rushing TDs:</strong> {playerData.rushing_tds}</p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p><strong>NGS Avg Time to Throw:</strong> {playerData.ngs_avg_time_to_throw}</p>
          <p><strong>NGS Avg Intended Air Yards:</strong> {playerData.ngs_avg_intended_air_yards}</p>
          <p><strong>NGS Completion %:</strong> {playerData.ngs_completion_percentage}</p>
          <p><strong>NGS Passer Rating:</strong> {playerData.ngs_passer_rating}</p>
          <p><strong>Rushing Yards:</strong> {playerData.rushing_yards}</p>
          <p><strong>Carries:</strong> {playerData.carries}</p>
          <p><strong>Rushing TDs:</strong> {playerData.rushing_tds}</p>
        </>
      );
    default:
      return <p>No next gen stats available for the selected scheme.</p>;
  }
}
