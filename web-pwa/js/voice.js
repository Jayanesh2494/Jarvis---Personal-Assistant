/**
 * JARVIS - Neural Voice & Speech Integration
 * Web Speech Recognition (STT) + Web Speech Synthesis (TTS)
 * Mobile Audio Autoplay Unlocking & HTTPS Guard
 */

const VoiceEngine = {
  recognition: null,
  isListening: false,
  isSpeaking: false,
  synth: window.speechSynthesis || null,
  currentUtterance: null,
  rate: 1.0,
  pitch: 1.0,
  voices: [],

  init() {
    this.setupVoices();
    this.setupRecognition();
    this.setupControls();
  },

  setupVoices() {
    if (!this.synth) return;
    const loadVoices = () => {
      this.voices = this.synth.getVoices();
    };
    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  },

  isInsecureMobileContext() {
    return window.location.protocol === 'http:' && 
           window.location.hostname !== 'localhost' && 
           window.location.hostname !== '127.0.0.1';
  },

  setupRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('VoiceEngine: Web SpeechRecognition not supported in this browser environment.');
      this.updateStatus('MIC NOT SUPPORTED // USE TEXT INPUT');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateStatus('LISTENING // SPEAK NOW...');
        this.setOrbState('listening');
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('VoiceEngine recognized transcript:', transcript);
        this.updateStatus(`PROCESSED: "${transcript}"`);
        
        // Populate text input and execute immediately
        const input = document.getElementById('terminalTextInput');
        if (input) {
          input.value = transcript;
        }
        
        if (window.App && window.App.handleExecuteQuery) {
          window.App.handleExecuteQuery(transcript);
        }
      };

      this.recognition.onerror = (event) => {
        console.warn('VoiceEngine recognition error:', event.error);
        this.isListening = false;
        this.setOrbState('idle');

        if (event.error === 'not-allowed') {
          if (this.isInsecureMobileContext()) {
            this.updateStatus('MIC BLOCKED BY HTTP // USE HTTPS');
            this.promptHttpsUpgrade();
          } else {
            this.updateStatus('MIC PERMISSION DENIED');
            if (window.App) window.App.showHudBanner('Microphone permission denied. Please allow in browser settings.', '⚠️');
          }
        } else if (event.error === 'no-speech') {
          this.updateStatus('NO SPEECH DETECTED // RETRY');
        } else {
          this.updateStatus(`MIC ERROR: ${event.error.toUpperCase()}`);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (!this.isSpeaking) {
          this.setOrbState('idle');
          this.updateStatus('STANDBY // TAP TO SPEAK');
        }
      };
    } catch (e) {
      console.error('VoiceEngine setup failed:', e);
    }
  },

  promptHttpsUpgrade() {
    const httpsUrl = `https://${window.location.hostname}:8443`;
    if (confirm(`Android Chrome requires HTTPS for microphone access. Would you like to switch to the secure HTTPS version at ${httpsUrl}? (Accept self-signed certificate if prompted)`)) {
      window.location.href = httpsUrl;
    }
  },

  setupControls() {
    // Large Voice Orb Button
    const orb = document.getElementById('voiceOrbButton');
    if (orb) {
      orb.addEventListener('click', () => {
        this.unlockMobileAudio();
        this.toggleListening();
      });
    }

    // Terminal Mic button
    const termMic = document.getElementById('terminalMicBtn');
    if (termMic) {
      termMic.addEventListener('click', () => {
        this.unlockMobileAudio();
        this.toggleListening();
      });
    }

    // Stop Speech button
    const stopBtn = document.getElementById('stopSpeechBtn');
    if (stopBtn) {
      stopBtn.addEventListener('click', () => this.stopSpeaking());
    }

    // Speech Rate slider
    const rateSlider = document.getElementById('speechRate');
    const rateVal = document.getElementById('rateValue');
    if (rateSlider && rateVal) {
      rateSlider.addEventListener('input', (e) => {
        this.rate = parseFloat(e.target.value);
        rateVal.textContent = `${this.rate.toFixed(1)}x`;
      });
    }

    // Speech Pitch slider
    const pitchSlider = document.getElementById('speechPitch');
    const pitchVal = document.getElementById('pitchValue');
    if (pitchSlider && pitchVal) {
      pitchSlider.addEventListener('input', (e) => {
        this.pitch = parseFloat(e.target.value);
        pitchVal.textContent = this.pitch.toFixed(1);
      });
    }
  },

  /**
   * Android Chrome restricts speech synthesis unless unlocked inside a user gesture
   */
  unlockMobileAudio() {
    if (!this.synth) return;
    try {
      if (this.synth.paused) {
        this.synth.resume();
      }
      // Speak an imperceptible space to unlock audio channel
      const unlock = new SpeechSynthesisUtterance('');
      unlock.volume = 0;
      this.synth.speak(unlock);
    } catch (e) {
      console.warn('Audio unlock notice:', e);
    }
  },

  async toggleListening() {
    this.unlockMobileAudio();

    if (this.isInsecureMobileContext()) {
      this.promptHttpsUpgrade();
      return;
    }

    if (!this.recognition) {
      if (window.App) window.App.showHudBanner('Speech recognition not available on this browser. Please type commands.', 'ℹ️');
      return;
    }

    // Stop any speech output
    this.stopSpeaking();

    if (this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
      this.setOrbState('idle');
      this.updateStatus('STANDBY // TAP TO SPEAK');
    } else {
      // Prompt microphone permissions explicitly if possible
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(t => t.stop());
        } catch (err) {
          console.warn('Microphone permission not granted yet:', err);
        }
      }

      try {
        this.recognition.start();
      } catch (e) {
        console.warn('VoiceEngine: Error starting recognition', e);
        try {
          this.recognition.stop();
        } catch (stopErr) {}
      }
    }
  },

  speak(text) {
    if (!this.synth) return;
    
    // Check if autoVocalize is enabled in settings
    const profile = window.MemoryVault ? window.MemoryVault.getProfile() : {};
    if (profile.autoVocalize === false) return;

    // Clean text for speech
    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/https?:\/\/\S+/g, 'link')
      .replace(/[•🔹✅]/g, '')
      .trim();

    if (!cleanText) return;

    try {
      if (this.synth.paused) {
        this.synth.resume();
      }
      this.synth.cancel();
    } catch (e) {}

    // Small delay prevents Android Chrome speech freeze
    setTimeout(() => {
      try {
        if (this.synth.paused) {
          this.synth.resume();
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = this.rate || 1.0;
        utterance.pitch = this.pitch || 1.0;
        utterance.lang = 'en-US';

        const voices = this.voices.length > 0 ? this.voices : this.synth.getVoices();
        const preferredVoice = voices.find(v => 
          v.lang.startsWith('en') && 
          (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('David') || v.name.includes('Daniel') || v.name.includes('English'))
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
          this.isSpeaking = true;
          this.setOrbState('speaking');
          this.updateStatus('JARVIS VOCALIZING...');
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          this.setOrbState('idle');
          this.updateStatus('STANDBY // TAP TO SPEAK');
        };

        utterance.onerror = (e) => {
          console.warn('VoiceEngine utterance error:', e);
          this.isSpeaking = false;
          this.setOrbState('idle');
          this.updateStatus('STANDBY // TAP TO SPEAK');
        };

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
      } catch (err) {
        console.error('SpeechSynthesis error:', err);
      }
    }, 60);
  },

  stopSpeaking() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
    this.isSpeaking = false;
    this.setOrbState('idle');
    this.updateStatus('STANDBY // TAP TO SPEAK');
  },

  setOrbState(state) {
    const stage = document.querySelector('.voice-stage');
    if (!stage) return;
    stage.classList.remove('listening', 'speaking');
    if (state === 'listening') stage.classList.add('listening');
    if (state === 'speaking') stage.classList.add('speaking');
  },

  updateStatus(msg) {
    const pill = document.getElementById('voiceStatusPill');
    if (pill) {
      pill.textContent = msg;
    }
  }
};

window.VoiceEngine = VoiceEngine;
