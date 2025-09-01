import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGame } from '../context/GameContext';

function JoinSession() {
  const [sessionId, setSessionId] = useState('');
  const [pseudonym, setPseudonym] = useState('');
  const { state, actions } = useGame();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!sessionId.trim() || !pseudonym.trim()) {
      return;
    }

    try {
      await actions.joinSession(sessionId.trim().toUpperCase(), pseudonym.trim());
      navigate(`/game/${sessionId.trim().toUpperCase()}`);
    } catch (error) {
      // Error is handled in context
    }
  };

  return (
    <div className="card">
      <h2>{t('join.title')}</h2>
      <p>{t('join.description')}</p>
      
      {state.error && (
        <div className="error">
          {state.error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label" htmlFor="sessionId">
            {t('game.labels.session_id')}
          </label>
          <input
            id="sessionId"
            type="text"
            className="input"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value.toUpperCase())}
            placeholder={t('forms.placeholders.session_id')}
            maxLength={6}
            style={{ textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center' }}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="label" htmlFor="pseudonym">
            {t('game.labels.pseudonym')}
          </label>
          <input
            id="pseudonym"
            type="text"
            className="input"
            value={pseudonym}
            onChange={(e) => setPseudonym(e.target.value)}
            placeholder={t('forms.placeholders.pseudonym')}
            maxLength={20}
            required
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="submit" 
            className="button"
            disabled={state.loading || !sessionId.trim() || !pseudonym.trim()}
          >
            {state.loading ? t('join.joining') : t('home.join_game')}
          </button>
          
          <button 
            type="button" 
            className="button secondary"
            onClick={() => navigate('/')}
            disabled={state.loading}
          >
            {t('navigation.back')}
          </button>
        </div>
      </form>
      
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
        <h3>{t('join.how_to_play.title')}</h3>
        <ol>
          <li>{t('join.how_to_play.1')}</li>
          <li>{t('join.how_to_play.2')}</li>
          <li>{t('join.how_to_play.3')}</li>
          <li>{t('join.how_to_play.4')}</li>
        </ol>
      </div>
    </div>
  );
}

export default JoinSession;