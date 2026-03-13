import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { LogOut } from 'lucide-react';
import './CompletionPage.css';

const TOTAL_SECONDS = 5 * 60; // 5 minutes

const CompletionPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Entrance animations
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.completion__card', { opacity: 1, scale: 1, duration: 0.8, delay: 0.2 })
      .to('.completion__emoji', { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' }, '-=0.3')
      .to('.completion__title', { opacity: 1, y: 0, duration: 0.6 }, '-=0.2')
      .to('.completion__message', { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
      .to('.completion__motivation', { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
      .to('.completion__timer-section', { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
      .to('.completion__logout', { opacity: 1, y: 0, duration: 0.6 }, '-=0.3');

    // Create confetti
    createConfetti();

    // Timer countdown
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          handleExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const createConfetti = () => {
    const container = document.querySelector('.confetti-container');
    if (!container) return;
    
    const colors = ['#6C5CE7', '#A29BFE', '#00CEC9', '#55EFC4', '#FD79A8', '#FDCB6E', '#FF6B6B', '#48DBFB'];
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      const isCircle = Math.random() > 0.5;
      confetti.className = `confetti ${isCircle ? 'confetti--circle' : 'confetti--rect'}`;
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.width = (Math.random() * 8 + 6) + 'px';
      confetti.style.height = isCircle ? confetti.style.width : (Math.random() * 12 + 6) + 'px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animation = `confetti-fall ${Math.random() * 3 + 2}s ease-in forwards`;
      confetti.style.animationDelay = Math.random() * 2 + 's';
      container.appendChild(confetti);
    }
  };

  const handleExpire = async () => {
    gsap.to('.completion__card', {
      opacity: 0,
      y: -30,
      duration: 0.6,
      onComplete: async () => {
        await logout();
        navigate('/');
      }
    });
  };

  const handleLogout = async () => {
    clearInterval(intervalRef.current);
    await logout();
    navigate('/');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progress = (timeLeft / TOTAL_SECONDS) * 100;
  const isWarning = timeLeft < 60;

  return (
    <div className="completion">
      <div className="confetti-container"></div>
      <div className="completion__bg-orb completion__bg-orb--1"></div>
      <div className="completion__bg-orb completion__bg-orb--2"></div>

      <div className="completion__card">
        <div className="completion__emoji">🎉</div>
        <h1 className="completion__title">
          <span className="premium-text">You Did It!</span>
        </h1>
        <p className="completion__message">
          You have successfully completed your exam paper. 
          We're proud of your effort and determination!
        </p>
        <p className="completion__motivation">
          ✨ Good luck for your upcoming papers — you've got this! ✨
        </p>

        <div className="completion__timer-section">
          <p className="completion__timer-label">Session expires in</p>
          <p className={`completion__timer ${isWarning ? 'completion__timer--warning' : 'completion__timer--normal'}`}>
            {formatTime(timeLeft)}
          </p>
          <div className="completion__timer-bar">
            <div
              className="completion__timer-bar-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <button className="btn-primary completion__logout" onClick={handleLogout}>
          <LogOut size={18} /> Exit Session
        </button>
      </div>
    </div>
  );
};

export default CompletionPage;
