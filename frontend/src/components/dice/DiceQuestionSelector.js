import React, { useState } from 'react';
import Button from '../common/Button';

const DiceQuestionSelector = ({ sessionId, playerId, onQuestionSelected, disabled = false }) => {
  const [isRolling, setIsRolling] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState('');
  const [editedAnswer, setEditedAnswer] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const rollDice = async () => {
    if (disabled || isRolling) return;

    setIsRolling(true);
    
    try {
      const response = await fetch(`http://localhost:8000/sessions/${sessionId}/dice-question?player_id=${playerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get random question');
      }

      const result = await response.json();
      
      // Simulate dice roll animation delay
      setTimeout(() => {
        setSelectedQuestion(result);
        setEditedQuestion(result.question);
        setEditedAnswer(result.answer);
        setIsEditing(true);
        setIsRolling(false);
        
        if (onQuestionSelected) {
          onQuestionSelected(result);
        }
      }, 1000);

    } catch (error) {
      console.error('Error rolling dice:', error);
      setIsRolling(false);
      alert(error.message);
    }
  };

  const submitEditedQuestion = async () => {
    if (!editedQuestion.trim() || !editedAnswer.trim()) {
      alert('Please fill in both question and answer');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/sessions/${sessionId}/edit-question?player_id=${playerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: editedQuestion.trim(),
          answer: editedAnswer.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit question');
      }

      // Reset state after successful submission
      setSelectedQuestion(null);
      setEditedQuestion('');
      setEditedAnswer('');
      setIsEditing(false);

    } catch (error) {
      console.error('Error submitting edited question:', error);
      alert(error.message);
    }
  };

  const cancelEdit = () => {
    setSelectedQuestion(null);
    setEditedQuestion('');
    setEditedAnswer('');
    setIsEditing(false);
  };

  return (
    <div className="dice-question-selector">
      <div className="flex items-center gap-4 mb-4">
        <div 
          className={`dice-container ${isRolling ? 'dice-rolling' : ''}`}
          onClick={rollDice}
          title="Roll dice for random question"
        >
          <span className="dice-face">🎲</span>
        </div>
        
        <div>
          <h3 className="font-semibold">Random Question</h3>
          <p className="text-sm text-muted">
            Click the dice to get a random question from your question sets
          </p>
        </div>
      </div>

      {isRolling && (
        <div className="text-center py-8">
          <div className="loading">
            <div className="pulse">🎲 Rolling dice...</div>
          </div>
        </div>
      )}

      {isEditing && selectedQuestion && (
        <div className="question-editor card">
          <div className="flex items-center gap-2 mb-4">
            <span className="question-source dice">🎲 Dice</span>
            <span className="text-sm text-muted">
              You can edit this question before presenting it
            </span>
          </div>

          <div className="form-group">
            <label className="label">Question:</label>
            <textarea
              className="input"
              rows="3"
              value={editedQuestion}
              onChange={(e) => setEditedQuestion(e.target.value)}
              placeholder="Enter your question..."
            />
          </div>

          <div className="form-group">
            <label className="label">Correct Answer:</label>
            <textarea
              className="input"
              rows="2"
              value={editedAnswer}
              onChange={(e) => setEditedAnswer(e.target.value)}
              placeholder="Enter the correct answer..."
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="primary"
              onClick={submitEditedQuestion}
              disabled={!editedQuestion.trim() || !editedAnswer.trim()}
              className="flex-1"
            >
              Submit Question
            </Button>
            <Button
              variant="secondary"
              onClick={cancelEdit}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

          {selectedQuestion.question !== editedQuestion || selectedQuestion.answer !== editedAnswer ? (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-700">
                <strong>Original:</strong> {selectedQuestion.question}
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                <strong>Answer:</strong> {selectedQuestion.answer}
              </p>
            </div>
          ) : null}
        </div>
      )}

      {!isEditing && !isRolling && (
        <div className="text-center py-4 text-muted">
          <p>Click the dice to get a random question that you can edit before presenting to players.</p>
        </div>
      )}
    </div>
  );
};

export default DiceQuestionSelector;