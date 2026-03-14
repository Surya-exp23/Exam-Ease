import { useState, useRef, useEffect } from 'react';
import { speak, stop } from '../utils/ttsHelper';
import { Volume2, VolumeX, Mic, MicOff, Wand2 } from 'lucide-react';
import { simplifyFurther } from '../utils/geminiApi';

const QuestionCard = ({ question, index, answer, onAnswer, isActive, onTranslate, translatedText }) => {
  const [speakingTarget, setSpeakingTarget] = useState(null); // 'question', 0, 1, 2...
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const [deepSimplifiedText, setDeepSimplifiedText] = useState('');
  const [isSimplifying, setIsSimplifying] = useState(false);
  const recognitionRef = useRef(null);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      
      if (finalTranscript) {
        const currentAnswer = answer || '';
        const safeFinal = finalTranscript.trim();
        const newAnswer = currentAnswer ? `${currentAnswer} ${safeFinal}` : safeFinal;
        onAnswer(question.id, newAnswer);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSimplifyFurther = async () => {
    if (deepSimplifiedText) return; // already simplified
    setIsSimplifying(true);
    try {
      const text = await simplifyFurther(question.simplifiedQuestion || question.originalQuestion);
      setDeepSimplifiedText(text);
    } catch (err) {
      console.error(err);
      alert("Failed to simplify question. Please try again.");
    } finally {
      setIsSimplifying(false);
    }
  };

  const handleSpeak = (target, text) => {
    if (speakingTarget === target) {
      stop();
      setSpeakingTarget(null);
      setActiveWordIndex(-1);
    } else {
      stop(); // stop previous speech
      
      // We need to count words prior to the character index to know which word is spoken
      const getWordIndexFromCharIndex = (charIndex, fullText) => {
        const textUpToChar = fullText.substring(0, charIndex);
        // split by the same regex we use to render words
        const parts = textUpToChar.split(/(\b[a-zA-Z]+\b)/);
        // Filter out non-word parts (like spaces/punctuation) to align with our rendered word chunks
        const wordParts = parts.filter(p => /^[a-zA-Z]+$/.test(p));
        return wordParts.length;
      };

      speak(text, {
        onEnd: () => {
          setSpeakingTarget(null);
          setActiveWordIndex(-1);
        },
        onBoundary: (event) => {
          if (event.name === 'word') {
            const wordIdx = getWordIndexFromCharIndex(event.charIndex, text);
            setActiveWordIndex(wordIdx);
          }
        }
      });
      setSpeakingTarget(target);
      setActiveWordIndex(0);
    }
  };

  const displayQuestion = translatedText || question.simplifiedQuestion;

  const renderHighlightedText = (text, isTargetActive) => {
    if (!text) return null;
    const stopWords = ['what', 'when', 'where', 'which', 'who', 'why', 'how', 'is', 'are', 'was', 'were', 'am', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now', 'that', 'this', 'these', 'those'];
    
    // Split by words but keep the punctuation intact
    const parts = text.split(/(\b[a-zA-Z]+\b)/);
    
    let wordCounter = 0;
    
    return parts.map((part, i) => {
      const isWord = /^[a-zA-Z]+$/.test(part);
      const isCurrentDictatedWord = isTargetActive && activeWordIndex === wordCounter;
      
      if (isWord) {
        wordCounter++;
        
        let style = {};
        // 1. Static highlight feature for long non-stopwords
        if (part.length > 4 && !stopWords.includes(part.toLowerCase())) {
          style = { color: 'var(--primary)', fontWeight: '800' };
        }
        
        // 2. Dynamic Karaoke Dictation Highlight
        if (isCurrentDictatedWord) {
          style = {
            ...style,
            backgroundColor: 'var(--primary-light)',
            color: '#fff',
            padding: '0 4px',
            borderRadius: '4px',
            borderBottom: '4px solid var(--primary-dark)',
            transition: 'all 0.15s ease-in-out',
            transform: 'scale(1.05)',
            display: 'inline-block'
          };
        }

        return <span key={i} style={style}>{part}</span>;
      }
      return part;
    });
  };

  // Stop talking when unmounting or switching focus
  if (!isActive && speakingTarget !== null) {
    stop();
    setSpeakingTarget(null);
    setActiveWordIndex(-1);
  }

  return (
    <div className={`question-card ${isActive ? 'question-card--active' : ''}`}>
      <div className="question-card__header">
        <span className="question-card__number">Q{index + 1}</span>
        <div className="question-card__meta">
          <span className={`question-card__type question-card__type--${question.type}`}>
            {question.type === 'mcq' ? 'Multiple Choice' : 'Written Answer'}
          </span>
          {question.marks && (
            <span className="question-card__marks">{question.marks} marks</span>
          )}
        </div>
      </div>

      <div className="question-card__body">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <button
            className={`question-card__speak-btn ${speakingTarget === 'question' ? 'active' : ''}`}
            onClick={() => handleSpeak('question', displayQuestion)}
            title="Read Question"
            style={{ marginTop: '2px', padding: '6px', borderRadius: '50%', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', color: speakingTarget === 'question' ? 'var(--primary)' : 'inherit' }}
          >
            {speakingTarget === 'question' ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <p className="question-card__question" style={{ margin: 0, lineHeight: '1.6' }}>
            {renderHighlightedText(displayQuestion, speakingTarget === 'question')}
          </p>
        </div>

        {question.originalQuestion !== question.simplifiedQuestion && (
          <details className="question-card__original" style={{ marginTop: '16px' }}>
            <summary>View original question</summary>
            <p>{question.originalQuestion}</p>
          </details>
        )}

        <div style={{ marginTop: '16px', background: 'var(--bg-glass)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          {!deepSimplifiedText ? (
            <button 
              onClick={handleSimplifyFurther}
              disabled={isSimplifying}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: isSimplifying ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
            >
              <Wand2 size={16} /> 
              {isSimplifying ? 'Simplifying...' : 'Simplify Question'}
            </button>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '8px' }}>
                <Wand2 size={16} /> Simplified Explanation:
              </div>
              <p style={{ margin: 0, lineHeight: '1.6', fontSize: '0.95em' }}>{deepSimplifiedText}</p>
            </div>
          )}
        </div>

        {question.type === 'mcq' && question.options?.length > 0 ? (
          <div className="question-card__options" style={{ marginTop: '20px' }}>
            {question.options.map((option, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                <button
                  onClick={() => handleSpeak(i, option)}
                  title="Read Option"
                  style={{ padding: '6px', borderRadius: '50%', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', color: speakingTarget === i ? 'var(--primary)' : 'inherit' }}
                >
                  {speakingTarget === i ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <label
                  className={`question-card__option ${answer === option ? 'question-card__option--selected' : ''}`}
                  style={{ flex: 1, margin: 0 }}
                >
                  <input
                    type="radio"
                    name={`q-${question.id}`}
                    value={option}
                    checked={answer === option}
                    onChange={() => onAnswer(question.id, option)}
                  />
                  <span className="question-card__option-radio"></span>
                  <span className="question-card__option-text" style={{ lineHeight: '1.6' }}>
                    {renderHighlightedText(option, speakingTarget === i)}
                  </span>
                </label>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ position: 'relative', marginTop: '20px' }}>
            <textarea
              className="question-card__textarea"
              placeholder="Type your answer here or use the microphone..."
              value={answer || ''}
              onChange={(e) => onAnswer(question.id, e.target.value)}
              rows={4}
              style={{ width: '100%', minHeight: '120px', paddingBottom: '40px', boxSizing: 'border-box' }}
            />
            <button
              onClick={toggleListening}
              title={isListening ? "Stop Listening" : "Start Listening"}
              style={{
                position: 'absolute',
                right: '12px',
                bottom: '12px',
                padding: '8px',
                borderRadius: '50%',
                background: isListening ? '#ef4444' : 'var(--bg-glass, rgba(255, 255, 255, 0.1))',
                color: isListening ? '#fff' : 'inherit',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.2))',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                zIndex: 10
              }}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
