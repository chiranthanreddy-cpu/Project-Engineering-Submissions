import React, { useState } from 'react';

const MissionCard = React.memo(({ mission, onDelete, style }) => {
  const [showCrew, setShowCrew] = useState(false);
  console.log(`Rendering MissionCard: ${mission.name}`);

  return (
    <div style={style} className="card">
      <div className="card-banner">
        <div className="banner-overlay"></div>
        <span className="rocket-tag">{mission.rocket}</span>
        <h3 className="card-title">{mission.name}</h3>
      </div>

      <div className="card-content">
        <p className="mission-date">
          {new Date(mission.launchDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <p className="mission-desc">"{mission.description}"</p>

        <div className="card-actions">
          <div className="action-row">
            <button
              onClick={() => setShowCrew(!showCrew)}
              className="btn btn-secondary"
            >
              {showCrew ? 'DIMISS ROSTER' : 'ACCESS CREW'}
            </button>
            <button
              onClick={() => onDelete(mission.id)}
              className="btn btn-danger"
            >
              ABORT
            </button>
          </div>

          {showCrew && (
            <div className="crew-section">
              <span className="crew-label">Active Personnel</span>
              <div className="crew-grid">
                {mission.crew && mission.crew.map((member, index) => (
                  <div key={index} className="crew-item">
                    <span className="crew-name">{member.name}</span>
                    <span className="crew-role">{member.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default MissionCard;
