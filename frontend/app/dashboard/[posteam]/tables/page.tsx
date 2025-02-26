"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Script from 'next/script';

interface Player {
  name: string;
  projectedSalary?: number; // Not in API, kept for future use
  prev_team: string;
  position: string;
  age: number; // Not in API, kept for future use
  fit: number;
}

function formatAAV(aav: number): string {
  if (typeof aav !== 'number') {
    return "Invalid AAV"; // Or handle non-number input as needed
  }

  const formattedAAV = aav.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0, // Remove decimal places if they are zero
  });

  return formattedAAV;
}

export default function TablesPage() {
  const { posteam } = useParams(); // e.g., 'NYJ'
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        if (!posteam) return;

        const positions = ['qb', 'rb', 'wr'];
        let allPlayers: Player[] = [];

        for (const pos of positions) {
          const res = await fetch(`http://127.0.0.1:5000/teams/${posteam}/${pos}fits`);
          const data = await res.json();

          // Transform the API response to fit our expected format
          const formattedPlayers = data.map((player: any) => ({
            name: player[`${pos}_name`] || "Unknown",
            position: pos.toUpperCase(), // Convert 'qb' -> 'QB'
            age: Math.ceil(player.age),
            projectedSalary: formatAAV(player.aav),
            prev_team: player.prev_team,
            fit: player.final_fit,
          }));

          allPlayers = [...allPlayers, ...formattedPlayers];
        }

        // Sort descending by 'fit'
        allPlayers.sort((a, b) => b.fit - a.fit);
        setPlayers(allPlayers);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }

    fetchData();
  }, [posteam]);

  useEffect(() => {
    if (typeof window !== 'undefined' && players.length > 0) {
      const checkDataTables = setInterval(() => {
        if (window.jQuery && window.jQuery.fn.DataTable) {
          clearInterval(checkDataTables);
          window.jQuery('#dataTable').DataTable();
        }
      }, 100);
    }
  }, [players]);

  return (
    <>
      <Script src="https://code.jquery.com/jquery-3.6.0.min.js" strategy="beforeInteractive" />
      <Script src="/vendor/datatables/jquery.dataTables.min.js" strategy="beforeInteractive" />
      <Script src="/vendor/datatables/dataTables.bootstrap4.min.js" strategy="afterInteractive" />

      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Free Agents for {posteam}</h1>
      </div>

      {/* down here before table, put the 1st best fit, the 5th best fit, and the 10th best fit */}

      <div className="container-fluid">
        <div className="card shadow mb-4">
          <div className="card-header py-3">
            <h6 className="m-0 font-weight-bold text-primary">Available Free Agents</h6>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table
                className="table table-bordered"
                id="dataTable"
                width="100%"
                cellSpacing="0"
              >
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Age</th>
                    <th>AAV</th>
                    <th>Previous Team</th>
                    <th>Fit</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, idx) => (
                    <tr key={idx}>
                      <td>{player.name}</td>
                      <td>{player.position}</td>
                      <td>{player.age}</td>
                      <td>{player.projectedSalary}</td>
                      <td>{player.prev_team}</td>
                      <td>{(player.fit*100).toFixed(3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
