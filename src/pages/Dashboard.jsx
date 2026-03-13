import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractTextFromPDF } from '../utils/pdfParser';
import { simplifyQuestions, getApiKey, setApiKey } from '../utils/geminiApi';
import gsap from 'gsap';
import { Brain, Upload, FileText, Sparkles, Check, CircleDot, LogOut, Key } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [error, setError] = useState('');
  const [apiKey, setApiKeyState] = useState(getApiKey());
  const [apiSaved, setApiSaved] = useState(!!getApiKey());
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    gsap.to('.dashboard__welcome', { opacity: 1, y: 0, duration: 0.6, delay: 0.2 });
    gsap.to('.dashboard__title', { opacity: 1, y: 0, duration: 0.8, delay: 0.3 });
    gsap.to('.dashboard__subtitle', { opacity: 1, y: 0, duration: 0.8, delay: 0.4 });
    gsap.to('.dashboard__api-section', { opacity: 1, y: 0, duration: 0.7, delay: 0.5 });
    gsap.to('.upload-zone', { opacity: 1, y: 0, duration: 0.8, delay: 0.6 });
  }, [user, navigate]);

  const handleSaveKey = () => {
    setApiKey(apiKey);
    setApiSaved(true);
    gsap.fromTo('.dashboard__api-status', { scale: 0.8 }, { scale: 1, duration: 0.3 });
  };

  const handleFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    if (!apiKey) {
      setError('Please enter your Gemini API key first.');
      return;
    }

    setError('');
    setProcessing(true);

    gsap.to('.upload-zone', { opacity: 0, y: -20, duration: 0.3, onComplete: () => {
      gsap.to('.processing', { opacity: 1, y: 0, duration: 0.5 });
    }});

    try {
      // Step 1: Extract text
      setProcessingStep(1);
      const text = await extractTextFromPDF(file);
      
      if (!text.trim()) {
        throw new Error('No text found in the PDF. Make sure it contains selectable text.');
      }

      // Step 2: AI processing
      setProcessingStep(2);
      const questions = await simplifyQuestions(text, apiKey);

      // Step 3: Done
      setProcessingStep(3);

      // Short delay then navigate
      setTimeout(() => {
        navigate('/exam', { state: { questions } });
      }, 800);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      setProcessing(false);
      gsap.to('.processing', { opacity: 0, duration: 0.2 });
      gsap.to('.upload-zone', { opacity: 1, y: 0, duration: 0.5 });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getInitial = () => {
    return user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <div className="dashboard">
      {/* Nav */}
      <nav className="dashboard__nav">
        <div className="dashboard__nav-logo">
          <div className="dashboard__nav-logo-icon">
            <Brain size={20} />
          </div>
          ExamEase
        </div>
        <div className="dashboard__nav-user">
          <div className="dashboard__nav-avatar">{getInitial()}</div>
          <button className="dashboard__nav-logout" onClick={handleLogout}>
            <LogOut size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Logout
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="dashboard__header">
        <p className="dashboard__welcome">
          Hello, {user?.displayName || 'Student'} 👋
        </p>
        <h1 className="dashboard__title">
          Upload Your <span className="premium-text">Exam Paper</span>
        </h1>
        <p className="dashboard__subtitle">
          Upload a PDF of your exam questions and let AI simplify them for you
        </p>
      </div>

      {/* API Key */}
      <div className="dashboard__api-section">
        <label className="dashboard__api-label">
          <Key size={14} /> Gemini API Key
        </label>
        <div className="dashboard__api-row">
          <input
            className="dashboard__api-input"
            type="password"
            placeholder="Paste your API key here..."
            value={apiKey}
            onChange={(e) => { setApiKeyState(e.target.value); setApiSaved(false); }}
          />
          <button className="btn-primary dashboard__api-save" onClick={handleSaveKey}>
            Save
          </button>
        </div>
        <div className={`dashboard__api-status ${apiSaved ? 'dashboard__api-status--saved' : 'dashboard__api-status--missing'}`}>
          {apiSaved ? (
            <><Check size={14} /> API key saved</>
          ) : (
            <><CircleDot size={14} /> Get free key from aistudio.google.com</>
          )}
        </div>
      </div>

      {error && <div className="dashboard__error">{error}</div>}

      {/* Upload Zone */}
      {!processing && (
        <div
          className={`upload-zone ${dragging ? 'upload-zone--dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="upload-zone__icon">
            <Upload size={36} />
          </div>
          <h3 className="upload-zone__title">
            Drag & drop your exam PDF here
          </h3>
          <p className="upload-zone__subtitle">
            or click to browse files
          </p>
          <button className="btn-primary upload-zone__btn">
            <FileText size={18} />
            Choose PDF File
          </button>
          <input
            ref={fileInputRef}
            className="upload-zone__input"
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      )}

      {/* Processing */}
      {processing && (
        <div className="processing">
          <div className="processing__spinner"></div>
          <h3 className="processing__title">Processing Your Exam</h3>
          <p className="processing__subtitle">This may take a moment...</p>
          <div className="processing__steps">
            <div className={`processing__step ${processingStep >= 1 ? 'processing__step--active' : ''} ${processingStep > 1 ? 'processing__step--done' : ''}`}>
              <span className="processing__step-icon">
                {processingStep > 1 ? <Check size={16} /> : <Sparkles size={16} />}
              </span>
              Extracting text from PDF
            </div>
            <div className={`processing__step ${processingStep >= 2 ? 'processing__step--active' : ''} ${processingStep > 2 ? 'processing__step--done' : ''}`}>
              <span className="processing__step-icon">
                {processingStep > 2 ? <Check size={16} /> : <Sparkles size={16} />}
              </span>
              AI is simplifying questions
            </div>
            <div className={`processing__step ${processingStep >= 3 ? 'processing__step--active' : ''}`}>
              <span className="processing__step-icon">
                {processingStep >= 3 ? <Check size={16} /> : <Sparkles size={16} />}
              </span>
              Preparing your exam
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
