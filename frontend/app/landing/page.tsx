'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

type Team = {
  posteam: string;
  team_conf: string;
  team_division: string;
  team_logo_espn: string;
  team_name: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LandingPage() {
  const router = useRouter();
  const { data: teams = [], error, isLoading } = useSWR('http://localhost:5000/teams', fetcher, {
    revalidateOnFocus: false, // Avoid refetching on tab switch
    dedupingInterval: 30000, // Cache results for 60 seconds
  });

  function handleLogoClick(posteam: string) {
    router.push(`/dashboard/${posteam}`);
  }

  function getDivisionsByConference(teamsArray: Team[], conf: "AFC" | "NFC") {
    const divisions = [`${conf} East`, `${conf} North`, `${conf} South`, `${conf} West`];
    const confTeams = teamsArray.filter((t) => t.team_conf === conf);
    return divisions.map((division) =>
      confTeams.filter((team) => team.team_division === division)
    );
  }

  const afcDivisions = getDivisionsByConference(teams, "AFC");
  const nfcDivisions = getDivisionsByConference(teams, "NFC");

  if (error) return <p>Error loading teams.</p>;
  if (isLoading) return <p>Loading...</p>; // Show loading indicator

  return (
    <>
      <div className="full-width-banner">
        <h2>Select Your Team (click on a logo)</h2>
      </div>

      <div className="container-landing">
        <div className="row">
          {/* AFC Column */}
          <div className="col-6 text-center">
            <img src="/afc.png" alt="AFC Logo" style={{ maxHeight: "70px" }} className="mb-4" />

            {afcDivisions.map((divisionTeams, idx) => (
              <div className="row mb-4" key={`afc-division-${idx}`}>
                {divisionTeams.map((team) => (
                  <div className="col-3 d-flex flex-column align-items-center" key={team.posteam}>
                    <img
                      src={team.team_logo_espn}
                      alt={team.team_name}
                      style={{ maxHeight: "60px", cursor: "pointer" }}
                      className="img-fluid mb-2"
                      onClick={() => handleLogoClick(team.posteam)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* NFC Column */}
          <div className="col-6 text-center">
            <img src="/nfc.png" alt="NFC Logo" style={{ maxHeight: "70px" }} className="mb-4" />

            {nfcDivisions.map((divisionTeams, idx) => (
              <div className="row mb-4" key={`nfc-division-${idx}`}>
                {divisionTeams.map((team) => (
                  <div className="col-3 d-flex flex-column align-items-center" key={team.posteam}>
                    <img
                      src={team.team_logo_espn}
                      alt={team.team_name}
                      style={{ maxHeight: "60px", cursor: "pointer" }}
                      className="img-fluid mb-2"
                      onClick={() => handleLogoClick(team.posteam)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
