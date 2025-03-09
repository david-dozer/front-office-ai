import React from 'react';
import { ordinalSuffixOf } from './OLDisplayStats';

export interface RBPlayerData {
  // Advanced Stats keys:
  rushing_epa?: number | string;
  rushing_epa_rank?: number;
  receiving_air_yards?: number | string;
  receiving_air_yards_rank?: number;
  receiving_yards_after_catch?: number | string;
  receiving_yards_after_catch_rank?: number;
  receiving_first_downs?: number | string;
  receiving_first_downs_rank?: number;
  rushing_first_downs?: number | string;
  rushing_first_downs_rank?: number;
  racr?: number | string;
  racr_rank?: number;
  rushing_fumbles_lost?: number | string;
  rushing_fumbles_lost_rank?: number;
  receiving_epa?: number | string;
  receiving_epa_rank?: number;
  
  // Next Gen Stats keys for RB:
  ngs_efficiency?: number | string;
  ngs_efficiency_rank?: number;
  ngs_avg_time_to_los?: number | string;
  ngs_avg_time_to_los_inv_rank?: number;
  ngs_avg_rush_yards?: number | string;
  ngs_avg_rush_yards_rank?: number;
  ngs_expected_rush_yards?: number | string;
  ngs_expected_rush_yards_rank?: number;
  ngs_rush_yards_over_expected?: number | string;
  ngs_rush_yards_over_expected_rank?: number;
  ngs_rush_yards_over_expected_per_att?: number | string;
  ngs_rush_yards_over_expected_per_att_rank?: number;
  
  // Standard Receiving Stats keys for RB:
  receptions?: number | string;
  receptions_rank?: number;
  targets?: number | string;
  targets_rank?: number;
  receiving_yards?: number | string;
  receiving_yards_rank?: number;
  receiving_tds?: number | string;
  receiving_tds_rank?: number;
  receiving_fumbles?: number | string;
  receiving_fumbles_rank?: number;
  receiving_fumbles_lost?: number | string;
  receiving_fumbles_lost_rank?: number;
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

function formatRank(rank: number): React.ReactElement {
  return (
    <span style={{ fontSize: "0.70em", color: "#666" }}>
      ({ordinalSuffixOf(rank)} out of 182 RBs)
    </span>
  );
}

export function renderRBAdvancedStats(playerData: RBPlayerData, teamScheme: string): React.ReactElement {
  switch (teamScheme) {
    case 'Air Raid':
      return (
        <>
          <p>
            <strong title="Expected Points Added (EPA) measures how explosive of a runner this RB is.">
              Rushing EPA:
            </strong>{' '}
            {formatStat(playerData.rushing_epa ?? 0, 'average')}{' '}
            {playerData.rushing_epa_rank !== undefined && formatRank(playerData.rushing_epa_rank)}
          </p>
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
            <strong>RACR:</strong> {formatStat(playerData.racr ?? 0, 'average')}{' '}
            {playerData.racr_rank !== undefined && formatRank(playerData.racr_rank)}
          </p>
        </>
      );
    case 'Spread Option':
      return (
        <>
          <p>
            <strong title="Expected Points Added (EPA) measures how explosive of a runner this RB is.">
              Rushing EPA:
            </strong>{' '}
            {formatStat(playerData.rushing_epa ?? 0, 'average')}{' '}
            {playerData.rushing_epa_rank !== undefined && formatRank(playerData.rushing_epa_rank)}
          </p>
          <p>
            <strong>Rushing First Downs:</strong> {formatStat(playerData.rushing_first_downs ?? 0, 'total')}{' '}
            {playerData.rushing_first_downs_rank !== undefined && formatRank(playerData.rushing_first_downs_rank)}
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
            <strong>RACR:</strong> {formatStat(playerData.racr ?? 0, 'average')}{' '}
            {playerData.racr_rank !== undefined && formatRank(playerData.racr_rank)}
          </p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p>
            <strong title="Expected Points Added (EPA) measures how explosive of a runner this RB is.">
              Rushing EPA:
            </strong>{' '}
            {formatStat(playerData.rushing_epa ?? 0, 'average')}{' '}
            {playerData.rushing_epa_rank !== undefined && formatRank(playerData.rushing_epa_rank)}
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
            <strong>Receiving Air Yards:</strong> {formatStat(playerData.receiving_air_yards ?? 0, 'total')}{' '}
            {playerData.receiving_air_yards_rank !== undefined && formatRank(playerData.receiving_air_yards_rank)}
          </p>
          <p>
            <strong>RACR:</strong> {formatStat(playerData.racr ?? 0, 'average')}{' '}
            {playerData.racr_rank !== undefined && formatRank(playerData.racr_rank)}
          </p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p>
            <strong title="Expected Points Added (EPA) measures how explosive of a runner this RB is.">
              Rushing EPA:
            </strong>{' '}
            {formatStat(playerData.rushing_epa ?? 0, 'average')}{' '}
            {playerData.rushing_epa_rank !== undefined && formatRank(playerData.rushing_epa_rank)}
          </p>
          <p>
            <strong>Rushing First Downs:</strong> {formatStat(playerData.rushing_first_downs ?? 0, 'total')}{' '}
            {playerData.rushing_first_downs_rank !== undefined && formatRank(playerData.rushing_first_downs_rank)}
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
            <strong>Receiving EPA:</strong> {formatStat(playerData.receiving_epa ?? 0, 'average')}{' '}
            {playerData.receiving_epa_rank !== undefined && formatRank(playerData.receiving_epa_rank)}
          </p>
        </>
      );
    case 'Shanahan Wide Zone':
      return (
        <>
          <p>
            <strong title="Expected Points Added (EPA) measures how explosive of a runner this RB is.">
              Rushing EPA:
            </strong>{' '}
            {formatStat(playerData.rushing_epa ?? 0, 'average')}{' '}
            {playerData.rushing_epa_rank !== undefined && formatRank(playerData.rushing_epa_rank)}
          </p>
          <p>
            <strong>Rushing First Downs:</strong> {formatStat(playerData.rushing_first_downs ?? 0, 'total')}{' '}
            {playerData.rushing_first_downs_rank !== undefined && formatRank(playerData.rushing_first_downs_rank)}
          </p>
          <p>
            <strong>Rushing Fumbles Lost:</strong> {formatStat(playerData.rushing_fumbles_lost ?? 0, 'total')}{' '}
            {playerData.rushing_fumbles_lost_rank !== undefined && formatRank(playerData.rushing_fumbles_lost_rank)}
          </p>
          <p>
            <strong>Receiving Air Yards:</strong> {formatStat(playerData.receiving_air_yards ?? 0, 'total')}{' '}
            {playerData.receiving_air_yards_rank !== undefined && formatRank(playerData.receiving_air_yards_rank)}
          </p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p>
            <strong title="Expected Points Added (EPA) measures how explosive of a runner this RB is.">
              Rushing EPA:
            </strong>{' '}
            {formatStat(playerData.rushing_epa ?? 0, 'average')}{' '}
            {playerData.rushing_epa_rank !== undefined && formatRank(playerData.rushing_epa_rank)}
          </p>
          <p>
            <strong>Rushing First Downs:</strong> {formatStat(playerData.rushing_first_downs ?? 0, 'total')}{' '}
            {playerData.rushing_first_downs_rank !== undefined && formatRank(playerData.rushing_first_downs_rank)}
          </p>
          <p>
            <strong>Rushing Fumbles Lost:</strong> {formatStat(playerData.rushing_fumbles_lost ?? 0, 'total')}{' '}
            {playerData.rushing_fumbles_lost_rank !== undefined && formatRank(playerData.rushing_fumbles_lost_rank)}
          </p>
          <p>
            <strong>Receiving First Downs:</strong> {formatStat(playerData.receiving_first_downs ?? 0, 'total')}{' '}
            {playerData.receiving_first_downs_rank !== undefined && formatRank(playerData.receiving_first_downs_rank)}
          </p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p>
            <strong title="Expected Points Added (EPA) measures how explosive of a runner this RB is.">
              Rushing EPA:
            </strong>{' '}
            {formatStat(playerData.rushing_epa ?? 0, 'average')}{' '}
            {playerData.rushing_epa_rank !== undefined && formatRank(playerData.rushing_epa_rank)}
          </p>
          <p>
            <strong>Rushing First Downs:</strong> {formatStat(playerData.rushing_first_downs ?? 0, 'total')}{' '}
            {playerData.rushing_first_downs_rank !== undefined && formatRank(playerData.rushing_first_downs_rank)}
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
            <strong>RACR:</strong> {formatStat(playerData.racr ?? 0, 'average')}{' '}
            {playerData.racr_rank !== undefined && formatRank(playerData.racr_rank)}
          </p>
        </>
      );
    default:
      return <p>No advanced stats available for the selected scheme.</p>;
  }
}

export function renderRBNextGenStats(playerData: RBPlayerData, teamScheme: string): React.ReactElement {
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
            <strong>NGS Efficiency:</strong> {formatStat(playerData.ngs_efficiency ?? 0, 'average')}{' '}
            {playerData.ngs_efficiency_rank !== undefined && formatRank(playerData.ngs_efficiency_rank)}
          </p>
          <p>
            <strong>NGS Avg Time to LOS:</strong> {formatStat(playerData.ngs_avg_time_to_los ?? 0, 'average')}{' '}
            {playerData.ngs_avg_time_to_los_inv_rank !== undefined && formatRank(playerData.ngs_avg_time_to_los_inv_rank)}
          </p>
          <p>
            <strong>NGS Avg Rush Yards:</strong> {formatStat(playerData.ngs_avg_rush_yards ?? 0, 'average')}{' '}
            {playerData.ngs_avg_rush_yards_rank !== undefined && formatRank(playerData.ngs_avg_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Expected Rush Yards:</strong> {formatStat(playerData.ngs_expected_rush_yards ?? 0, 'average')}{' '}
            {playerData.ngs_expected_rush_yards_rank !== undefined && formatRank(playerData.ngs_expected_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected:</strong> {formatStat(playerData.ngs_rush_yards_over_expected ?? 0, 'average')}{' '}
            {playerData.ngs_rush_yards_over_expected_rank !== undefined && formatRank(playerData.ngs_rush_yards_over_expected_rank)}
          </p>
        </>
      );
    case 'Spread Option':
      return (
        <>
          <p>
            <strong>NGS Efficiency:</strong> {formatStat(playerData.ngs_efficiency ?? 0, 'average')}{' '}
            {playerData.ngs_efficiency_rank !== undefined && formatRank(playerData.ngs_efficiency_rank)}
          </p>
          <p>
            <strong>NGS Avg Rush Yards:</strong> {formatStat(playerData.ngs_avg_rush_yards ?? 0, 'average')}{' '}
            {playerData.ngs_avg_rush_yards_rank !== undefined && formatRank(playerData.ngs_avg_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Expected Rush Yards:</strong> {formatStat(playerData.ngs_expected_rush_yards ?? 0, 'average')}{' '}
            {playerData.ngs_expected_rush_yards_rank !== undefined && formatRank(playerData.ngs_expected_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected:</strong> {formatStat(playerData.ngs_rush_yards_over_expected ?? 0, 'average')}{' '}
            {playerData.ngs_rush_yards_over_expected_rank !== undefined && formatRank(playerData.ngs_rush_yards_over_expected_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected per Att:</strong> {formatStat(playerData.ngs_rush_yards_over_expected_per_att ?? 0, 'average')}{' '}
            {playerData.ngs_rush_yards_over_expected_per_att_rank !== undefined && formatRank(playerData.ngs_rush_yards_over_expected_per_att_rank)}
          </p>
        </>
      );
    case 'West Coast':
      return (
        <>
          <p>
            <strong>NGS Efficiency:</strong> {formatStat(playerData.ngs_efficiency ?? 0, 'average')}{' '}
            {playerData.ngs_efficiency_rank !== undefined && formatRank(playerData.ngs_efficiency_rank)}
          </p>
          <p>
            <strong>NGS Avg Time to LOS:</strong> {formatStat(playerData.ngs_avg_time_to_los ?? 0, 'average')}{' '}
            {playerData.ngs_avg_time_to_los_inv_rank !== undefined && formatRank(playerData.ngs_avg_time_to_los_inv_rank)}
          </p>
          <p>
            <strong>NGS Avg Rush Yards:</strong> {formatStat(playerData.ngs_avg_rush_yards ?? 0, 'average')}{' '}
            {playerData.ngs_avg_rush_yards_rank !== undefined && formatRank(playerData.ngs_avg_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Expected Rush Yards:</strong> {formatStat(playerData.ngs_expected_rush_yards ?? 0, 'average')}{' '}
            {playerData.ngs_expected_rush_yards_rank !== undefined && formatRank(playerData.ngs_expected_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected:</strong> {formatStat(playerData.ngs_rush_yards_over_expected ?? 0, 'average')}{' '}
            {playerData.ngs_rush_yards_over_expected_rank !== undefined && formatRank(playerData.ngs_rush_yards_over_expected_rank)}
          </p>
        </>
      );
    case 'West Coast McVay':
      return (
        <>
          <p>
            <strong>NGS Efficiency:</strong> {formatStat(playerData.ngs_efficiency ?? 0, 'average')}{' '}
            {playerData.ngs_efficiency_rank !== undefined && formatRank(playerData.ngs_efficiency_rank)}
          </p>
          <p>
            <strong>NGS Avg Rush Yards:</strong> {formatStat(playerData.ngs_avg_rush_yards ?? 0, 'average')}{' '}
            {playerData.ngs_avg_rush_yards_rank !== undefined && formatRank(playerData.ngs_avg_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Expected Rush Yards:</strong> {formatStat(playerData.ngs_expected_rush_yards ?? 0, 'average')}{' '}
            {playerData.ngs_expected_rush_yards_rank !== undefined && formatRank(playerData.ngs_expected_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected:</strong> {formatStat(playerData.ngs_rush_yards_over_expected ?? 0, 'average')}{' '}
            {playerData.ngs_rush_yards_over_expected_rank !== undefined && formatRank(playerData.ngs_rush_yards_over_expected_rank)}
          </p>
          <p>
            <strong>NGS Avg Time to LOS:</strong> {formatStat(playerData.ngs_avg_time_to_los ?? 0, 'average')}{' '}
            {playerData.ngs_avg_time_to_los_inv_rank !== undefined && formatRank(playerData.ngs_avg_time_to_los_inv_rank)}
          </p>
        </>
      );
    case 'Shanahan Wide Zone':
      return (
        <>
          <p>
            <strong>NGS Efficiency:</strong> {formatStat(playerData.ngs_efficiency ?? 0, 'average')}{' '}
            {playerData.ngs_efficiency_rank !== undefined && formatRank(playerData.ngs_efficiency_rank)}
          </p>
          <p>
            <strong>NGS Avg Rush Yards:</strong> {formatStat(playerData.ngs_avg_rush_yards ?? 0, 'average')}{' '}
            {playerData.ngs_avg_rush_yards_rank !== undefined && formatRank(playerData.ngs_avg_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Expected Rush Yards:</strong> {formatStat(playerData.ngs_expected_rush_yards ?? 0, 'average')}{' '}
            {playerData.ngs_expected_rush_yards_rank !== undefined && formatRank(playerData.ngs_expected_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected:</strong> {formatStat(playerData.ngs_rush_yards_over_expected ?? 0, 'average')}{' '}
            {playerData.ngs_rush_yards_over_expected_rank !== undefined && formatRank(playerData.ngs_rush_yards_over_expected_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected per Att:</strong> {formatStat(playerData.ngs_rush_yards_over_expected_per_att ?? 0, 'average')}{' '}
            {playerData.ngs_rush_yards_over_expected_per_att_rank !== undefined && formatRank(playerData.ngs_rush_yards_over_expected_per_att_rank)}
          </p>
        </>
      );
    case 'Run Power':
      return (
        <>
          <p>
            <strong>NGS Efficiency:</strong> {formatStat(playerData.ngs_efficiency ?? 0, 'average')}{' '}
            {playerData.ngs_efficiency_rank !== undefined && formatRank(playerData.ngs_efficiency_rank)}
          </p>
          <p>
            <strong>NGS Avg Rush Yards:</strong> {formatStat(playerData.ngs_avg_rush_yards ?? 0, 'average')}{' '}
            {playerData.ngs_avg_rush_yards_rank !== undefined && formatRank(playerData.ngs_avg_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Expected Rush Yards:</strong> {formatStat(playerData.ngs_expected_rush_yards ?? 0, 'average')}{' '}
            {playerData.ngs_expected_rush_yards_rank !== undefined && formatRank(playerData.ngs_expected_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected:</strong> {formatStat(playerData.ngs_rush_yards_over_expected ?? 0, 'average')}{' '}
            {playerData.ngs_rush_yards_over_expected_rank !== undefined && formatRank(playerData.ngs_rush_yards_over_expected_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected per Att:</strong> {formatStat(playerData.ngs_rush_yards_over_expected_per_att ?? 0, 'average')}{' '}
            {playerData.ngs_rush_yards_over_expected_per_att_rank !== undefined && formatRank(playerData.ngs_rush_yards_over_expected_per_att_rank)}
          </p>
        </>
      );
    case 'Pistol Power Spread':
      return (
        <>
          <p>
            <strong>NGS Efficiency:</strong> {formatStat(playerData.ngs_efficiency ?? 0, 'average')}{' '}
            {playerData.ngs_efficiency_rank !== undefined && formatRank(playerData.ngs_efficiency_rank)}
          </p>
          <p>
            <strong>NGS Avg Rush Yards:</strong> {formatStat(playerData.ngs_avg_rush_yards ?? 0, 'average')}{' '}
            {playerData.ngs_avg_rush_yards_rank !== undefined && formatRank(playerData.ngs_avg_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Expected Rush Yards:</strong> {formatStat(playerData.ngs_expected_rush_yards ?? 0, 'average')}{' '}
            {playerData.ngs_expected_rush_yards_rank !== undefined && formatRank(playerData.ngs_expected_rush_yards_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected:</strong> {formatStat(playerData.ngs_rush_yards_over_expected ?? 0, 'average')}{' '}
            {playerData.ngs_rush_yards_over_expected_rank !== undefined && formatRank(playerData.ngs_rush_yards_over_expected_rank)}
          </p>
          <p>
            <strong>NGS Rush Yards Over Expected per Att:</strong> {formatStat(playerData.ngs_rush_yards_over_expected_per_att ?? 0, 'average')}{' '}
            {playerData.ngs_rush_yards_over_expected_per_att_rank !== undefined && formatRank(playerData.ngs_rush_yards_over_expected_per_att_rank)}
          </p>
        </>
      );
    default:
      return <p>No next gen stats available for the selected scheme.</p>;
  }
}

export function renderRBStandardReceivingStats(playerData: RBPlayerData): React.ReactElement {
  return (
    <>
      <p>
        <strong>Receptions:</strong> {formatStat(playerData.receptions ?? 0, 'total')}{' '}
        {playerData.receptions_rank !== undefined && formatRank(playerData.receptions_rank)}
      </p>
      <p>
        <strong>Targets:</strong> {formatStat(playerData.targets ?? 0, 'total')}{' '}
        {playerData.targets_rank !== undefined && formatRank(playerData.targets_rank)}
      </p>
      <p>
        <strong>Receiving Yards:</strong> {formatStat(playerData.receiving_yards ?? 0, 'total')}{' '}
        {playerData.receiving_yards_rank !== undefined && formatRank(playerData.receiving_yards_rank)}
      </p>
      <p>
        <strong>Receiving TDs:</strong> {formatStat(playerData.receiving_tds ?? 0, 'total')}{' '}
        {playerData.receiving_tds_rank !== undefined && formatRank(playerData.receiving_tds_rank)}
      </p>
      <p>
        <strong>Receiving Fumbles:</strong> {formatStat(playerData.receiving_fumbles ?? 0, 'total')}{' '}
        {playerData.receiving_fumbles_rank !== undefined && formatRank(playerData.receiving_fumbles_rank)}
      </p>
      <p>
        <strong>Receiving Fumbles Lost:</strong> {formatStat(playerData.receiving_fumbles_lost ?? 0, 'total')}{' '}
        {playerData.receiving_fumbles_lost_rank !== undefined && formatRank(playerData.receiving_fumbles_lost_rank)}
      </p>
    </>
  );
}
