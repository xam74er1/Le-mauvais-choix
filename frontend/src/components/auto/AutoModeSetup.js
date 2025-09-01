import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import CSVUploader from '../csv/CSVUploader';

const AutoModeSetup = ({ sessionId, playerId, onAutoModeEnabled }) => {
  const [questionSets, setQuestionSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState('');
  const [customTimers, setCustomTimers] = useState({
    submission_timeout: 60,
    voting_timeout: 30,
    results_display: 10
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  useEffect(() => {
    loadQuestionSets();
  }, []);

  const loadQuestionSets = async () => {
    try {
      const response = await fetch('/question-sets');
      if (response.ok) {
        const data = await response.json();
        setQuestionSets(data.question_sets);
      }
    } catch (error) {
      console.error('Error loading question sets:', error);
    }
  };

  const handleUploadSuccess = (result) => {
    setShowUploader(false);
    loadQuestionSets(); // Refresh the list
    setSelectedSetId(result.question_set.set_id);
  };

  const enableAutoMode = async () => {
    if (!selectedSetId) {
      alert('Please select a question set first');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/sessions/${sessionId}/auto-mode?player_id=${playerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_set_id: selectedSetId,
          timers: customTimers
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to enable automatic mode');
      }

      if (onAutoModeEnabled) {
        onAutoModeEnabled();
      }

    } catch (error) {
      console.error('Error enabling auto mode:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimerChange = (timerType, value) => {
    setCustomTimers(prev => ({
      ...prev,
      [timerType]: parseInt(value) || 0
    }));
  };

  return (
    <div className="auto-mode-setup">
      <div className="content-section">
        <h2 className="text-2xl font-bold mb-4">🤖 Automatic Game Master Setup</h2>
        <p className="text-muted mb-6">
          Set up automatic mode to run the game without manual intervention. 
          The system will automatically progress through questions, manage timing, and calculate scores.
        </p>

        {/* Question Set Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">1. Select Question Set</h3>
          
          {questionSets.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-muted mb-4">Loading question sets...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questionSets.map((set) => (
                <div
                  key={set.set_id}
                  className={`question-set-card ${selectedSetId === set.set_id ? 'selected' : ''}`}
                  onClick={() => setSelectedSetId(set.set_id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{set.name}</h4>
                      <p className="text-sm text-muted">{set.category}</p>
                      <p className="text-sm text-muted">{set.question_count} questions</p>
                    </div>
                    <div className="text-right">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedSetId === set.set_id 
                          ? 'bg-primary border-primary' 
                          : 'border-gray-300'
                      }`} />
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="secondary" 
                onClick={() => setShowUploader(true)}
                className="w-full"
              >
                + Upload New Question Set
              </Button>
            </div>
          )}
        </div>

        {/* Timer Configuration */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">2. Configure Timing</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="label">Submission Time (seconds)</label>
              <input
                type="number"
                className="input"
                min="10"
                max="300"
                value={customTimers.submission_timeout}
                onChange={(e) => handleTimerChange('submission_timeout', e.target.value)}
              />
              <p className="text-xs text-muted mt-1">Time for players to submit fake answers</p>
            </div>
            
            <div className="form-group">
              <label className="label">Voting Time (seconds)</label>
              <input
                type="number"
                className="input"
                min="10"
                max="120"
                value={customTimers.voting_timeout}
                onChange={(e) => handleTimerChange('voting_timeout', e.target.value)}
              />
              <p className="text-xs text-muted mt-1">Time for players to vote on answers</p>
            </div>
            
            <div className="form-group">
              <label className="label">Results Display (seconds)</label>
              <input
                type="number"
                className="input"
                min="5"
                max="60"
                value={customTimers.results_display}
                onChange={(e) => handleTimerChange('results_display', e.target.value)}
              />
              <p className="text-xs text-muted mt-1">Time to show results before next question</p>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <Button
            variant="primary"
            onClick={enableAutoMode}
            disabled={!selectedSetId || isLoading}
            className="text-lg px-8 py-3"
          >
            {isLoading ? 'Starting...' : '🚀 Start Automatic Mode'}
          </Button>
          
          {selectedSetId && (
            <p className="text-sm text-muted mt-2">
              The game will automatically progress through questions with the configured timing.
              You can still intervene manually if needed.
            </p>
          )}
        </div>
      </div>

      {/* CSV Uploader Modal */}
      {showUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Upload Question Set</h3>
                <button
                  onClick={() => setShowUploader(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <CSVUploader onUpload={handleUploadSuccess} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoModeSetup;