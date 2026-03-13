import { useState } from 'react';
import {
  ZoomIn, ZoomOut, Sun, Moon, Eye, Type, Volume2,
  Languages, RotateCcw
} from 'lucide-react';
import { speak, stop } from '../utils/ttsHelper';

const LANGUAGES = [
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'bn', name: 'Bengali' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ur', name: 'Urdu' },
  { code: 'ar', name: 'Arabic' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
];

const AccessibilityToolbar = ({ onTranslate, onReset }) => {
  const [fontScale, setFontScale] = useState(1);
  const [darkMode, setDarkMode] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [selectedLang, setSelectedLang] = useState('');

  const handleZoomIn = () => {
    const newScale = Math.min(fontScale + 0.15, 2);
    setFontScale(newScale);
    document.documentElement.style.setProperty('--font-size-scale', newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(fontScale - 0.15, 0.7);
    setFontScale(newScale);
    document.documentElement.style.setProperty('--font-size-scale', newScale);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('light-mode');
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
    document.body.classList.toggle('focus-mode');
  };

  const toggleDyslexiaFont = () => {
    setDyslexiaFont(!dyslexiaFont);
    document.body.classList.toggle('dyslexia-font');
  };

  const handleReadAll = () => {
    const questions = document.querySelectorAll('.question-card__question');
    const allText = Array.from(questions).map((q, i) => `Question ${i + 1}: ${q.textContent}`).join('. ');
    speak(allText);
  };

  const handleTranslate = (langCode) => {
    setSelectedLang(langCode);
    setShowLangMenu(false);
    onTranslate(langCode);
  };

  const handleReset = () => {
    setFontScale(1);
    setDarkMode(true);
    setFocusMode(false);
    setDyslexiaFont(false);
    setSelectedLang('');
    document.documentElement.style.setProperty('--font-size-scale', 1);
    document.body.classList.remove('light-mode', 'focus-mode', 'dyslexia-font');
    stop();
    if (onReset) onReset();
  };

  return (
    <div className="a11y-toolbar">
      <div className="a11y-toolbar__label">Accessibility</div>
      <div className="a11y-toolbar__tools">
        {/* Text Size */}
        <div className="a11y-toolbar__group">
          <button className="a11y-btn" onClick={handleZoomOut} title="Decrease text size">
            <ZoomOut size={18} />
          </button>
          <span className="a11y-toolbar__scale">{Math.round(fontScale * 100)}%</span>
          <button className="a11y-btn" onClick={handleZoomIn} title="Increase text size">
            <ZoomIn size={18} />
          </button>
        </div>

        <div className="a11y-toolbar__divider"></div>

        {/* Dark/Light Mode */}
        <button className="a11y-btn" onClick={toggleDarkMode} title={darkMode ? 'Light mode' : 'Dark mode'}>
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Focus Mode */}
        <button className={`a11y-btn ${focusMode ? 'a11y-btn--active' : ''}`} onClick={toggleFocusMode} title="Focus mode">
          <Eye size={18} />
        </button>

        {/* Dyslexia Font */}
        <button className={`a11y-btn ${dyslexiaFont ? 'a11y-btn--active' : ''}`} onClick={toggleDyslexiaFont} title="Dyslexia-friendly font">
          <Type size={18} />
        </button>

        <div className="a11y-toolbar__divider"></div>

        {/* Read All */}
        <button className="a11y-btn" onClick={handleReadAll} title="Read all questions">
          <Volume2 size={18} />
        </button>

        {/* Translate */}
        <div className="a11y-toolbar__lang-wrapper">
          <button
            className={`a11y-btn ${selectedLang ? 'a11y-btn--active' : ''}`}
            onClick={() => setShowLangMenu(!showLangMenu)}
            title="Translate"
          >
            <Languages size={18} />
          </button>
          {showLangMenu && (
            <div className="a11y-toolbar__lang-menu">
              <div className="a11y-toolbar__lang-title">Translate to:</div>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  className={`a11y-toolbar__lang-option ${selectedLang === lang.code ? 'a11y-toolbar__lang-option--active' : ''}`}
                  onClick={() => handleTranslate(lang.code)}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="a11y-toolbar__divider"></div>

        {/* Reset */}
        <button className="a11y-btn" onClick={handleReset} title="Reset all settings">
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
};

export default AccessibilityToolbar;
