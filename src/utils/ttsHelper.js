/**
 * Text-to-Speech helper using Web Speech API
 */

let currentUtterance = null;

/**
 * Speak the given text aloud
 * @param {string} text - Text to speak
 * @param {object} options - Speech options
 * @param {number} options.rate - Speech rate (0.5-2)
 * @param {number} options.pitch - Speech pitch (0-2) 
 * @param {string} options.lang - Language code (e.g., 'en-US')
 * @param {function} options.onEnd - Callback when speech finishes
 */
export function speak(text, options = {}) {
  stop(); // Stop any current speech
  
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-Speech not supported in this browser');
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate || 0.85; // Slightly slow for accessibility
  utterance.pitch = options.pitch || 1;
  utterance.lang = options.lang || 'en-US';
  
  if (options.onEnd) {
    utterance.onend = options.onEnd;
  }

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

/**
 * Stop current speech
 */
export function stop() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}

/**
 * Pause current speech
 */
export function pause() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.pause();
  }
}

/**
 * Resume paused speech
 */
export function resume() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.resume();
  }
}

/**
 * Check if TTS is currently speaking
 */
export function isSpeaking() {
  return 'speechSynthesis' in window && window.speechSynthesis.speaking;
}

/**
 * Get available voices
 */
export function getVoices() {
  if (!('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices();
}
