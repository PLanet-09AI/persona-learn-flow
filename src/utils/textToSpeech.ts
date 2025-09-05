/**
 * Text-to-speech utility using the Web Speech API
 * This provides a simple interface for text-to-speech functionality
 */

interface SpeechOptions {
  rate?: number; // Speech rate (0.1 to 10)
  pitch?: number; // Voice pitch (0 to 2)
  volume?: number; // Volume (0 to 1)
  voice?: string; // Voice name (optional)
  language?: string; // Language code (e.g. 'en-US')
  onEnd?: () => void; // Callback when speech ends
}

class TextToSpeechService {
  private utterance: SpeechSynthesisUtterance | null = null;
  private speechSynthesis: SpeechSynthesis;
  
  constructor() {
    this.speechSynthesis = window.speechSynthesis;
  }

  /**
   * Speak the provided text
   * @param text - The text to speak
   * @param options - Optional speech configuration
   */
  speak(text: string, options: SpeechOptions = {}): void {
    // Cancel any ongoing speech
    this.stop();
    
    // Create a new utterance
    this.utterance = new SpeechSynthesisUtterance(text);
    
    // Apply options
    if (options.rate !== undefined) this.utterance.rate = options.rate;
    if (options.pitch !== undefined) this.utterance.pitch = options.pitch;
    if (options.volume !== undefined) this.utterance.volume = options.volume;
    if (options.language) this.utterance.lang = options.language;
    
    // Select voice if specified
    if (options.voice) {
      const voices = this.getVoices();
      const selectedVoice = voices.find(voice => voice.name === options.voice);
      if (selectedVoice) {
        this.utterance.voice = selectedVoice;
      }
    }
    
    // Add end event listener if onEnd callback is provided
    if (options.onEnd) {
      this.utterance.onend = options.onEnd;
    }
    
    // Start speaking
    this.speechSynthesis.speak(this.utterance);
  }
  
  /**
   * Stop the current speech
   */
  stop(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }
  
  /**
   * Pause the current speech
   */
  pause(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.pause();
    }
  }
  
  /**
   * Resume the paused speech
   */
  resume(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.resume();
    }
  }
  
  /**
   * Get all available voices
   * @returns Array of available SpeechSynthesisVoice objects
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.speechSynthesis.getVoices();
  }
  
  /**
   * Check if speech synthesis is currently speaking
   * @returns boolean indicating if speech is in progress
   */
  isSpeaking(): boolean {
    return this.speechSynthesis.speaking;
  }
  
  /**
   * Check if speech synthesis is paused
   * @returns boolean indicating if speech is paused
   */
  isPaused(): boolean {
    return this.speechSynthesis.paused;
  }
}

// Export singleton instance
export const textToSpeech = new TextToSpeechService();
