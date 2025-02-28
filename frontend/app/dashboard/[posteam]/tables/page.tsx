"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import CircularProgressBar from '@/app/components/CircularProgressBar';

interface Player {
  id: string; // Assumes the API provides a unique id for each player
  name: string;
  projectedSalary?: number;
  prev_team: string;
  position: string;
  age: number;
  fit: number;
  headshot_url?: string;
}

function formatAAV(aav: number): string {
  if (typeof aav !== 'number') {
    return "Invalid AAV";
  }

  const formattedAAV = aav.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
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
          const res = await fetch(`http://localhost:5000/teams/${posteam}/${pos}fits`);
          const data = await res.json();

          // Include an id from the API and map the rest of the fields.
          const formattedPlayers = data.map((player: any) => ({
            id: player.id, // make sure the API returns an id
            name: player[`${pos}_name`] || "Unknown",
            position: pos.toUpperCase(),
            age: Math.ceil(player.age),
            projectedSalary: formatAAV(player.aav),
            prev_team: player.prev_team,
            fit: player.final_fit,
            headshot_url: player.headshot, // Ensure this field exists in API response
          }));

          allPlayers = [...allPlayers, ...formattedPlayers];
        }

        // Initial sort descending by 'fit'
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
            try {
                if (window.jQuery && window.jQuery.fn.DataTable) {
                    clearInterval(checkDataTables);
                    if (!window.jQuery.fn.DataTable.isDataTable('#dataTable')) {
                        const dt = window.jQuery('#dataTable').DataTable({
                            "columnDefs": [
                                { "orderable": false, "targets": [0, 1, 4] },
                                { "orderable": true, "targets": [2, 3, 5] }
                            ],
                            "order": [[5, "desc"]]
                        });

                        $('#dataTable thead th:eq(5)').on('click', function() {
                            dt.order([5, "desc"]).draw();
                        });
                    }
                }
            } catch (error) {
                console.error("Error initializing DataTable:", error);
                // Optionally, you can set a state to show a user-friendly message
            }
        }, 100);
    }
}, [players]);

const topFits = [0, 4, 9].map(idx => players[idx]).filter(player => player);

  return (
    <>
      <Script src="https://code.jquery.com/jquery-3.6.0.min.js" strategy="beforeInteractive" />
      <Script src="/vendor/datatables/jquery.dataTables.min.js" strategy="beforeInteractive" />
      <Script src="/vendor/datatables/dataTables.bootstrap4.min.js" strategy="afterInteractive" />

      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Free Agent Fits</h1>
      </div>

      <div className="container">
        <div className="row justify-content-center">
          {topFits.map((player, idx) => (
            <div key={idx} className="col-md-4 mb-4 d-flex flex-column align-items-center">
              <CircularProgressBar 
                progress={(player.fit || 0) * 100} 
                size={250} 
                strokeWidth={15} 
                duration={1500}
                headshotUrl={player.headshot_url} 
              />
              <small className="text-muted mt-3">
                <strong>{player.name} - Fit: {(player.fit * 100).toFixed(1)}%</strong>
              </small>
            </div>
          ))}
        </div>
      </div>

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
                    <th className="sortable" style={{cursor: 'pointer'}}>Age</th>
                    <th className="sortable" style={{cursor: 'pointer'}}>AAV</th>
                    <th>Previous Team</th>
                    {/* Add pointer cursor and a class for the sortable column */}
                    <th className="sortable" style={{cursor: 'pointer'}}>Fit</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, idx) => (
                    <tr key={idx}>
                      <td>
                        <Link 
                          href={`/dashboard/${posteam}/tables/${player.name}`} 
                          className="m-0 font-weight-bold text-primary"
                          style={{ textDecoration: "none" }}
                        >
                          {player.name}
                        </Link>
                      </td>
                      <td>{player.position}</td>
                      <td>{player.age}</td>
                      <td>{player.projectedSalary}</td>
                      <td>{player.prev_team}</td>
                      <td>{(player.fit * 100).toFixed(3)}</td>
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
