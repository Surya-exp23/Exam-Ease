import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveTest, getTestsByCreator, deleteTest } from '../utils/testStore';
import { extractTextFromPDF } from '../utils/pdfParser';
import { simplifyQuestions } from '../utils/geminiApi';
import gsap from 'gsap';
import {
  Brain, LogOut, Plus, Trash2, FileText, Upload,
  BookOpen, Check, X, Sparkles, GripVertical
} from 'lucide-react';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [myTests, setMyTests] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [testTitle, setTestTitle] = useState('');
  const [testSubject, setTestSubject] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState({ type: 'mcq', question: '', options: ['', '', '', ''], marks: 1 });
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const role = localStorage.getItem('examease_role');
    if (role !== 'teacher') { navigate('/login'); return; }

    refreshTests();

    gsap.to('.td__welcome', { opacity: 1, y: 0, duration: 0.6, delay: 0.2 });
    gsap.to('.td__title', { opacity: 1, y: 0, duration: 0.8, delay: 0.3 });
    gsap.to('.td__actions', { opacity: 1, y: 0, duration: 0.7, delay: 0.4 });
  }, [user, navigate]);

  const refreshTests = () => {
    if (user) setMyTests(getTestsByCreator(user.email));
  };

  const handleAddQuestion = () => {
    if (!currentQ.question.trim()) return;
    const newQ = {
      id: questions.length + 1,
      originalQuestion: currentQ.question,
      simplifiedQuestion: currentQ.question,
      type: currentQ.type,
      options: currentQ.type === 'mcq' ? currentQ.options.filter(o => o.trim()) : [],
      marks: currentQ.marks || null
    };
    setQuestions([...questions, newQ]);
    setCurrentQ({ type: 'mcq', question: '', options: ['', '', '', ''], marks: 1 });
  };

  const handleRemoveQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleSaveTest = () => {
    if (!testTitle.trim()) { setError('Please enter a test title.'); return; }
    if (questions.length === 0) { setError('Please add at least one question.'); return; }
    setError('');

    saveTest({
      title: testTitle,
      subject: testSubject,
      createdBy: user.email,
      createdByName: user.displayName || user.email.split('@')[0],
      questions: questions.map((q, i) => ({ ...q, id: i + 1 }))
    });

    // Reset form
    setTestTitle('');
    setTestSubject('');
    setQuestions([]);
    setShowCreateForm(false);
    refreshTests();

    gsap.fromTo('.td__success-toast', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4 });
    setTimeout(() => gsap.to('.td__success-toast', { opacity: 0, duration: 0.3 }), 3000);
  };

  const handleDeleteTest = (id) => {
    deleteTest(id);
    refreshTests();
  };

  const handlePdfUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }
    setError('');
    
    // Automatically open create form and set default title if empty
    setShowCreateForm(true);
    if (!testTitle) {
      setTestTitle(`AI Extracted Test - ${new Date().toLocaleDateString()}`);
    }
    
    setProcessing(true);
    
    gsap.to('.td__upload-zone', { opacity: 0, y: -20, duration: 0.3, onComplete: () => {
      gsap.to('.td__processing', { opacity: 1, y: 0, duration: 0.5 });
    }});

    try {
      setProcessingStep(1);
      const text = await extractTextFromPDF(file);
      if (!text.trim()) throw new Error('No text found in the PDF.');
      
      setProcessingStep(2);
      const aiQuestions = await simplifyQuestions(text);
      
      setProcessingStep(3);
      setQuestions(prev => [...prev, ...aiQuestions.map((q, i) => ({ ...q, id: prev.length + i + 1 }))]);
      
      setTimeout(() => {
        setProcessing(false);
        setProcessingStep(0);
        gsap.to('.td__processing', { opacity: 0, duration: 0.2 });
        gsap.to('.td__upload-zone', { opacity: 1, y: 0, duration: 0.5 });
      }, 800);
      
    } catch (err) {
      setError(err.message || 'Failed to process PDF.');
      setProcessing(false);
      setProcessingStep(0);
      gsap.to('.td__processing', { opacity: 0, duration: 0.2 });
      gsap.to('.td__upload-zone', { opacity: 1, y: 0, duration: 0.5 });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handlePdfUpload(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const handleLogout = async () => {
    localStorage.removeItem('examease_role');
    await logout();
    navigate('/');
  };

  const getInitial = () => user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'T';

  return (
    <div className="td">
      {/* Nav */}
      <nav className="td__nav">
        <div className="td__nav-logo">
          <div className="td__nav-logo-icon"><Brain size={20} /></div>
          ExamEase
          <span className="td__nav-role">Teacher</span>
        </div>
        <div className="td__nav-user">
          <div className="td__nav-avatar">{getInitial()}</div>
          <button className="td__nav-logout" onClick={handleLogout}>
            <LogOut size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Logout
          </button>
        </div>
      </nav>

      {/* Header */}
      <div className="td__header">
        <p className="td__welcome">Hello, {user?.displayName || 'Teacher'} 👋</p>
        <h1 className="td__title">
          Teacher <span className="premium-text">Dashboard</span>
        </h1>
      </div>

      {/* Actions */}
      <div className="td__actions">
        <button
          className={`btn-primary td__create-btn ${showCreateForm ? 'td__create-btn--active' : ''}`}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Create New Test</>}
        </button>
      </div>

      {error && <div className="td__error">{error}</div>}

      {/* Standalone PDF Upload Zone (when form is not open) */}
      {!showCreateForm && (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div
            className={`td__upload-zone ${dragging ? 'td__upload-zone--dragging' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="td__upload-icon">
              <Upload size={36} />
            </div>
            <h3 className="td__upload-title">
              Quick Create: Drag & drop a PDF exam here
            </h3>
            <p className="td__upload-subtitle">
              AI will automatically extract and format questions into a new test
            </p>
            <button className="btn-secondary td__pdf-btn">
              <FileText size={18} />
              Browse PDF File
            </button>
            <input
              ref={fileInputRef}
              className="td__upload-input"
              type="file"
              accept="application/pdf"
              onChange={(e) => handlePdfUpload(e.target.files?.[0])}
            />
          </div>
        </div>
      )}

      {/* Create Test Form */}
      {showCreateForm && (
        <div className="td__create-form glass-card">
          <h2 className="td__form-title">
            <BookOpen size={22} /> Create a New Test
          </h2>

          <div className="td__form-row">
            <div className="td__form-group">
              <label className="td__form-label">Test Title *</label>
              <input
                className="td__form-input"
                placeholder="e.g., Science Chapter 5 Quiz"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
              />
            </div>
            <div className="td__form-group">
              <label className="td__form-label">Subject</label>
              <input
                className="td__form-input"
                placeholder="e.g., Science, Math, English"
                value={testSubject}
                onChange={(e) => setTestSubject(e.target.value)}
              />
            </div>
          </div>

          {/* PDF Upload Zone */}
          {!processing && (
            <div
              className={`td__upload-zone ${dragging ? 'td__upload-zone--dragging' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="td__upload-icon">
                <Upload size={36} />
              </div>
              <h3 className="td__upload-title">
                Drag & drop a PDF exam here
              </h3>
              <p className="td__upload-subtitle">
                AI will automatically extract and format questions for your test
              </p>
              <button className="btn-secondary td__pdf-btn">
                <FileText size={18} />
                Browse PDF File
              </button>
              <input
                ref={fileInputRef}
                className="td__upload-input"
                type="file"
                accept="application/pdf"
                onChange={(e) => handlePdfUpload(e.target.files?.[0])}
              />
            </div>
          )}

          {processing && (
            <div className="td__processing">
              <div className="td__processing-spinner"></div>
              <h3 className="td__processing-title">AI Processing Document</h3>
              <p className="td__processing-subtitle">Extracting questions automatically...</p>
              <div className="td__processing-steps">
                <div className={`td__processing-step ${processingStep >= 1 ? 'td__processing-step--active' : ''} ${processingStep > 1 ? 'td__processing-step--done' : ''}`}>
                  <span className="td__processing-step-icon">
                    {processingStep > 1 ? <Check size={16} /> : <Sparkles size={16} />}
                  </span>
                  Extracting text from PDF
                </div>
                <div className={`td__processing-step ${processingStep >= 2 ? 'td__processing-step--active' : ''} ${processingStep > 2 ? 'td__processing-step--done' : ''}`}>
                  <span className="td__processing-step-icon">
                    {processingStep > 2 ? <Check size={16} /> : <Sparkles size={16} />}
                  </span>
                  AI is identifying and formatting questions
                </div>
                <div className={`td__processing-step ${processingStep >= 3 ? 'td__processing-step--active' : ''}`}>
                  <span className="td__processing-step-icon">
                    {processingStep >= 3 ? <Check size={16} /> : <Sparkles size={16} />}
                  </span>
                  Adding to test
                </div>
              </div>
            </div>
          )}

          <hr className="td__form-divider" />

          {/* Add Question Manually */}
          <h3 className="td__form-subtitle">Add Questions Manually</h3>

          <div className="td__add-q">
            <div className="td__add-q-type">
              <button
                className={`td__type-btn ${currentQ.type === 'mcq' ? 'td__type-btn--active' : ''}`}
                onClick={() => setCurrentQ({ ...currentQ, type: 'mcq' })}
              >
                MCQ
              </button>
              <button
                className={`td__type-btn ${currentQ.type === 'subjective' ? 'td__type-btn--active' : ''}`}
                onClick={() => setCurrentQ({ ...currentQ, type: 'subjective' })}
              >
                Written
              </button>
            </div>

            <textarea
              className="td__add-q-input"
              placeholder="Type your question here..."
              rows={3}
              value={currentQ.question}
              onChange={(e) => setCurrentQ({ ...currentQ, question: e.target.value })}
            />

            {currentQ.type === 'mcq' && (
              <div className="td__add-q-options">
                {currentQ.options.map((opt, i) => (
                  <input
                    key={i}
                    className="td__add-q-option"
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...currentQ.options];
                      newOpts[i] = e.target.value;
                      setCurrentQ({ ...currentQ, options: newOpts });
                    }}
                  />
                ))}
              </div>
            )}

            <div className="td__add-q-footer">
              <div className="td__add-q-marks">
                <label>Marks:</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={currentQ.marks}
                  onChange={(e) => setCurrentQ({ ...currentQ, marks: parseInt(e.target.value) || 1 })}
                  className="td__add-q-marks-input"
                />
              </div>
              <button className="btn-primary td__add-q-btn" onClick={handleAddQuestion}>
                <Plus size={16} /> Add Question
              </button>
            </div>
          </div>

          {/* Questions Preview */}
          {questions.length > 0 && (
            <div className="td__questions-preview">
              <h3 className="td__form-subtitle">
                Questions ({questions.length})
              </h3>
              {questions.map((q, i) => (
                <div key={i} className="td__preview-card">
                  <div className="td__preview-header">
                    <span className="td__preview-num">Q{i + 1}</span>
                    <span className={`td__preview-type td__preview-type--${q.type}`}>
                      {q.type === 'mcq' ? 'MCQ' : 'Written'}
                    </span>
                    {q.marks && <span className="td__preview-marks">{q.marks}m</span>}
                    <button className="td__preview-delete" onClick={() => handleRemoveQuestion(i)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="td__preview-text">{q.simplifiedQuestion || q.originalQuestion}</p>
                  {q.type === 'mcq' && q.options?.length > 0 && (
                    <div className="td__preview-options">
                      {q.options.map((opt, j) => (
                        <span key={j} className="td__preview-opt">{String.fromCharCode(65 + j)}. {opt}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <button className="btn-primary td__save-btn" onClick={handleSaveTest}>
            <Check size={18} /> Save Test ({questions.length} questions)
          </button>
        </div>
      )}

      {/* My Tests */}
      <div className="td__my-tests">
        <h2 className="td__section-title">
          <FileText size={20} /> My Tests
        </h2>
        {myTests.length === 0 ? (
          <div className="td__empty">
            <p>You haven't created any tests yet.</p>
            <p className="td__empty-hint">Click "Create New Test" to get started!</p>
          </div>
        ) : (
          <div className="td__tests-grid">
            {myTests.map(test => (
              <div key={test.id} className="td__test-card glass-card">
                <div className="td__test-card-header">
                  <h3 className="td__test-card-title">{test.title}</h3>
                  <button className="td__test-card-delete" onClick={() => handleDeleteTest(test.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
                {test.subject && (
                  <span className="td__test-card-subject">{test.subject}</span>
                )}
                <div className="td__test-card-meta">
                  <span>{test.questions.length} questions</span>
                  <span>•</span>
                  <span>{new Date(test.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Success Toast */}
      <div className="td__success-toast" style={{ opacity: 0 }}>
        <Check size={16} /> Test saved successfully!
      </div>
    </div>
  );
};

export default TeacherDashboard;
