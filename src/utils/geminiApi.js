const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_API_KEY = 'AIzaSyCYK2fk-MPCq99pWLnx09Hfjapedb7QFac';

/**
 * Send text to the local Python backend and get simplified questions
 * @param {string} examText - Raw text from PDF
 * @returns {Promise<Array>} - Array of simplified questions
 */
export async function simplifyQuestions(examText) {
  try {
    const response = await fetch('http://localhost:5000/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: examText })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to call local Python backend');
    }

    const data = await response.json();
    if (data.questions && Array.isArray(data.questions)) {
      return data.questions.map((q, index) => ({
        id: index + 1,
        originalQuestion: q.originalQuestion || '',
        simplifiedQuestion: q.simplifiedQuestion || '',
        type: q.type || 'subjective',
        options: q.options || [],
        marks: q.marks || null
      }));
    } else {
      throw new Error('Invalid response structure from backend');
    }
  } catch (error) {
    console.error('Error falling back to local Python API:', error);
    throw new Error('Failed to parse AI response. Is the Python backend running on port 5000? ' + error.message);
  }
}

/**
 * Translate text using Gemini API for better quality translations
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g., 'hi', 'es', 'fr')
 * @returns {Promise<string>} - Translated text
 */
export async function translateText(text, targetLang) {
  const langNames = {
    hi: 'Hindi', es: 'Spanish', fr: 'French', de: 'German',
    ta: 'Tamil', te: 'Telugu', bn: 'Bengali', mr: 'Marathi',
    gu: 'Gujarati', kn: 'Kannada', ml: 'Malayalam', pa: 'Punjabi',
    ur: 'Urdu', ar: 'Arabic', zh: 'Chinese', ja: 'Japanese',
    ko: 'Korean', pt: 'Portuguese', ru: 'Russian'
  };
  
  const langName = langNames[targetLang] || targetLang;
  
  const prompt = `Translate the following text to ${langName}. Return ONLY the translated text, nothing else:\n\n${text}`;
  
  try {
    const response = await fetch(`${GEMINI_API_BASE}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 2048 }
      })
    });
    
    if (!response.ok) throw new Error('Translation API failed');
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;
  } catch {
    // Fallback to MyMemory
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
    );
    const d = await res.json();
    return d.responseData?.translatedText || text;
  }
}
