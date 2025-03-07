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

function formatRank(rank: number): React.ReactElement {
  return (
    <span style={{ fontSize: "0.70em", color: "#666" }}>
      ({ordinalSuffixOf(rank)} out of 182 RBs)
    </span>
  );
}

export function renderRBAdvancedStats(playerData: any, teamScheme: string): React.ReactElement {
  switch (teamScheme) {
    case 'Air Raid':
      return (
        <>
          <p>
            <strong>Rushing EPA:</strong> {formatStat(playerData.rushing_epa, 'average')} {formatRank(playerData.rushing_epa_rank)}
          </p>
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
    case 'Spread Option':
      return (
        <>
          <p>
            <strong>Rushing EPA:</strong> {formatStat(playerData.rushing_epa, 'average')} {formatRank(playerData.rushing_epa_rank)}
          </p>
          <p>
            <strong>Rushing First Downs:</strong> {formatStat(playerData.rushing_first_downs, 'total')} {formatRank(playerData.rushing_first_downs_rank)}
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
    case 'West Coast':
      return (
        <>
          <p>
            <strong>Rushing EPA:</strong> {formatStat(playerData.rushing_epa, 'average')} {formatRank(playerData.rushing_epa_rank)}
          </p>
          <p>
            <strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch, 'total')} {formatRank(playerData.receiving_yards_after_catch_rank)}
          </p>
          <p>
            <strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs, 'total')} {formatRank(playerData.receiving_first_downs_rank)}
          </p>
          <p>
            <strong>Receiving Air Yards:</strong> {formatStat(playerData.receiving_air_yards, 'total')} {formatRank(playerData.receiving_air_yards_rank)}
          </p>
          <p>
            <strong>RACR:</strong> {formatStat(playerData.racr, 'average')} {formatRank(playerData.racr_rank)}
          </p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p>
            <strong>Rushing EPA:</strong> {formatStat(playerData.rushing_epa, 'average')} {formatRank(playerData.rushing_epa_rank)}
          </p>
          <p>
            <strong>Rushing First Downs:</strong> {formatStat(playerData.rushing_first_downs, 'total')} {formatRank(playerData.rushing_first_downs_rank)}
          </p>
          <p>
            <strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs, 'total')} {formatRank(playerData.receiving_first_downs_rank)}
          </p>
          <p>
            <strong>Receiving Yards After Catch:</strong> {formatStat(playerData.receiving_yards_after_catch, 'total')} {formatRank(playerData.receiving_yards_after_catch_rank)}
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
            <strong>Rushing EPA:</strong> {formatStat(playerData.rushing_epa, 'average')} {formatRank(playerData.rushing_epa_rank)}
          </p>
          <p>
            <strong>Rushing First Downs:</strong> {formatStat(playerData.rushing_first_downs, 'total')} {formatRank(playerData.rushing_first_downs_rank)}
          </p>
          <p>
            <strong>Rushing Fumbles Lost:</strong> {formatStat(playerData.rushing_fumbles_lost, 'total')} {formatRank(playerData.rushing_fumbles_lost_rank)}
          </p>
          <p>
            <strong>Receiving Air Yards:</strong> {formatStat(playerData.receiving_air_yards, 'total')} {formatRank(playerData.receiving_air_yards_rank)}
          </p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p>
            <strong>Rushing EPA:</strong> {formatStat(playerData.rushing_epa, 'average')} {formatRank(playerData.rushing_epa_rank)}
          </p>
          <p>
            <strong>Rushing First Downs:</strong> {formatStat(playerData.rushing_first_downs, 'total')} {formatRank(playerData.rushing_first_downs_rank)}
          </p>
          <p>
            <strong>Rushing Fumbles Lost:</strong> {formatStat(playerData.rushing_fumbles_lost, 'total')} {formatRank(playerData.rushing_fumbles_lost_rank)}
          </p>
          <p>
            <strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs, 'total')} {formatRank(playerData.receiving_first_downs_rank)}
          </p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p>
            <strong>Rushing EPA:</strong> {formatStat(playerData.rushing_epa, 'average')} {formatRank(playerData.rushing_epa_rank)}
          </p>
          <p>
            <strong>Rushing First Downs:</strong> {formatStat(playerData.rushing_first_downs, 'total')} {formatRank(playerData.rushing_first_downs_rank)}
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

export function renderRBNextGenStats(playerData: any, teamScheme: string): React.ReactElement {
  // Check if any of the Next Gen Stat keys (union for RBs) are an empty string.
  if (
    playerData.ngs_efficiency === "" ||
    playerData.ngs_avg_time_to_los === "" ||
    playerData.ngs_avg_rush_yards === "" ||
    playerData.ngs_expected_rush_yards === "" ||
    playerData.ngs_rush_yards_over_expected === "" ||
    playerData.ngs_rush_yards_over_expected_per_att === ""
  ) {
    return <p>Not enough activity for Next Gen Stats...</p>;
  }

  switch (teamScheme) {
    case 'Air Raid':
      return (
        <>
          <p>
            <strong>NGS Efficiency:</strong> {formatStat(playerData.ngs_efficiency, 'average')} {formatRank(playerData.ngs_efficiency_rank)}
          </p>
          <p>
            <strong>NGS Avg Time to LOS:</strong> {formatStat(playerData.ngs_avg_time_to_los, 'average')} {formatRank(playerData.ngs_avg_time_to_los_inv_rank)}
          </p>
          <p>
            <strong>NGS Avg Rush Yards:</strong> {formatStat(playerData.ngs_avg_rush_yards, 'average')} {formatRank(playerData.ngs_avg_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Expected Rush Yards:</strong> {formatStat(playerData.ngs_expected_rush_yards, 'average')} {formatRank(playerData.ngs_expected_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected:</strong> {formatStat(playerData.ngs_rush_yards_over_expected, 'average')} {formatRank(playerData.ngs_rush_yards_over_expected_rank)}
          </p>
        </>
      );
    case 'Spread Option':
      return (
        <>
          <p>
            <strong>NGS Efficiency:</strong> {formatStat(playerData.ngs_efficiency, 'average')} {formatRank(playerData.ngs_efficiency_rank)}
          </p>
          <p>
            <strong>NGS Avg Rush Yards:</strong> {formatStat(playerData.ngs_avg_rush_yards, 'average')} {formatRank(playerData.ngs_avg_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Expected Rush Yards:</strong> {formatStat(playerData.ngs_expected_rush_yards, 'average')} {formatRank(playerData.ngs_expected_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected:</strong> {formatStat(playerData.ngs_rush_yards_over_expected, 'average')} {formatRank(playerData.ngs_rush_yards_over_expected_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected per Att:</strong> {formatStat(playerData.ngs_rush_yards_over_expected_per_att, 'average')} {formatRank(playerData.ngs_rush_yards_over_expected_per_att_rank)}
          </p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p>
            <strong>NGS Efficiency:</strong> {formatStat(playerData.ngs_efficiency, 'average')} {formatRank(playerData.ngs_efficiency_rank)}
          </p>
          <p>
            <strong>NGS Avg Time to LOS:</strong> {formatStat(playerData.ngs_avg_time_to_los, 'average')} {formatRank(playerData.ngs_avg_time_to_los_inv_rank)}
          </p>
          <p>
            <strong>NGS Avg Rush Yards:</strong> {formatStat(playerData.ngs_avg_rush_yards, 'average')} {formatRank(playerData.ngs_avg_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Expected Rush Yards:</strong> {formatStat(playerData.ngs_expected_rush_yards, 'average')} {formatRank(playerData.ngs_expected_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected:</strong> {formatStat(playerData.ngs_rush_yards_over_expected, 'average')} {formatRank(playerData.ngs_rush_yards_over_expected_rank)}
          </p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p>
            <strong>NGS Efficiency:</strong> {formatStat(playerData.ngs_efficiency, 'average')} {formatRank(playerData.ngs_efficiency_rank)}
          </p>
          <p>
            <strong>NGS Avg Rush Yards:</strong> {formatStat(playerData.ngs_avg_rush_yards, 'average')} {formatRank(playerData.ngs_avg_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Expected Rush Yards:</strong> {formatStat(playerData.ngs_expected_rush_yards, 'average')} {formatRank(playerData.ngs_expected_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected:</strong> {formatStat(playerData.ngs_rush_yards_over_expected, 'average')} {formatRank(playerData.ngs_rush_yards_over_expected_rank)}
          </p>
          <p>
            <strong>NGS Avg Time to LOS:</strong> {formatStat(playerData.ngs_avg_time_to_los, 'average')} {formatRank(playerData.ngs_avg_time_to_los_inv_rank)}
          </p>
        </>
      );
    case 'Shanahan Wide Zone':
      return (
        <>
          <p>
            <strong>NGS Efficiency:</strong> {formatStat(playerData.ngs_efficiency, 'average')} {formatRank(playerData.ngs_efficiency_rank)}
          </p>
          <p>
            <strong>NGS Avg Rush Yards:</strong> {formatStat(playerData.ngs_avg_rush_yards, 'average')} {formatRank(playerData.ngs_avg_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Expected Rush Yards:</strong> {formatStat(playerData.ngs_expected_rush_yards, 'average')} {formatRank(playerData.ngs_expected_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected:</strong> {formatStat(playerData.ngs_rush_yards_over_expected, 'average')} {formatRank(playerData.ngs_rush_yards_over_expected_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected per Att:</strong> {formatStat(playerData.ngs_rush_yards_over_expected_per_att, 'average')} {formatRank(playerData.ngs_rush_yards_over_expected_per_att_rank)}
          </p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p>
            <strong>NGS Efficiency:</strong> {formatStat(playerData.ngs_efficiency, 'average')} {formatRank(playerData.ngs_efficiency_rank)}
          </p>
          <p>
            <strong>NGS Avg Rush Yards:</strong> {formatStat(playerData.ngs_avg_rush_yards, 'average')} {formatRank(playerData.ngs_avg_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Expected Rush Yards:</strong> {formatStat(playerData.ngs_expected_rush_yards, 'average')} {formatRank(playerData.ngs_expected_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected:</strong> {formatStat(playerData.ngs_rush_yards_over_expected, 'average')} {formatRank(playerData.ngs_rush_yards_over_expected_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected per Att:</strong> {formatStat(playerData.ngs_rush_yards_over_expected_per_att, 'average')} {formatRank(playerData.ngs_rush_yards_over_expected_per_att_rank)}
          </p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p>
            <strong>NGS Efficiency:</strong> {formatStat(playerData.ngs_efficiency, 'average')} {formatRank(playerData.ngs_efficiency_rank)}
          </p>
          <p>
            <strong>NGS Avg Rush Yards:</strong> {formatStat(playerData.ngs_avg_rush_yards, 'average')} {formatRank(playerData.ngs_avg_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Expected Rush Yards:</strong> {formatStat(playerData.ngs_expected_rush_yards, 'average')} {formatRank(playerData.ngs_expected_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected:</strong> {formatStat(playerData.ngs_rush_yards_over_expected, 'average')} {formatRank(playerData.ngs_rush_yards_over_expected_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected per Att:</strong> {formatStat(playerData.ngs_rush_yards_over_expected_per_att, 'average')} {formatRank(playerData.ngs_rush_yards_over_expected_per_att_rank)}
          </p>
        </>
      );
    default:
      return <p>No next gen stats available for the selected scheme.</p>;
  }
}

export function renderRBStandardReceivingStats(playerData: any): React.ReactElement {
  return (
    <>
      <p>
        <strong>Receptions:</strong> {formatStat(playerData.receptions, 'total')} {formatRank(playerData.receptions_rank)}
      </p>
      <p>
        <strong>Targets:</strong> {formatStat(playerData.targets, 'total')} {formatRank(playerData.targets_rank)}
      </p>
      <p>
        <strong>Receiving Yards:</strong> {formatStat(playerData.receiving_yards, 'total')} {formatRank(playerData.receiving_yards_rank)}
      </p>
      <p>
        <strong>Receiving TDs:</strong> {formatStat(playerData.receiving_tds, 'total')} {formatRank(playerData.receiving_tds_rank)}
      </p>
      <p>
        <strong>Receiving Fumbles:</strong> {formatStat(playerData.receiving_fumbles, 'total')} {formatRank(playerData.receiving_fumbles_rank)}
      </p>
      <p>
        <strong>Receiving Fumbles Lost:</strong> {formatStat(playerData.receiving_fumbles_lost, 'total')} {formatRank(playerData.receiving_fumbles_lost_rank)}
      </p>
    </>
  );
}
