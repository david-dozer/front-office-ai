"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import CircularProgressBar from '@/app/components/CircularProgressBar';

interface Player {
  id: string; // Assumes the API provides a unique id for each player
  name: string;
  projectedSalary?: string;
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
  const [selectedFilter, setSelectedFilter] = useState('Filter by Position');

  useEffect(() => {
    async function fetchData() {
      try {
        if (!posteam) return;

        // Define endpoints for QB, RB, WR and oline free agent data.
        const endpoints = [
          { pos: 'qb', endpoint: `http://localhost:5000/teams/${posteam}/qbfits` },
          { pos: 'rb', endpoint: `http://localhost:5000/teams/${posteam}/rbfits` },
          { pos: 'wr', endpoint: `http://localhost:5000/teams/${posteam}/wrfits` },
          { pos: 'te', endpoint: `http://localhost:5000/teams/${posteam}/tefits` },
          { pos: 'oline', endpoint: `http://localhost:5000/oline` }
        ];

        let allPlayers: Player[] = [];

        for (const item of endpoints) {
          const res = await fetch(item.endpoint);
          const data = await res.json();

          let formattedPlayers;
          if (item.pos === 'oline') {
            // For oline, convert aav from string to number and use player.pos as the position.
            formattedPlayers = data.map((player: any, index: number) => ({
              id: player.id || `oline-${index}`,
              name: player.name || "Unknown",
              position: player.pos || "Unknown", // use the actual position
              age: player.age ? Math.ceil(player.age) : 0,
              projectedSalary: player.aav ? formatAAV(Number(player.aav)) : "",
              prev_team: player.prevteam || "",
              fit: player.final_rating, // final_rating is used as fit
              headshot_url: player.headshot_url,
            }));
          } else {
            // For QB, RB, WR, TE endpoints assume they return final_fit field.
            formattedPlayers = data.map((player: any) => ({
              id: player[`${item.pos}_id`] || "Unknown",
              name: player[`${item.pos}_name`] || "Unknown",
              position: item.pos.toUpperCase(),
              age: Math.ceil(player.age),
              projectedSalary: formatAAV(player.aav),
              prev_team: player.prev_team,
              fit: player.final_fit,
              headshot_url: player.headshot, // Adjust if needed
            }));
          }
          allPlayers = [...allPlayers, ...formattedPlayers];
        }

        // Sort all players descending by their fit value.
        allPlayers.sort((a, b) => b.fit - a.fit);
        setPlayers(allPlayers);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
    fetchData();
  }, [posteam]);

  useEffect(() => {
    if (typeof window === 'undefined' || players.length === 0) return;
  
    let isInitialized = false;
    const checkDataTables = setInterval(() => {
      if (isInitialized) {
        clearInterval(checkDataTables);
        return;
      }
      try {
        if (
          window.jQuery && 
          typeof window.jQuery.fn === 'object' && 
          typeof window.jQuery.fn.DataTable === 'function' &&
          typeof window.jQuery.fn.DataTable.isDataTable === 'function'
        ) {
          console.log("Libraries loaded, initializing table...");
          isInitialized = true;
          clearInterval(checkDataTables);
          
          const dt = window.jQuery('#dataTable').DataTable({
            "columnDefs": [
              { "orderable": false, "targets": [0, 1, 4] },
              { "orderable": true, "targets": [2, 3, 5] }
            ],
            "order": [[5, "desc"]]
          });
  
          window.jQuery('#dataTable thead th:eq(5)').on('click', function() {
            dt.order([5, "desc"]).draw();
          });
          
          // Updated dropdown click handler.
          window.jQuery('.dropdown-menu a').on('click', (e: JQuery.ClickEvent) => {
            e.preventDefault();
            const anchor = e.currentTarget;
            const value = window.jQuery(anchor).data('value');
            const text = window.jQuery(anchor).text();
            window.jQuery('#positionDropdown').text('Position: ' + text);
            
            if (value === '') {
              dt.column(1).search('').draw();
            } else if (value === 'Skilled Offense') {
              dt.column(1).search('QB|RB|WR|TE', true, false).draw();
            } else if (value === 'OLINE') {
              // Filter positions that match any of the offensive line positions.
              dt.column(1).search('^(OT|OL|G|C)$', true, false).draw();
            } else {
              dt.column(1).search(`^${value}$`, true, false).draw();
            }
          });
        }
      } catch (error) {
        console.error('DataTable initialization error:', error);
      }
    }, 250);
    return () => clearInterval(checkDataTables);
  }, [players]);

  const topFits = [0, 4, 9].map(idx => players[idx]).filter(player => player);

  return (
    <>
      <Script src="https://code.jquery.com/jquery-3.6.0.min.js" strategy="beforeInteractive" />
      <Script src="/vendor/datatables/jquery.dataTables.js" strategy="afterInteractive" />
      <Script src="/vendor/datatables/dataTables.bootstrap4.js" strategy="afterInteractive" />

      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Free Agent Fits</h1>
      </div>

      <div className="container">
        <div className="row justify-content-center">
          {topFits.map((player, idx) => (
            <div key={idx} className="col-md-4 mb-4 d-flex flex-column align-items-center">
              <a href={`/dashboard/${posteam}/tables/${player.id}`}>
                <CircularProgressBar 
                  progress={(player.fit || 0) * 100} 
                  size={250} 
                  strokeWidth={15} 
                  duration={1500}
                  headshotUrl={player.headshot_url} 
                />
              </a>
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
              <div className="dropdown">
                <button 
                  className="btn btn-secondary dropdown-toggle" 
                  type="button" 
                  id="positionDropdown" 
                  data-toggle="dropdown" 
                  aria-haspopup="true" 
                  aria-expanded="false"
                >
                  Filter by Position
                </button>
                <div 
                  className="dropdown-menu dropdown-menu-right shadow animated--grow-in" 
                  aria-labelledby="positionDropdown"
                >
                  <a className="dropdown-item" href="#" data-value="">All</a>
                  <a className="dropdown-item" href="#" data-value="Skilled Offense">Skilled Offense (QB, RB, WR, TE)</a>
                  <a className="dropdown-item" href="#" data-value="QB">QB</a>
                  <a className="dropdown-item" href="#" data-value="RB">RB</a>
                  <a className="dropdown-item" href="#" data-value="WR">WR</a>
                  <a className="dropdown-item" href="#" data-value="TE">TE</a>
                  <div className="dropdown-divider"></div>
                  <a className="dropdown-item" href="#" data-value="OLINE">
                    OLine (OT, G, C, OL)
                  </a>
                </div>
              </div>
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
                    <th className="sortable" style={{cursor: 'pointer'}}>Prev. AAV</th>
                    <th>Previous Team</th>
                    <th className="sortable" style={{cursor: 'pointer'}}>Fit</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, idx) => (
                    <tr key={idx}>
                      <td>
                        <Link 
                          href={`/dashboard/${posteam}/tables/${player.id}`} 
                          className="m-0 font-weight-bold text-primary"
                          style={{ textDecoration: "none" }}
                          onClick={() => console.log("Player: {player.id}")}
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
