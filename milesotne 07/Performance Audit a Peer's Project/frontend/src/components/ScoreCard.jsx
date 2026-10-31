import React from 'react';
import { Trash2, Calendar, User, Hash } from 'lucide-react';

const ScoreCard = ({ score, onDelete }) => {
  return (
    <div className="score-card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: 'rgba(34, 211, 238, 0.1)', padding: '0.4rem', borderRadius: '0.5rem' }}>
            <Hash size={14} color="var(--accent-cyan)" />
          </div>
          <span style={{ fontSize: '0.7rem', fontFamily: 'JetBrains Mono', fontWeight: 'bold', color: 'var(--text-muted)' }}>
            #{score.id.toString().padStart(4, '0')}
          </span>
        </div>
        <button 
          onClick={() => onDelete(score.id)}
          className="btn-delete"
          aria-label="Remove score record"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h3 className="game-title">{score.game}</h3>
        <div className="player-info">
          <User size={14} />
          <span>{score.player}</span>
        </div>
      </div>

      <div className="score-display">
        <div>
          <div className="score-label">High Score</div>
          <div className="score-value">{score.score.toLocaleString()}</div>
        </div>
        <div style={{ height: '3rem', width: '3rem', background: 'var(--bg-color)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyCenter: 'center', border: '1px solid var(--border-color)' }}>
           <span style={{ color: 'var(--accent-pink)', fontSize: '1.2rem' }}>★</span>
        </div>
      </div>

      <div className="card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={14} />
          <span>{new Date(score.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
        </div>
        <div style={{ color: 'var(--accent-cyan)', fontSize: '0.6rem', fontWeight: '800', textTransform: 'uppercase' }}>
          Verified Intel
        </div>
      </div>
      
      {score.strategyNote && <div style={{ display: 'none' }}>Payload Bloat: Strategy Note is here!</div>}
    </div>
  );
};

export default ScoreCard;
