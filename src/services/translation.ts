// Language detection and translation service
export interface Language {
  code: string;
  name: string;
  flag: string;
  speechCode: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', speechCode: 'en-US' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳', speechCode: 'hi-IN' },
  { code: 'or', name: 'ଓଡ଼ିଆ', flag: '🇮🇳', speechCode: 'or-IN' },
  { code: 'es', name: 'Español', flag: '🇪🇸', speechCode: 'es-ES' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', speechCode: 'fr-FR' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', speechCode: 'de-DE' },
  { code: 'zh', name: '中文', flag: '🇨🇳', speechCode: 'zh-CN' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', speechCode: 'ja-JP' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', speechCode: 'ar-SA' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', speechCode: 'pt-BR' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', speechCode: 'ru-RU' }
];

class TranslationService {
  private currentLanguage: Language = SUPPORTED_LANGUAGES[0]; // Default to English

  // Detect language from text (simple heuristic)
  detectLanguage(text: string): Language {
    const hindiPattern = /[\u0900-\u097F]/;
    const odiaPattern = /[\u0B00-\u0B7F]/;
    const chinesePattern = /[\u4e00-\u9fff]/;
    const arabicPattern = /[\u0600-\u06FF]/;
    const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF]/;
    const russianPattern = /[\u0400-\u04FF]/;

    if (hindiPattern.test(text)) return SUPPORTED_LANGUAGES.find(l => l.code === 'hi')!;
    if (odiaPattern.test(text)) return SUPPORTED_LANGUAGES.find(l => l.code === 'or')!;
    if (chinesePattern.test(text)) return SUPPORTED_LANGUAGES.find(l => l.code === 'zh')!;
    if (arabicPattern.test(text)) return SUPPORTED_LANGUAGES.find(l => l.code === 'ar')!;
    if (japanesePattern.test(text)) return SUPPORTED_LANGUAGES.find(l => l.code === 'ja')!;
    if (russianPattern.test(text)) return SUPPORTED_LANGUAGES.find(l => l.code === 'ru')!;

    return SUPPORTED_LANGUAGES[0]; // Default to English
  }

  // Translate text using Google Translate API (free tier)
  async translateText(text: string, targetLang: string, sourceLang: string = 'auto'): Promise<string> {
    try {
      // Using a free translation API
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`);
      const data = await response.json();
      
      if (data.responseStatus === 200) {
        return data.responseData.translatedText;
      }
      
      // Fallback: return original text if translation fails
      return text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }

  // Get health-related prompts in different languages
  getHealthPrompts(langCode: string): { [key: string]: string } {
    const prompts: { [lang: string]: { [key: string]: string } } = {
      en: {
        welcome: "Hello! I'm Surakshabot, your AI health assistant. How can I help you with your health concerns today?",
        askDetails: "To provide personalized care, please share: 'My name is [Your Name] and my phone number is [Your Phone Number]'",
        listening: "Listening... Speak now",
        speechSuccess: "Speech recognized successfully!",
        speechError: "Could not recognize speech. Please try again.",
        hospitals: "Nearby Hospitals",
        appointments: "Appointment Alerts", 
        vaccinations: "Vaccination Alerts"
      },
      hi: {
        welcome: "नमस्ते! मैं सुरक्षाबॉट हूं, आपका AI स्वास्थ्य सहायक। आज मैं आपकी स्वास्थ्य संबंधी चिंताओं में कैसे मदद कर सकता हूं?",
        askDetails: "व्यक्तिगत देखभाल प्रदान करने के लिए, कृपया साझा करें: 'मेरा नाम [आपका नाम] है और मेरा फोन नंबर [आपका फोन नंबर] है'",
        listening: "सुन रहा हूं... अब बोलें",
        speechSuccess: "आवाज सफलतापूर्वक पहचानी गई!",
        speechError: "आवाज नहीं पहचान सका। कृपया फिर से कोशिश करें।",
        hospitals: "नजदीकी अस्पताल",
        appointments: "अपॉइंटमेंट अलर्ट",
        vaccinations: "टीकाकरण अलर्ट"
      },
      es: {
        welcome: "¡Hola! Soy Surakshabot, tu asistente de salud con IA. ¿Cómo puedo ayudarte con tus preocupaciones de salud hoy?",
        askDetails: "Para brindar atención personalizada, comparte: 'Mi nombre es [Tu Nombre] y mi número de teléfono es [Tu Número de Teléfono]'",
        listening: "Escuchando... Habla ahora",
        speechSuccess: "¡Voz reconocida exitosamente!",
        speechError: "No se pudo reconocer la voz. Inténtalo de nuevo.",
        hospitals: "Hospitales Cercanos",
        appointments: "Alertas de Citas",
        vaccinations: "Alertas de Vacunación"
      }
    };

    return prompts[langCode] || prompts.en;
  }

  // Set current language
  setLanguage(language: Language): void {
    this.currentLanguage = language;
    localStorage.setItem('chatbot_language', JSON.stringify(language));
  }

  // Get current language
  getCurrentLanguage(): Language {
    const saved = localStorage.getItem('chatbot_language');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return SUPPORTED_LANGUAGES[0];
      }
    }
    return this.currentLanguage;
  }

  // Get localized text
  getText(key: string): string {
    const prompts = this.getHealthPrompts(this.getCurrentLanguage().code);
    return prompts[key] || key;
  }
}

export const translationService = new TranslationService();