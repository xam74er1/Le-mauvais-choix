import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CreateSession from './components/CreateSession';
import JoinSession from './components/JoinSession';
import GameRoom from './components/GameRoom';
import { GameProvider } from './context/GameContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import ResponsiveContainer from './components/layout/ResponsiveContainer';
import AnimatedTransition from './components/common/AnimatedTransition';
import LanguageSelector from './components/common/LanguageSelector';
import Button from './components/common/Button';
import './i18n/config';
import './styles/globals.css';

function App() {
  return (
    <LanguageProvider>
      <GameProvider>
        <NotificationProvider>
          <Router>
            <ResponsiveContainer>
              <LanguageSelector />
              <AnimatedTransition type="fadeIn">
                <AppHeader />
                
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/create" element={<CreateSession />} />
                  <Route path="/join" element={<JoinSession />} />
                  <Route path="/game/:sessionId" element={<GameRoom />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AnimatedTransition>
            </ResponsiveContainer>
          </Router>
        </NotificationProvider>
      </GameProvider>
    </LanguageProvider>
  );
}

function AppHeader() {
  const { t } = useTranslation();
  
  return (
    <header className="text-center mb-8">
      <h1 className="text-4xl font-bold mb-2">🎯 {t('app.title')}</h1>
      <p className="text-lg text-secondary">{t('app.description')}</p>
    </header>
  );
}

function HomePage() {
  const { t } = useTranslation();
  
  return (
    <AnimatedTransition type="slideUp" className="text-center">
      <div style={{ 
        backgroundColor: 'var(--bg-secondary)', 
        padding: 'var(--space-8)', 
        borderRadius: 'var(--border-radius-lg)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h2 className="text-3xl font-bold mb-4">{t('home.welcome')}</h2>
        <p className="text-lg mb-8">{t('home.choose_play')}</p>
        
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
          <a href="/create" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg" fullWidth>
              {t('home.create_game')}
            </Button>
          </a>
          <a href="/join" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="lg" fullWidth>
              {t('home.join_game')}
            </Button>
          </a>
        </div>
        
        <AnimatedTransition type="slideUp" delay={0.3}>
          <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
            <h3 className="text-xl font-semibold mb-4">{t('home.how_to_play')}</h3>
            <ol style={{ paddingLeft: 'var(--space-6)', lineHeight: '1.8' }}>
              <li>{t('home.rules.1')}</li>
              <li>{t('home.rules.2')}</li>
              <li>{t('home.rules.3')}</li>
              <li>{t('home.rules.4')}</li>
              <li>{t('home.rules.5')}</li>
            </ol>
          </div>
        </AnimatedTransition>
      </div>
    </AnimatedTransition>
  );
}

export default App;