'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Team = {
  posteam: string;
  team_conf: string;
  team_division: string;
  team_logo_espn: string;
  team_name: string;
};

export default function LandingPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchTeams() {
      const res = await fetch('http://127.0.0.1:5000/teams', { cache: 'no-store' });
      const data = await res.json();
      setTeams(data);
    }
    fetchTeams();
  }, []);

  function handleLogoClick(posteam: string) {
    router.push(`/dashboard/${posteam}`);
  }

  // Helper to group teams by conference/division remains the same
  function getDivisionsByConference(teamsArray: Team[], conf: "AFC" | "NFC") {
    const divisions = [`${conf} East`, `${conf} North`, `${conf} South`, `${conf} West`];
    const confTeams = teamsArray.filter((t) => t.team_conf === conf);
    return divisions.map((division) =>
      confTeams.filter((team) => team.team_division === division)
    );
  }

  const afcDivisions = getDivisionsByConference(teams, "AFC");
  const nfcDivisions = getDivisionsByConference(teams, "NFC");

  return (
    <>
      <div className="bg-dark text-white text-center py-3 mb-4">
        <h2 className="m-0">Select Your Team (click on a logo)</h2>
      </div>

      <div className="container">
        <div className="row">
          {/* Left Column: AFC */}
          <div className="col-6 text-center">
            <img
              src="/afc.png"
              alt="AFC Logo"
              style={{ maxHeight: "70px" }}
              className="mb-4"
            />

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

          {/* Right Column: NFC */}
          <div className="col-6 text-center">
            <img
              src="/nfc.png"
              alt="NFC Logo"
              style={{ maxHeight: "70px" }}
              className="mb-4"
            />

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
