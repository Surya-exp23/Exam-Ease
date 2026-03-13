import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Brain, Volume2, Languages, ZoomIn, Shield, ArrowRight, Sparkles, GraduationCap, BookOpen } from 'lucide-react';
import './LandingPage.css';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const howRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animations
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .to('.hero__badge', { opacity: 1, y: 0, duration: 0.8, delay: 0.3 })
        .to('.hero__title', { opacity: 1, y: 0, duration: 1 }, '-=0.4')
        .to('.hero__subtitle', { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
        .to('.hero__buttons', { opacity: 1, y: 0, duration: 0.8 }, '-=0.4')
        .to('.hero__scroll-indicator', { opacity: 1, duration: 0.6 }, '-=0.2');

      // Floating orbs animation
      gsap.to('.hero__orb--1', { x: 30, y: -20, duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.hero__orb--2', { x: -20, y: 30, duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.hero__orb--3', { x: 20, y: -30, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' });

      // Features section
      gsap.to('.features__label', { 
        opacity: 1, y: 0, duration: 0.6,
        scrollTrigger: { trigger: '.features__header', start: 'top 80%' }
      });
      gsap.to('.features__title', { 
        opacity: 1, y: 0, duration: 0.8,
        scrollTrigger: { trigger: '.features__header', start: 'top 80%' }
      });
      gsap.to('.features__subtitle', {
        opacity: 1, y: 0, duration: 0.8, delay: 0.2,
        scrollTrigger: { trigger: '.features__header', start: 'top 80%' }
      });
      
      gsap.utils.toArray('.feature-card').forEach((card, i) => {
        gsap.to(card, {
          opacity: 1, y: 0, duration: 0.7, delay: i * 0.15,
          scrollTrigger: { trigger: card, start: 'top 85%' }
        });
      });

      // Roles section
      gsap.utils.toArray('.role-card').forEach((card, i) => {
        gsap.to(card, {
          opacity: 1, y: 0, duration: 0.8, delay: i * 0.2,
          scrollTrigger: { trigger: card, start: 'top 85%' }
        });
      });

      // How It Works
      gsap.to('.how-it-works__label', {
        opacity: 1, y: 0, duration: 0.6,
        scrollTrigger: { trigger: '.how-it-works__header', start: 'top 80%' }
      });
      gsap.to('.how-it-works__title', {
        opacity: 1, y: 0, duration: 0.8,
        scrollTrigger: { trigger: '.how-it-works__header', start: 'top 80%' }
      });

      gsap.utils.toArray('.step').forEach((step, i) => {
        gsap.to(step, {
          opacity: 1, x: 0, duration: 0.8, delay: i * 0.2,
          scrollTrigger: { trigger: step, start: 'top 85%' }
        });
      });

      // Stats counter animation
      gsap.utils.toArray('.stat').forEach((stat, i) => {
        gsap.to(stat, {
          opacity: 1, y: 0, duration: 0.6, delay: i * 0.15,
          scrollTrigger: { trigger: stat, start: 'top 90%' }
        });
      });

      // CTA
      gsap.to('.cta__title', {
        opacity: 1, y: 0, duration: 0.8,
        scrollTrigger: { trigger: '.cta__content', start: 'top 80%' }
      });
      gsap.to('.cta__subtitle', {
        opacity: 1, y: 0, duration: 0.8, delay: 0.2,
        scrollTrigger: { trigger: '.cta__content', start: 'top 80%' }
      });
      gsap.to('.cta__button', {
        opacity: 1, y: 0, duration: 0.8, delay: 0.4,
        scrollTrigger: { trigger: '.cta__content', start: 'top 80%' }
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar__logo">
          <div className="navbar__logo-icon">
            <Brain size={20} />
          </div>
          ExamEase
        </div>
        <div className="navbar__actions">
          <button className="btn-primary navbar__cta" onClick={() => navigate('/login')}>
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" ref={heroRef}>
        <div className="hero__bg-orbs">
          <div className="hero__orb hero__orb--1"></div>
          <div className="hero__orb hero__orb--2"></div>
          <div className="hero__orb hero__orb--3"></div>
        </div>
        <div className="hero__content">
          <div className="hero__badge">
            <span className="hero__badge-dot"></span>
            AI-Powered Exam Assistance
          </div>
          <h1 className="hero__title">
            Exams Made <span className="premium-text">Simple</span> for Every Learner
          </h1>
          <p className="hero__subtitle">
            ExamEase uses artificial intelligence to simplify exam questions, 
            read them aloud, and create a focused, accessible environment — 
            empowering dyslexic students to show their true potential.
          </p>
          <div className="hero__buttons">
            <button className="btn-primary" onClick={() => navigate('/login')}>
              Start Your Exam <ArrowRight size={18} />
            </button>
            <button className="btn-secondary" onClick={() => {
              document.querySelector('.features').scrollIntoView({ behavior: 'smooth' });
            }}>
              <Sparkles size={18} />
              See Features
            </button>
          </div>
        </div>
        <div className="hero__scroll-indicator">
          <span>Scroll to explore</span>
          <div className="hero__scroll-line"></div>
        </div>
      </section>

      {/* Features */}
      <section className="features" ref={featuresRef}>
        <div className="features__header">
          <p className="features__label">Why ExamEase?</p>
          <h2 className="features__title">
            Built with <span className="premium-text">Accessibility</span> First
          </h2>
          <p className="features__subtitle">
            Every feature is designed to reduce cognitive load and make exams fair for everyone.
          </p>
        </div>
        <div className="features__grid">
          <div className="feature-card">
            <div className="feature-card__icon feature-card__icon--purple">
              <Brain size={28} />
            </div>
            <h3 className="feature-card__title">AI Question Simplification</h3>
            <p className="feature-card__desc">
              Complex questions are automatically rewritten into clear, simple language 
              that's easier to understand — without changing the meaning.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon feature-card__icon--teal">
              <Volume2 size={28} />
            </div>
            <h3 className="feature-card__title">Text-to-Speech</h3>
            <p className="feature-card__desc">
              Every question can be read aloud at a comfortable pace. 
              Listening while reading helps improve comprehension.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon feature-card__icon--pink">
              <Languages size={28} />
            </div>
            <h3 className="feature-card__title">Multi-Language Support</h3>
            <p className="feature-card__desc">
              Translate questions into your native language for better understanding. 
              Supports 15+ languages including Hindi, Spanish, and French.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-card__icon feature-card__icon--yellow">
              <ZoomIn size={28} />
            </div>
            <h3 className="feature-card__title">Customizable Display</h3>
            <p className="feature-card__desc">
              Enlarge text, switch to dyslexia-friendly fonts, enable dark mode, 
              or use focus mode — customize your exam experience.
            </p>
          </div>
        </div>
      </section>

      {/* For Teachers & Students */}
      <section className="roles">
        <div className="roles__header">
          <p className="roles__label">Built for Everyone</p>
          <h2 className="roles__title">
            For <span className="premium-text">Teachers</span> & <span className="premium-text">Students</span>
          </h2>
        </div>
        <div className="roles__grid">
          <div className="role-card glass-card">
            <div className="role-card__icon role-card__icon--student">
              <GraduationCap size={36} />
            </div>
            <h3 className="role-card__title">For Students</h3>
            <ul className="role-card__list">
              <li>Take tests created by your teachers</li>
              <li>Upload your own exam PDF for AI simplification</li>
              <li>Use text-to-speech, translation, focus mode & more</li>
              <li>Dyslexia-friendly fonts and adjustable text size</li>
            </ul>
            <button className="btn-primary role-card__btn" onClick={() => navigate('/login')}>
              I'm a Student <ArrowRight size={16} />
            </button>
          </div>
          <div className="role-card glass-card">
            <div className="role-card__icon role-card__icon--teacher">
              <BookOpen size={36} />
            </div>
            <h3 className="role-card__title">For Teachers</h3>
            <ul className="role-card__list">
              <li>Create accessible tests for dyslexic students</li>
              <li>Add MCQ and written questions with ease</li>
              <li>Upload PDF to auto-generate simplified tests</li>
              <li>Tests are instantly available for students</li>
            </ul>
            <button className="btn-secondary role-card__btn" onClick={() => navigate('/login')}>
              I'm a Teacher <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" ref={howRef}>
        <div className="how-it-works__header">
          <p className="how-it-works__label">How It Works</p>
          <h2 className="how-it-works__title">
            Three Simple Steps
          </h2>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step__number">1</div>
            <div className="step__content">
              <h3>Upload Your Exam</h3>
              <p>Drag and drop your exam PDF or choose a test created by your teacher. Our system handles everything automatically.</p>
            </div>
          </div>
          <div className="step">
            <div className="step__number">2</div>
            <div className="step__content">
              <h3>AI Simplifies Questions</h3>
              <p>Google Gemini AI rewrites each question in clear, simple language — identifying MCQs and written questions.</p>
            </div>
          </div>
          <div className="step">
            <div className="step__number">3</div>
            <div className="step__content">
              <h3>Take Your Exam Comfortably</h3>
              <p>Use text-to-speech, translation, focus mode, and more to complete your exam at your own pace.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats" ref={statsRef}>
        <div className="stats__grid">
          <div className="stat">
            <div className="stat__number">15-20%</div>
            <div className="stat__label">Of people are dyslexic</div>
          </div>
          <div className="stat">
            <div className="stat__number">15+</div>
            <div className="stat__label">Languages supported</div>
          </div>
          <div className="stat">
            <div className="stat__number">100%</div>
            <div className="stat__label">Free to use</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta" ref={ctaRef}>
        <div className="cta__content">
          <h2 className="cta__title">
            Ready to Ace Your <span className="premium-text">Next Exam</span>?
          </h2>
          <p className="cta__subtitle">
            Join ExamEase and experience a fairer, more accessible way to take exams.
          </p>
          <div className="cta__button">
            <button className="btn-primary" onClick={() => navigate('/login')}>
              Get Started — It's Free <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p className="footer__text">
          Built with <span className="footer__heart">♥</span> for accessibility | ExamEase © 2026
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
