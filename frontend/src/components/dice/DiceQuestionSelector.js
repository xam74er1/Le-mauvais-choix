import React, { useState } from 'react';
import Button from '../common/Button';
import { apiConfig } from '../../config/api';

const DiceQuestionSelector = ({ sessionId, playerId, onQuestionLoaded, disabled = false }) => {
  const [isRolling, setIsRolling] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState('');
  const [editedAnswer, setEditedAnswer] = useState('');
  const [isQuestionLoaded, setIsQuestionLoaded] = useState(false);

  const rollDice = async () => {
    if (disabled || isRolling) return;

    setIsRolling(true);
    
    try {
      const response = await fetch(`${apiConfig.apiUrl}/sessions/${sessionId}/dice-question?player_id=${playerId}`, {
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
        setIsQuestionLoaded(true);
        setIsRolling(false);
        
        // Pass the question data to parent component to fill admin fields
        if (onQuestionLoaded) {
          onQuestionLoaded({
            question: result.question,
            answer: result.answer,
            source: 'dice'
          });
        }
      }, 1000);

    } catch (error) {
      console.error('Error rolling dice:', error);
      setIsRolling(false);
      alert(error.message);
    }
  };

  const updateParentFields = () => {
    // Update parent component fields with edited content
    if (onQuestionLoaded) {
      onQuestionLoaded({
        question: editedQuestion.trim(),
        answer: editedAnswer.trim(),
        source: 'dice'
      });
    }
  };

  const clearDiceQuestion = () => {
    setSelectedQuestion(null);
    setEditedQuestion('');
    setEditedAnswer('');
    setIsQuestionLoaded(false);
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

      {isQuestionLoaded && selectedQuestion && (
        <div className="question-preview card">
          <div className="flex items-center gap-2 mb-4">
            <span className="question-source dice">🎲 Dice Question Loaded</span>
            <span className="text-sm text-success">
              ✅ Question loaded into admin fields! You can edit and submit manually.
            </span>
          </div>

          <div className="form-group">
            <label className="label">Preview - Question:</label>
            <textarea
              className="input"
              rows="3"
              value={editedQuestion}
              onChange={(e) => {
                setEditedQuestion(e.target.value);
                updateParentFields();
              }}
              placeholder="Enter your question..."
            />
          </div>

          <div className="form-group">
            <label className="label">Preview - Correct Answer:</label>
            <textarea
              className="input"
              rows="2"
              value={editedAnswer}
              onChange={(e) => {
                setEditedAnswer(e.target.value);
                updateParentFields();
              }}
              placeholder="Enter the correct answer..."
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="primary"
              onClick={updateParentFields}
              disabled={!editedQuestion.trim() || !editedAnswer.trim()}
              className="flex-1"
            >
              Update Admin Fields
            </Button>
            <Button
              variant="secondary"
              onClick={clearDiceQuestion}
              className="flex-1"
            >
              Clear & Roll Again
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

      {!isQuestionLoaded && !isRolling && (
        <div className="text-center py-4 text-muted">
          <p>Click the dice to get a random question that will be loaded into the admin fields for review and editing.</p>
        </div>
      )}
    </div>
  );
};

export default DiceQuestionSelector;