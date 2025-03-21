"use client";

import React from 'react';

export interface OLPlayerData {
  overall_ranking?: number | string;
  final_rating: number | string;
  avg?: number | string;
  avg_ranking?: number | string;
  games?: number | string;
  "tmsnap%"?: number | string;
  "tmsnap%_ranking"?: number | string;
}

interface OLDisplayStatsProps {
  playerData: OLPlayerData;
}

// Helper to add an ordinal suffix to a number (e.g., 1 -> 1st, 2 -> 2nd, etc.)
export function ordinalSuffixOf(i: number): string {
  const j = i % 10,
    k = i % 100;
  if (j === 1 && k !== 11) {
    return i + "st";
  }
  if (j === 2 && k !== 12) {
    return i + "nd";
  }
  if (j === 3 && k !== 13) {
    return i + "rd";
  }
  return i + "th";
}

export default function OLDisplayStats({ playerData }: OLDisplayStatsProps) {
  // Overall ranking: if provided by the endpoint; otherwise, show "N/A"

  // Display final_rating as a percentage (multiplied by 100 and rounded to 1 decimal)
  const finalRatingPercent = (Number(playerData.final_rating) * 100).toFixed(1);

  // "avg" is the average snaps per game; its ranking is in "avg_ranking"
  const avg = playerData.avg || "N/A";
  const avgRanking = playerData.avg_ranking
    ? ordinalSuffixOf(Number(playerData.avg_ranking))
    : "N/A";

  // For team snaps, assume the cleaned key is "tmsnap%" and its ranking "tmsnap%_ranking"
  const teamSnaps = playerData["tmsnap%"]
    ? (Number(playerData["tmsnap%"])).toFixed(1) + "%"
    : "N/A";
  const teamSnapsRanking = playerData["tmsnap%_ranking"]
    ? ordinalSuffixOf(Number(playerData["tmsnap%_ranking"]))
    : "N/A";

  return (
    <div>
      <h2>Offensive Line Player Stats</h2>
      <p>
        <strong>Games:</strong> {playerData.games}
      </p>
      <p>
        <strong>Final Rating:</strong> {finalRatingPercent} / 100
      </p>
      <p>
        <strong>Average Snaps per Game:</strong> {avg} ({avgRanking} rank)
      </p>
      <p>
        <strong>Team Snaps:</strong> {teamSnaps} ({teamSnapsRanking} rank)
      </p>
    </div>
  );
}
