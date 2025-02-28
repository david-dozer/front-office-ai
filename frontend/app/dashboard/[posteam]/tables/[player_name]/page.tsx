'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Script from 'next/script';

export default function PlayerPage() {
  const params = useParams();
  const [playerData, setPlayerData] = useState<any>(null);
  const chartRef = useRef<any>(null); // Will store the Chart instance

  // Fetch the player data
  useEffect(() => {
    if (!params?.posteam || !params?.player_name) return;

    async function fetchPlayer() {
      try {
        // Attempt each position until we get a 200 response
        const positions = ['QB', 'RB', 'WR'];
        for (const pos of positions) {
          const res = await fetch(`http://localhost:5000/teams/${params.posteam}/${pos}info/${params.player_name}`, {
            cache: 'no-store',
          });
          if (res.ok) {
            const data = await res.json();
            setPlayerData(data);
            break;
          }
        }
      } catch (err) {
        console.error('Error fetching player data:', err);
      }
    }
    fetchPlayer();
  }, [params]);

  // Once we have player data, create/update the donut chart
  useEffect(() => {
    if (!playerData) return;

    // Load your global Chart object from SB Admin 2 scripts:
    //  - /vendor/chart.js/Chart.min.js
    //  - /js/demo/chart-pie-demo.js
    // Once loaded, "window.Chart" should be available.

    // Destroy any old instance
    if (chartRef.current && chartRef.current.defaults && typeof chartRef.current.destroy === 'function') {
      chartRef.current.destroy();
    }

    const finalFit = parseFloat(playerData.final_fit) || 0;
    const r = Math.round(255 - 255 * finalFit);
    const g = Math.round(255 * finalFit);
    const donutColor = `rgb(${r}, ${g}, 0)`; // Red -> Green

    const ctx = document.getElementById('myPieChart') as HTMLCanvasElement;
    if (!ctx || !window.Chart) return;

    // Create a new chart instance and store it in the ref
    chartRef.current = new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Fit', 'Remaining'],
        datasets: [
          {
            data: [finalFit, 1 - finalFit],
            backgroundColor: [donutColor, '#eaeaea'],
            hoverBackgroundColor: [donutColor, '#eaeaea'],
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        cutoutPercentage: 80,
        legend: { display: false },
      },
    });
  }, [playerData]);

  // Render standard stats based on position
  const renderStandardStats = (data: any) => {
    switch (data.Position) {
      case 'QB':
        return (
          <>
            <p><strong>Passing TDs:</strong> {data.passing_tds}</p>
            <p><strong>Passing Yards:</strong> {data.passing_yards}</p>
            <p><strong>Interceptions:</strong> {data.interceptions}</p>
            <p><strong>Games:</strong> {data.games}</p>
          </>
        );
      case 'RB':
        return (
          <>
            <p><strong>Rushing TDs:</strong> {data.rushing_tds}</p>
            <p><strong>Rushing Yards:</strong> {data.rushing_yards}</p>
            <p><strong>Fumbles:</strong> {data.rushing_fumbles}</p>
            <p><strong>Carries:</strong> {data.carries}</p>
            <p><strong>Games:</strong> {data.games}</p>
          </>
        );
      case 'WR':
        return (
          <>
            <p><strong>Receiving TDs:</strong> {data.receiving_tds}</p>
            <p><strong>Catches:</strong> {data.receptions}</p>
            <p><strong>Receiving Yards:</strong> {data.receiving_yards}</p>
            <p><strong>Targets:</strong> {data.targets}</p>
            <p><strong>Games:</strong> {data.games}</p>
          </>
        );
      default:
        return <p>No standard stats for position {data.Position}.</p>;
    }
  };

  function convertHeightToFeetInches(heightInInches: number) {
    const feet = Math.floor(heightInInches / 12); // Get the number of feet
    const inches = heightInInches % 12; // Get the remaining inches
    return `${feet}'${inches}`; // Format as feet'inches"
  }

  if (!playerData) {
    return <div className="container-fluid">Loading player data...</div>;
  }

  return (
    <>
      {/*
        1) Loads Chart.js from the SB Admin 2 "vendor" folder
        2) Loads the SB Admin 2 "chart-pie-demo.js" which sets defaults on the global Chart object
        Make sure these paths match your actual file structure!
      */}
      <Script src="/vendor/chart.js/Chart.min.js" strategy="beforeInteractive" />
      <Script src="/js/demo/chart-pie-demo.js" strategy="beforeInteractive" />

      <div className="container-fluid">
        {/* Example layout: top row has Player Info and the Donut Chart side-by-side */}
        <div className="row mb-4">
          {/* Left column: Player Info */}
          <div className="col-md-8">
            <div className="card shadow mb-4">
              <div className="card-body">
                <h4 className="card-title mb-2">{playerData.player_name}</h4>
                <p><strong>Age:</strong> {parseInt(playerData.age, 10)}</p>
                <p><strong>Height:</strong> {convertHeightToFeetInches(playerData.height)}</p>
                <p><strong>Weight:</strong> {playerData.weight}</p>
                <p><strong>YOE:</strong> {playerData.YOE}</p>
                <p><strong>Position:</strong> {playerData.Position}</p>
                <p><strong>Projected AAV:</strong> 
                  {playerData.AAV ? ` $${(+playerData.AAV).toLocaleString()}` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Right column: Donut Chart */}
          <div className="col-md-4 d-flex align-items-center justify-content-center">
            <div className="card shadow" style={{ width: '250px', height: '250px' }}>
              <div className="card-body d-flex align-items-center justify-content-center">
                <canvas id="myPieChart"></canvas>
              </div>
              <div className="text-center mb-2">
                <small className="text-muted">
                  Player Fit: {(playerData.final_fit * 100).toFixed(1)}%
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Standard Stats */}
        <div className="row">
          <div className="col-md-12">
            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">Standard Stats</h6>
              </div>
              <div className="card-body">
                {renderStandardStats(playerData)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
