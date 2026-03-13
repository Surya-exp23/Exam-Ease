import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { Brain, ArrowLeft, GraduationCap, BookOpen } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
  const [role, setRole] = useState(''); // 'student' or 'teacher'
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { loginWithGoogle, loginWithEmail, signupWithEmail, user } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef(null);

  useEffect(() => {
    if (user && role) {
      localStorage.setItem('examease_role', role);
      navigate(role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
    }
  }, [user, role, navigate]);

  useEffect(() => {
    gsap.to('.login__card', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.2
    });
    gsap.to('.login__role-card', {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power3.out',
      delay: 0.4
    });
  }, []);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    localStorage.setItem('examease_role', selectedRole);
    gsap.to('.login__roles', {
      opacity: 0, y: -20, duration: 0.3, onComplete: () => {
        gsap.to('.login__form-section', { opacity: 1, y: 0, duration: 0.5 });
      }
    });
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        await signupWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
      navigate(role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate(role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="login">
      <div className="login__bg-orb login__bg-orb--1"></div>
      <div className="login__bg-orb login__bg-orb--2"></div>

      <button className="login__back" onClick={() => role ? setRole('') : navigate('/')}>
        <ArrowLeft size={18} />
        {role ? 'Change Role' : 'Back'}
      </button>

      <div className="login__card" ref={cardRef}>
        <div className="login__logo">
          <div className="login__logo-icon">
            <Brain size={24} />
          </div>
          <span className="login__logo-text">ExamEase</span>
        </div>

        {/* Role Selection */}
        {!role && (
          <div className="login__roles">
            <p className="login__tagline">I am a...</p>
            <div className="login__role-grid">
              <button className="login__role-card" onClick={() => handleRoleSelect('student')}>
                <div className="login__role-icon login__role-icon--student">
                  <GraduationCap size={32} />
                </div>
                <h3 className="login__role-title">Student</h3>
                <p className="login__role-desc">Take simplified exams with accessibility tools</p>
              </button>
              <button className="login__role-card" onClick={() => handleRoleSelect('teacher')}>
                <div className="login__role-icon login__role-icon--teacher">
                  <BookOpen size={32} />
                </div>
                <h3 className="login__role-title">Teacher</h3>
                <p className="login__role-desc">Create accessible tests for your students</p>
              </button>
            </div>
          </div>
        )}

        {/* Login Form */}
        {role && (
          <div className="login__form-section">
            <p className="login__tagline">
              {isSignup ? 'Create your account' : 'Welcome back'} 
              <span className="login__role-badge">
                {role === 'teacher' ? '👨‍🏫 Teacher' : '🎓 Student'}
              </span>
            </p>

            {error && <div className="login__error">{error}</div>}

            <button className="login__google" onClick={handleGoogleLogin} disabled={loading}>
              <svg className="login__google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="login__divider">or</div>

            <form className="login__form" onSubmit={handleEmailSubmit}>
              {isSignup && (
                <div className="login__input-group">
                  <label className="login__label">Full Name</label>
                  <input
                    className="login__input"
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isSignup}
                  />
                </div>
              )}
              <div className="login__input-group">
                <label className="login__label">Email</label>
                <input
                  className="login__input"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="login__input-group">
                <label className="login__label">Password</label>
                <input
                  className="login__input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button className="btn-primary login__submit" type="submit" disabled={loading}>
                {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="login__toggle">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button className="login__toggle-link" onClick={() => { setIsSignup(!isSignup); setError(''); }}>
                {isSignup ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
