import React, { useState } from 'react';
import ScoreCard from './ScoreCard';
import { Search } from 'lucide-react';

const ScoreList = ({ scores, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Performance flaw: No useMemo
  const filteredScores = scores.filter(s => 
    s.game.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.player.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="list-wrapper">
      <div className="search-container">
        <div className="search-field-wrapper">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search game, player, or score..."
            className="premium-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="score-grid">
        {filteredScores.map(score => (
          <ScoreCard key={score.id} score={score} onDelete={onDelete} />
        ))}
      </div>
      
      {filteredScores.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          <div style={{ fontFamily: 'JetBrains Mono', marginBottom: '0.5rem' }}>RESULT_NOT_FOUND</div>
          <p style={{ fontStyle: 'italic' }}>No matches found in the arcade mainframe.</p>
        </div>
      )}
    </div>
  );
};

export default ScoreList;
