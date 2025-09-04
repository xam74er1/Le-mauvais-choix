import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import CSVUploader from './csv/CSVUploader';
import Button from './common/Button';

function QuestionPhase() {
  const [question, setQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { state, actions } = useGame();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim() || !correctAnswer.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      await actions.submitQuestion(question.trim(), correctAnswer.trim());
      setQuestion('');
      setCorrectAnswer('');
    } catch (error) {
      // Error handled in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleCSVUpload = async (result) => {
    setIsUploading(false);
    setShowCSVUpload(false);
    // Optionally show success message or redirect to auto mode
    alert(`Successfully uploaded ${result.question_set.question_count} questions!`);
  };

  const handleCancelUpload = () => {
    setShowCSVUpload(false);
    setIsUploading(false);
  };

  return (
    <div className="content-area">
      <div className="phase-indicator">
        🎮 Game Master: Submit Your Question
      </div>
      
      <div className="content-section">
        <h3 className="text-heading font-semibold space-element text-primary">
          Players Ready ({state.players.length})
        </h3>
        <div className="grid gap-3">
          {state.players.map((player) => (
            <div key={player.player_id} className="player-item">
              <div>
                <strong>{player.pseudonym}</strong>
                {player.is_game_master && <span className="game-master">Game Master</span>}
              </div>
              <div className="score">
                {state.scores[player.player_id] || 0} pts
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="content-section hero">
        <h3 className="text-title font-bold space-element">Submit Question & Answer</h3>
        <p className="text-body space-element" style={{ opacity: 0.9 }}>
          Pose an interesting question that will challenge players to create believable fake answers.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="form-group">
            <label className="text-body font-semibold text-inverse space-content block" htmlFor="question">
              Question
            </label>
            <input
              id="question"
              type="text"
              className="input text-body"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'var(--text-inverse)',
                borderRadius: 'var(--border-radius-lg)'
              }}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., What is the capital of Australia?"
              maxLength={200}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="text-body font-semibold text-inverse space-content block" htmlFor="correctAnswer">
              Correct Answer
            </label>
            <input
              id="correctAnswer"
              type="text"
              className="input text-body"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'var(--text-inverse)',
                borderRadius: 'var(--border-radius-lg)'
              }}
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="e.g., Canberra"
              maxLength={100}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="button success text-body font-semibold px-xl py-lg"
            disabled={submitting || !question.trim() || !correctAnswer.trim()}
            style={{
              backgroundColor: 'var(--accent-success)',
              borderRadius: 'var(--border-radius-lg)',
              marginTop: 'var(--space-lg)'
            }}
          >
            {submitting ? 'Submitting...' : '📤 Submit Question'}
          </button>
        </form>
        
        <div className="px-lg py-lg rounded-xl space-element" style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.1)', 
          border: '1px solid rgba(255, 255, 255, 0.2)' 
        }}>
          <h4 className="text-subheading font-semibold text-inverse space-content">💡 Tips for Good Questions:</h4>
          <ul className="text-body text-inverse space-y-3" style={{ opacity: 0.9, paddingLeft: 'var(--space-lg)' }}>
            <li>Choose topics that allow for creative fake answers</li>
            <li>Avoid questions that are too obscure or too obvious</li>
            <li>Consider questions about geography, history, science, or pop culture</li>
            <li>Make sure the correct answer isn't easily guessable</li>
          </ul>
        </div>
      </div>

      {/* CSV Upload Section */}
      <div className="content-section">
        <h3 className="text-heading font-semibold space-element text-primary">📄 Or Use Questions from CSV</h3>
        <p className="text-body text-secondary space-element">
          Upload a CSV file with pre-written questions for automatic mode, or continue manually.
        </p>
        
        {!showCSVUpload ? (
          <div className="flex gap-4">
            <Button 
              variant="secondary" 
              onClick={() => setShowCSVUpload(true)}
            >
              📤 Upload CSV Questions
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = `/game/${state.sessionId}?autoMode=true`}
            >
              🤖 Use Default Questions (Auto Mode)
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Upload Your Questions</h4>
              <Button 
                variant="outline" 
                onClick={handleCancelUpload}
                className="text-sm"
              >
                ✕ Cancel Upload
              </Button>
            </div>
            <CSVUploader 
              onUpload={handleCSVUpload}
              isUploading={isUploading}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionPhase;