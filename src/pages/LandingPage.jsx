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

      // Floating mock phones animation
      gsap.to('.hero__mock-phone--back', { y: -15, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('.hero__mock-phone--front', { y: 15, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1 });

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
        <div className="hero__content">
          <div className="hero__badge">
            <span className="hero__badge-dot"></span>
            AI-POWERED EXAM ASSISTANCE !
          </div>
          <h1 className="hero__title">
            Best <span className="premium-text">accessible</span><br/> testing platform<br/> for every student.
          </h1>
          <div className="hero__social-proof">
            <div className="hero__avatars">
              <div className="avatar avatar--1"></div>
              <div className="avatar avatar--2"></div>
              <div className="avatar avatar--3"></div>
            </div>
            <div className="hero__proof-text">
              <strong>168K+</strong>
              <span>Students Helped</span>
            </div>
          </div>
          <p className="hero__subtitle">
            ExamEase leverages advanced local AI to instantly translate complex exam papers into clear, dyslexia-friendly formats. Assess knowledge, not reading ability.
          </p>
          <div className="hero__buttons">
            <button className="btn-primary" onClick={() => navigate('/login')}>
               <ArrowRight size={18} />
            </button>
            <span className="hero__button-label">Explore the platform features and get started today.</span>
          </div>
        </div>
        
        <div className="hero__graphics">
          <div className="hero__background-text">EXAM</div>
          <div className="hero__mock-phone hero__mock-phone--back">
             <div className="mock-card"><Sparkles size={20}/> <span>Translating</span></div>
             <div className="mock-card"><Volume2 size={20}/> <span>Dictation Active</span></div>
          </div>
          <div className="hero__mock-phone hero__mock-phone--front">
             <div className="mock-card mock-card--primary"><Brain size={20}/> <span>AI Simplify</span></div>
             <div className="mock-chart"></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features" ref={featuresRef}>
        <div className="features__header-split">
          <h2 className="features__title">
            Your <span className="premium-text">trusted</span> partner for<br/> accessible testing.
          </h2>
          <p className="features__subtitle">
            ExamEase unites and secures a growing ecosystem of specialized tools designed specifically to help neurodivergent students succeed.
          </p>
        </div>
        
        <div className="features__grid-staggered">
          <div className="feature-card feature-card--side">
            <span className="feature-card__number">01.</span>
            <h3 className="feature-card__title">Intelligent Simplification</h3>
            <p className="feature-card__desc">
              Transform verbose, convoluted questions into clear language instantly without changing the core academic meaning.
            </p>
          </div>
          
          <div className="feature-card feature-card--center">
            <span className="feature-card__number">02.</span>
            <h3 className="feature-card__title">Immersive Dictation</h3>
            <p className="feature-card__desc">
              Experience exams dynamically. Every question and option can be dictated aloud at adjustable speeds to supplement reading.
            </p>
            <button className="feature-card__btn" onClick={() => navigate('/login')}>Learn More <ArrowRight size={14}/></button>
          </div>
          
          <div className="feature-card feature-card--side feature-card--right">
            <span className="feature-card__number">03.</span>
            <h3 className="feature-card__title">Tailored Visual Engine</h3>
            <p className="feature-card__desc">
              Take full control. Toggle Dyslexia anti-flip fonts, engage high-contrast mode, or isolate questions using cinematic Focus Mode.
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
              <li>Answer questions hands-free with Voice-to-Text</li>
              <li>Use text-to-speech, translation, focus mode & more</li>
              <li>Dyslexia-friendly fonts and adjustable text size</li>
            </ul>
            <button className="btn-primary role-card__btn" onClick={() => navigate('/login?role=student')}>
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
            <button className="btn-secondary role-card__btn" onClick={() => navigate('/login?role=teacher')}>
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
              <h3>Upload & <span className="premium-text">Analyze</span></h3>
              <p>Teachers or students upload standard PDF exam papers. Our system securely extracts the raw text while preserving the fundamental structure of the document.</p>
            </div>
          </div>
          <div className="step">
            <div className="step__number">2</div>
            <div className="step__content">
              <h3>AI <span className="premium-text">Processing Engine</span></h3>
              <p>Our localized Machine Learning models logically restructure complex paragraphs into digestible sentences, randomly extracting MCQs and Subjective prompts dynamically.</p>
            </div>
          </div>
          <div className="step">
            <div className="step__number">3</div>
            <div className="step__content">
              <h3>Accessible <span className="premium-text">Execution</span></h3>
              <p>The student enters a heavily customized, full-screen lockdown environment complete with dyslexia-optimized fonts, focus mode, and auditory translation tools.</p>
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
