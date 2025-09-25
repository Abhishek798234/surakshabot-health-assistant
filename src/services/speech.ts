import { translationService } from './translation';

// Speech Recognition Service
export class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private isListening = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
    
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.updateLanguage();
    }
  }

  // Update speech recognition language
  updateLanguage(): void {
    if (this.recognition) {
      const currentLang = translationService.getCurrentLanguage();
      this.recognition.lang = currentLang.speechCode;
    }
  }

  // Check if speech recognition is supported
  isSpeechRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  // Start listening for speech
  startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      // Update language before starting
      this.updateLanguage();
      this.isListening = true;

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.isListening = false;
        resolve(transcript);
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
    });
  }

  // Stop listening
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Check if currently listening
  getIsListening(): boolean {
    return this.isListening;
  }

  // Text to Speech with language support
  speak(text: string, options?: { rate?: number; pitch?: number; volume?: number }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Stop any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set voice options
      utterance.rate = options?.rate || 0.9;
      utterance.pitch = options?.pitch || 1;
      utterance.volume = options?.volume || 0.8;

      // Get current language
      const currentLang = translationService.getCurrentLanguage();
      utterance.lang = currentLang.speechCode;

      // Try to find a voice for the current language
      const voices = this.synthesis.getVoices();
      const langVoice = voices.find(voice => 
        voice.lang.startsWith(currentLang.code) || 
        voice.lang === currentLang.speechCode
      );
      
      if (langVoice) {
        utterance.voice = langVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      this.synthesis.speak(utterance);
    });
  }

  // Stop speaking
  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // Check if currently speaking
  isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }
}

// Create singleton instance
export const speechService = new SpeechService();