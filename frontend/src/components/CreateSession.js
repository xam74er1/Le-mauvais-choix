import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGame } from '../context/GameContext';

function CreateSession() {
  const [pseudonym, setPseudonym] = useState('');
  const { state, actions } = useGame();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!pseudonym.trim()) {
      return;
    }

    try {
      const response = await actions.createSession(pseudonym.trim());
      navigate(`/game/${response.session_id}`);
    } catch (error) {
      // Error is handled in context
    }
  };

  return (
    <div className="card">
      <h2>{t('create.title')}</h2>
      <p>{t('create.description')}</p>
      
      {state.error && (
        <div className="error">
          {state.error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label" htmlFor="pseudonym">
            {t('create.name_label')}
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
            disabled={state.loading || !pseudonym.trim()}
          >
            {state.loading ? t('create.creating') : t('home.create_game')}
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
        <h3>{t('create.responsibilities.title')}</h3>
        <ul>
          <li>{t('create.responsibilities.1')}</li>
          <li>{t('create.responsibilities.2')}</li>
          <li>{t('create.responsibilities.3')}</li>
          <li>{t('create.responsibilities.4')}</li>
        </ul>
      </div>
    </div>
  );
}

export default CreateSession;