import "./AdminDashboard.css";

function AdminDashboard() {
  const parties = [
    {
      id: 1,
      abbr: "INC",
      name: "Indian National Congress",
      vote_count: 120,
    },
    {
      id: 2,
      abbr: "BJP",
      name: "Bharatiya Janata Party",
      vote_count: 240,
    },
    {
      id: 3,
      abbr: "AAP",
      name: "Aam Aadmi Party",
      vote_count: 90,
    },
  ];

  const totalVotes = parties.reduce(
    (sum, party) => sum + party.vote_count,
    0
  );

  return (
    <div className="dashboard">
      <h1 className="title">🗳 BharatVote Dashboard</h1>

      <div className="stats">
        <div className="card">
          <h2>Total Parties</h2>
          <p>{parties.length}</p>
        </div>

        <div className="card">
          <h2>Total Votes</h2>
          <p>{totalVotes}</p>
        </div>
      </div>

      <div className="results">
        {parties.map((party) => {
          const percentage = (
            (party.vote_count / totalVotes) *
            100
          ).toFixed(1);

          return (
            <div className="party-card" key={party.id}>
              <div className="party-header">
                <h2>{party.abbr}</h2>
                <h3>{percentage}%</h3>
              </div>

              <p>{party.name}</p>

              <div className="bar-bg">
                <div
                  className="bar-fill"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>

              <h3>{party.vote_count} Votes</h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminDashboard;