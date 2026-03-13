import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { translateText } from '../utils/geminiApi';
import { stop } from '../utils/ttsHelper';
import QuestionCard from '../components/QuestionCard';
import AccessibilityToolbar from '../components/AccessibilityToolbar';
import { Brain, Send, ArrowLeft } from 'lucide-react';
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

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const requestFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error("Error attempting to enable fullscreen:", err);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const q = location.state?.questions;
    const title = location.state?.testTitle;
    if (!q || q.length === 0) {
      const role = localStorage.getItem('examease_role');
      navigate(role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
      return;
    }
    setQuestions(q);
    if (title) setTestTitle(title);
  }, [user, location.state, navigate]);

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

  const handleSubmit = () => {
    if (answeredCount < questions.length && !showConfirmSubmit) {
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

    navigate('/complete');
  };

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
      {/* Nav */}
      <nav className="exam__nav">
        <div className="exam__nav-logo">
          <div className="exam__nav-logo-icon">
            <Brain size={18} />
          </div>
          ExamEase
        </div>
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
