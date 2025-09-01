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
    <div>
      <div className="phase-indicator">
        🎮 Game Master: Submit Your Question
      </div>
      
      <div className="card">
        <h3>Players Ready ({state.players.length})</h3>
        <ul className="player-list">
          {state.players.map((player) => (
            <li key={player.player_id} className="player-item">
              <div>
                <strong>{player.pseudonym}</strong>
                {player.is_game_master && <span className="game-master">Game Master</span>}
              </div>
              <div className="score">
                {state.scores[player.player_id] || 0} pts
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3>Submit Question & Answer</h3>
        <p>Pose an interesting question that will challenge players to create believable fake answers.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label" htmlFor="question">
              Question
            </label>
            <input
              id="question"
              type="text"
              className="input"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., What is the capital of Australia?"
              maxLength={200}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="label" htmlFor="correctAnswer">
              Correct Answer
            </label>
            <input
              id="correctAnswer"
              type="text"
              className="input"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="e.g., Canberra"
              maxLength={100}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="button"
            disabled={submitting || !question.trim() || !correctAnswer.trim()}
          >
            {submitting ? 'Submitting...' : '📤 Submit Question'}
          </button>
        </form>
        
        <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#e7f3ff', borderRadius: '6px' }}>
          <h4>💡 Tips for Good Questions:</h4>
          <ul>
            <li>Choose topics that allow for creative fake answers</li>
            <li>Avoid questions that are too obscure or too obvious</li>
            <li>Consider questions about geography, history, science, or pop culture</li>
            <li>Make sure the correct answer isn't easily guessable</li>
          </ul>
        </div>
      </div>

      {/* CSV Upload Section */}
      <div className="card">
        <h3>📄 Or Use Questions from CSV</h3>
        <p>Upload a CSV file with pre-written questions for automatic mode, or continue manually.</p>
        
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