import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { translateText } from '../utils/geminiApi';
import { stop } from '../utils/ttsHelper';
import QuestionCard from '../components/QuestionCard';
import AccessibilityToolbar from '../components/AccessibilityToolbar';
import { Brain, Send, ArrowLeft, Clock } from 'lucide-react';
import './ExamPage.css';

const ExamPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [testTitle, setTestTitle] = useState('');
  const [answers, setAnswers] = useState({});
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [translations, setTranslations] = useState({});
  const [translating, setTranslating] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [escapeWarned, setEscapeWarned] = useState(false);
  const [showEscPopup, setShowEscPopup] = useState(false);
  const [timeLimit, setTimeLimit] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = document.fullscreenElement !== null;
      setIsFullscreen(isCurrentlyFullscreen);

      // If they EXIT fullscreen while taking a test, that's a strike
      if (!isCurrentlyFullscreen && questions.length > 0) {
        if (!escapeWarned) {
          // First strike: Warn them, speak, and try to force them back in
          setEscapeWarned(true);
          setShowEscPopup(true);
          speak("Clicking one more time ESC button will submit the test");
          
          setTimeout(() => setShowEscPopup(false), 5000);
        } else {
          // Second strike: Auto Submit
          handleSubmit(true);
        }
      }
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, escapeWarned]);

  const requestFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        if (navigator.keyboard && navigator.keyboard.lock) {
          try {
            await navigator.keyboard.lock(['Escape']);
          } catch (e) {
            console.warn('Keyboard lock failed:', e);
          }
        }
      }
    } catch (err) {
      console.error("Error attempting to enable fullscreen:", err);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        
        if (!escapeWarned) {
          setEscapeWarned(true);
          setShowEscPopup(true);
          speak("Clicking one more time ESC button will submit the test");
          setTimeout(() => setShowEscPopup(false), 5000);
        } else {
          handleSubmit(true);
        }
      }
    };

    if (isFullscreen && questions.length > 0) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => document.removeEventListener('keydown', handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullscreen, escapeWarned, questions]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const q = location.state?.questions;
    const title = location.state?.testTitle;
    const testId = location.state?.testId;
    const tLimit = location.state?.timeLimit;
    if (!q || q.length === 0) {
      const role = localStorage.getItem('examease_role');
      navigate(role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
      return;
    }
    setQuestions(q);
    if (title) setTestTitle(title);
    if (tLimit > 0) {
      setTimeLimit(tLimit * 60);
      setRemainingTime(tLimit * 60);
    }
  }, [user, location.state, navigate]);

  useEffect(() => {
    if (!isFullscreen || remainingTime === null) return;

    const timerInterval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isFullscreen]); // We don't want to reset interval unnecessarily

  useEffect(() => {
    if (remainingTime === 0) {
      handleSubmit(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingTime]);

  const formatTime = (seconds) => {
    if (seconds === null) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleTranslate = async (langCode) => {
    if (!langCode) {
      setTranslations({});
      return;
    }

    setTranslating(true);
    const newTranslations = {};
    
    for (const q of questions) {
      try {
        newTranslations[q.id] = await translateText(q.simplifiedQuestion, langCode);
      } catch {
        newTranslations[q.id] = q.simplifiedQuestion;
      }
    }
    
    setTranslations(newTranslations);
    setTranslating(false);
  };

  const handleReset = () => {
    setTranslations({});
  };

  const handleSubmit = (isAutoSubmit = false) => {
    if (isAutoSubmit !== true && answeredCount < questions.length && !showConfirmSubmit) {
      setShowConfirmSubmit(true);
      return;
    }
    stop();
    document.body.classList.remove('focus-mode', 'dyslexia-font', 'light-mode');
    document.documentElement.style.setProperty('--font-size-scale', 1);
    
    // Auto-exit fullscreen on submit
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    navigate('/complete', { 
      state: { 
        questions, 
        answers, 
        testTitle: testTitle || "Your Exam",
        testId: location.state?.testId,
        userName: user?.displayName || user?.email?.split('@')[0] || "Student",
        tabSwitched: isAutoSubmit === true
      } 
    });
  };

  useEffect(() => {
    const checkVisibility = () => {
      if (document.visibilityState === 'hidden' && questions.length > 0 && isFullscreen) {
        handleSubmit(true);
      }
    };
    document.addEventListener('visibilitychange', checkVisibility);
    return () => document.removeEventListener('visibilitychange', checkVisibility);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, answers, testTitle, isFullscreen, showConfirmSubmit]);

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  const handleScroll = () => {
    const cards = document.querySelectorAll('.question-card');
    const viewportCenter = window.innerHeight / 2;
    
    let closestIdx = 0;
    let closestDist = Infinity;
    
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.top + rect.height / 2;
      const dist = Math.abs(cardCenter - viewportCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    });
    
    setActiveQuestion(closestIdx);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (questions.length === 0) return null;

  if (!isFullscreen) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--text-primary)', textAlign: 'center', padding: '20px' }}>
        <Brain size={64} style={{ color: 'var(--primary)', marginBottom: '24px' }} />
        <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Test Environment Locked</h2>
        <p style={{ maxWidth: '450px', marginBottom: '32px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          This exam must be taken in <strong>Full Screen Mode</strong>. If you exit full screen before submitting the exam, your paper will be paused until you return.
        </p>
        <button className="btn-primary" onClick={requestFullscreen} style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
          Enter Full Screen & Start
        </button>
      </div>
    );
  }

  return (
    <div className="exam">
      {/* ESC Warning Popup */}
      {showEscPopup && (
        <div className="exam__esc-popup">
          <div className="exam__esc-popup-content">
            <span className="exam__esc-icon">⚠️</span>
            <p className="exam__esc-text">
              Clicking one more time ESC button will submit the test
            </p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="exam__nav">
        <div className="exam__nav-logo">
          <div className="exam__nav-logo-icon">
            <Brain size={18} />
          </div>
          ExamEase
        </div>
        
        {remainingTime !== null && (
          <div className="exam__timer" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: remainingTime < 60 ? '#e74c3c' : 'inherit' }}>
            <Clock size={16} />
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatTime(remainingTime)}</span>
          </div>
        )}

        <div className="exam__progress">
          <div className="exam__progress-bar">
            <div className="exam__progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="exam__progress-text">{answeredCount}/{questions.length}</span>
        </div>
      </nav>

      {/* Header */}
      <div className="exam__header">
        <h1 className="exam__title">
          {testTitle ? (
            <>{testTitle}</>
          ) : (
            <>Your Simplified <span className="premium-text">Exam</span></>
          )}
        </h1>
      </div>

      {translating && (
        <div style={{ textAlign: 'center', color: 'var(--primary-light)', marginBottom: 20, fontSize: '0.9rem' }}>
          ⏳ Translating questions...
        </div>
      )}

      {/* Questions */}
      <div className="exam__questions">
        {questions.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={i}
            answer={answers[q.id]}
            onAnswer={handleAnswer}
            isActive={activeQuestion === i}
            translatedText={translations[q.id]}
          />
        ))}
      </div>

      {/* Submit Bar */}
      <div className="exam__submit-bar">
        <span className="exam__answered">
          {answeredCount} of {questions.length} questions answered
        </span>
        <div className="exam__submit-area">
          {showConfirmSubmit && answeredCount < questions.length && (
            <span className="exam__submit-warning">
              ⚠️ {questions.length - answeredCount} unanswered — submit anyway?
            </span>
          )}
          <button className="btn-primary exam__submit-btn" onClick={handleSubmit}>
            <Send size={18} /> {showConfirmSubmit ? 'Confirm Submit' : 'Submit Exam'}
          </button>
        </div>
      </div>

      {/* Accessibility Toolbar */}
      <AccessibilityToolbar onTranslate={handleTranslate} onReset={handleReset} />
    </div>
  );
};

export default ExamPage;
