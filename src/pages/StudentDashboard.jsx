import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTests } from '../utils/testStore';
import { extractTextFromPDF } from '../utils/pdfParser';
import { simplifyQuestions } from '../utils/geminiApi';
import gsap from 'gsap';
import {
  Brain, Upload, FileText, Sparkles, Check, LogOut,
  BookOpen, ArrowRight, Clock, User
} from 'lucide-react';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [error, setError] = useState('');
  const [availableTests, setAvailableTests] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    setAvailableTests(getTests());

    gsap.to('.sd__welcome', { opacity: 1, y: 0, duration: 0.6, delay: 0.2 });
    gsap.to('.sd__title', { opacity: 1, y: 0, duration: 0.8, delay: 0.3 });
    gsap.to('.sd__subtitle', { opacity: 1, y: 0, duration: 0.8, delay: 0.4 });
    gsap.to('.sd__section', { opacity: 1, y: 0, duration: 0.7, stagger: 0.2, delay: 0.5 });
  }, [user, navigate]);

  const handleFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setError('');
    setProcessing(true);

    gsap.to('.sd__upload-zone', { opacity: 0, y: -20, duration: 0.3, onComplete: () => {
      gsap.to('.sd__processing', { opacity: 1, y: 0, duration: 0.5 });
    }});

    try {
      setProcessingStep(1);
      const text = await extractTextFromPDF(file);
      if (!text.trim()) throw new Error('No text found in the PDF. Make sure it contains selectable text.');

      setProcessingStep(2);
      const questions = await simplifyQuestions(text);

      setProcessingStep(3);
      setTimeout(() => {
        navigate('/exam', { state: { questions } });
      }, 800);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setProcessing(false);
      gsap.to('.sd__processing', { opacity: 0, duration: 0.2 });
      gsap.to('.sd__upload-zone', { opacity: 1, y: 0, duration: 0.5 });
    }
  };

  const handleStartTest = (test) => {
    navigate('/exam', { state: { questions: test.questions, testTitle: test.title } });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const handleLogout = async () => {
    localStorage.removeItem('examease_role');
    await logout();
    navigate('/');
  };

  const getInitial = () => user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'S';

  return (
    <div className="sd">
      {/* Nav */}
      <nav className="sd__nav">
        <div className="sd__nav-logo">
          <div className="sd__nav-logo-icon"><Brain size={20} /></div>
          ExamEase
          <span className="sd__nav-role">Student</span>
        </div>
        <div className="sd__nav-user">
          <div className="sd__nav-avatar">{getInitial()}</div>
          <button className="sd__nav-logout" onClick={handleLogout}>
            <LogOut size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Logout
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="sd__header">
        <p className="sd__welcome">Hello, {user?.displayName || 'Student'} 👋</p>
        <h1 className="sd__title">
          Your <span className="premium-text">Learning Space</span>
        </h1>
        <p className="sd__subtitle">
          Choose a test assigned by your teacher or upload your own exam paper for AI simplification
        </p>
      </div>

      {error && <div className="sd__error">{error}</div>}

      {/* Available Tests */}
      <div className="sd__section">
        <div className="sd__section-header">
          <h2 className="sd__section-title">
            <BookOpen size={20} /> Available Tests
          </h2>
          <span className="sd__section-count">{availableTests.length} tests</span>
        </div>

        {availableTests.length === 0 ? (
          <div className="sd__empty-tests">
            <p>No tests available yet.</p>
            <p className="sd__empty-hint">Ask your teacher to create a test, or upload your own PDF below!</p>
          </div>
        ) : (
          <div className="sd__tests-grid">
            {availableTests.map(test => (
              <button
                key={test.id}
                className="sd__test-card glass-card"
                onClick={() => handleStartTest(test)}
              >
                <div className="sd__test-card-icon">
                  <FileText size={24} />
                </div>
                <h3 className="sd__test-card-title">{test.title}</h3>
                {test.subject && (
                  <span className="sd__test-card-subject">{test.subject}</span>
                )}
                <div className="sd__test-card-meta">
                  <span><User size={12} /> {test.createdByName || 'Teacher'}</span>
                  <span>•</span>
                  <span>{test.questions.length} Qs</span>
                </div>
                <div className="sd__test-card-cta">
                  Start Test <ArrowRight size={14} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Upload Section */}
      <div className="sd__section">
        <div className="sd__section-header">
          <h2 className="sd__section-title">
            <Upload size={20} /> Upload Your Own PDF
          </h2>
        </div>

        {!processing && (
          <div
            className={`sd__upload-zone ${dragging ? 'sd__upload-zone--dragging' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="sd__upload-icon">
              <Upload size={36} />
            </div>
            <h3 className="sd__upload-title">
              Drag & drop your exam PDF here
            </h3>
            <p className="sd__upload-subtitle">
              or click to browse files — AI will simplify all questions
            </p>
            <button className="btn-primary sd__upload-btn">
              <FileText size={18} />
              Choose PDF File
            </button>
            <input
              ref={fileInputRef}
              className="sd__upload-input"
              type="file"
              accept="application/pdf"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
        )}

        {processing && (
          <div className="sd__processing">
            <div className="sd__processing-spinner"></div>
            <h3 className="sd__processing-title">Processing Your Exam</h3>
            <p className="sd__processing-subtitle">This may take a moment...</p>
            <div className="sd__processing-steps">
              <div className={`sd__processing-step ${processingStep >= 1 ? 'sd__processing-step--active' : ''} ${processingStep > 1 ? 'sd__processing-step--done' : ''}`}>
                <span className="sd__processing-step-icon">
                  {processingStep > 1 ? <Check size={16} /> : <Sparkles size={16} />}
                </span>
                Extracting text from PDF
              </div>
              <div className={`sd__processing-step ${processingStep >= 2 ? 'sd__processing-step--active' : ''} ${processingStep > 2 ? 'sd__processing-step--done' : ''}`}>
                <span className="sd__processing-step-icon">
                  {processingStep > 2 ? <Check size={16} /> : <Sparkles size={16} />}
                </span>
                AI is simplifying questions
              </div>
              <div className={`sd__processing-step ${processingStep >= 3 ? 'sd__processing-step--active' : ''}`}>
                <span className="sd__processing-step-icon">
                  {processingStep >= 3 ? <Check size={16} /> : <Sparkles size={16} />}
                </span>
                Preparing your exam
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
