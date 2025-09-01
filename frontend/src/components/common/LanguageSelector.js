import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../../context/LanguageContext';
import { gsap } from 'gsap';

const LanguageSelectorContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LanguageToggle = styled.button`
  display: flex;
  align-items: center;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 25px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--primary-color);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const LanguageOption = styled.span`
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  font-size: 14px;
  transition: all 0.3s ease;
`;

const Separator = styled.span`
  color: var(--text-secondary);
  margin: 0 4px;
`;

const LanguageSelector = () => {
  const { currentLanguage, toggleLanguage, isEnglish } = useLanguage();
  const containerRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    // Initial animation
    gsap.fromTo(containerRef.current, 
      { 
        opacity: 0, 
        x: 50,
        scale: 0.8
      },
      { 
        opacity: 1, 
        x: 0,
        scale: 1,
        duration: 0.6,
        ease: "back.out(1.7)",
        delay: 0.5
      }
    );
  }, []);

  const handleToggle = () => {
    // Animation for language switch
    gsap.to(toggleRef.current, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
      onComplete: () => {
        // Trigger language change after animation
        toggleLanguage();
        
        // Success animation
        gsap.to(toggleRef.current, {
          scale: 1.05,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        });
      }
    });
  };

  return (
    <LanguageSelectorContainer ref={containerRef}>
      <LanguageToggle 
        ref={toggleRef}
        onClick={handleToggle}
        title={isEnglish ? "Switch to French" : "Passer en anglais"}
      >
        <LanguageOption active={isEnglish}>EN</LanguageOption>
        <Separator>/</Separator>
        <LanguageOption active={!isEnglish}>FR</LanguageOption>
      </LanguageToggle>
    </LanguageSelectorContainer>
  );
};

export default LanguageSelector;