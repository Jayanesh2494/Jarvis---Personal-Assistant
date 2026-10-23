/**
 * JARVIS - Master Application Coordinator & PWA Lifecycle Engine
 */

const App = {
  deferredPrompt: null,

  init() {
    console.log('JARVIS System initializing...');
    
    // Safely initialize each sub-module without letting any single failure block the rest
    const initSafely = (name, fn) => {
      try {
        fn();
      } catch (err) {
        console.warn(`[JARVIS] Module init warning (${name}):`, err);
      }
    };

    // 1. Initialize Modules
    initSafely('VoiceEngine', () => window.VoiceEngine && window.VoiceEngine.init());
    initSafely('RemindersManager', () => window.RemindersManager && window.RemindersManager.init());
    initSafely('PlannerManager', () => window.PlannerManager && window.PlannerManager.init());
    initSafely('CommsManager', () => window.CommsManager && window.CommsManager.init());
    initSafely('SpotifyController', () => window.SpotifyController && window.SpotifyController.init());
    initSafely('SystemShortcuts', () => window.SystemShortcuts && window.SystemShortcuts.init());

    // 2. Setup Navigation & Core UI
    initSafely('setupNavigation', () => this.setupNavigation());
    initSafely('setupClock', () => this.setupClock());
    initSafely('setupChatTerminal', () => this.setupChatTerminal());
    initSafely('setupMemoryVaultUI', () => this.setupMemoryVaultUI());
    initSafely('setupSettingsUI', () => this.setupSettingsUI());
    initSafely('updateMetrics', () => this.updateMetrics());
    initSafely('renderNotes', () => this.renderNotes());
    initSafely('renderChatMessages', () => this.renderChatMessages());

    // 3. Setup PWA Service Worker & Install Prompt
    initSafely('setupPWA', () => this.setupPWA());
  },

  // --- HUD Navigation & Tab Switching ---
  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const tab = item.getAttribute('data-tab');
        if (tab) {
          e.preventDefault();
          this.switchTab(tab);
        }
      });
    });

    // Hash change support
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) this.switchTab(hash);
    });

    // Quick direct links
    const goToChatBtn = document.getElementById('goToChatBtn');
    if (goToChatBtn) {
      goToChatBtn.addEventListener('click', () => this.switchTab('voice'));
    }
  },

  switchTab(tabId) {
    // Update nav dock active states
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-tab') === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update section visibility
    document.querySelectorAll('.hud-section').forEach(sec => {
      if (sec.id === `sec-${tabId}`) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // --- Stark Telemetry HUD Clock ---
  setupClock() {
    const clockEl = document.getElementById('sysClock');
    const dateEl = document.getElementById('sysDate');

    const updateTime = () => {
      const now = new Date();
      if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString([], { hour12: false });
      }
      if (dateEl) {
        dateEl.textContent = now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
      }
    };

    updateTime();
    setInterval(updateTime, 1000);
  },

  // --- Neural Conversation Terminal ---
  setupChatTerminal() {
    const textInput = document.getElementById('terminalTextInput');
    const sendBtn = document.getElementById('terminalSendBtn');
    const clearBtn = document.getElementById('clearChatHistoryBtn');

    if (sendBtn && textInput) {
      sendBtn.addEventListener('click', () => {
        if (window.VoiceEngine) window.VoiceEngine.unlockMobileAudio();
        const query = textInput.value.trim();
        if (query) {
          this.handleExecuteQuery(query);
          textInput.value = '';
        }
      });

      textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          if (window.VoiceEngine) window.VoiceEngine.unlockMobileAudio();
          sendBtn.click();
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear neural conversation history?')) {
          window.MemoryVault.clearChatHistory();
          this.renderChatMessages();
          this.showHudBanner('Conversation history cleared.', '🧹');
        }
      });
    }

    // Suggested prompt chips
    document.querySelectorAll('.prompt-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (window.VoiceEngine) window.VoiceEngine.unlockMobileAudio();
        const query = chip.getAttribute('data-query');
        if (query) {
          this.handleExecuteQuery(query);
        }
      });
    });
  },

  async handleExecuteQuery(query) {
    if (!query) return;

    // 1. Log user message
    window.MemoryVault.addChatMessage('user', query);
    this.renderChatMessages();

    // 2. Process via IntentRouter
    if (window.IntentRouter) {
      const result = await window.IntentRouter.processQuery(query);
      
      // 3. Log jarvis message
      window.MemoryVault.addChatMessage('jarvis', result.responseText);
      this.renderChatMessages();

      // 4. Update preview feed on dashboard
      const preview = document.getElementById('recentQueryPreview');
      if (preview) {
        preview.innerHTML = `
          <p class="preview-prompt">"${this.escapeHtml(query)}"</p>
          <p class="preview-response">${this.escapeHtml(result.responseText)}</p>
        `;
      }

      // 5. Vocalize response if enabled
      if (window.VoiceEngine) {
        window.VoiceEngine.speak(result.responseText);
      }

      this.updateMetrics();
    }
  },

  renderChatMessages() {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;

    const history = window.MemoryVault ? window.MemoryVault.getChatHistory() : [];
    container.innerHTML = history.map(msg => `
      <div class="chat-bubble ${msg.sender}">
        ${this.escapeHtml(msg.text).replace(/\n/g, '<br>')}
      </div>
    `).join('');

    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;
  },

  // --- Personal Memory Vault UI ---
  setupMemoryVaultUI() {
    const profile = window.MemoryVault ? window.MemoryVault.getProfile() : {};

    const nameInput = document.getElementById('memUserName');
    const goalInput = document.getElementById('memPrimaryGoal');
    const interestsInput = document.getElementById('memLearningInterests');
    const styleSelect = document.getElementById('memResponseStyle');
    const vocalizeCb = document.getElementById('memAutoVocalize');
    const offlineCb = document.getElementById('memOfflineFirst');

    if (nameInput) nameInput.value = profile.userName || 'Commander';
    if (goalInput) goalInput.value = profile.primaryGoal || '';
    if (interestsInput) interestsInput.value = profile.learningInterests || '';
    if (styleSelect) styleSelect.value = profile.responseStyle || 'concise';
    if (vocalizeCb) vocalizeCb.checked = profile.autoVocalize !== false;
    if (offlineCb) offlineCb.checked = profile.offlineFirst !== false;

    // Save Identity
    const saveIdBtn = document.getElementById('saveIdentityBtn');
    if (saveIdBtn) {
      saveIdBtn.addEventListener('click', () => {
        window.MemoryVault.saveProfile({
          userName: nameInput.value.trim() || 'Commander',
          primaryGoal: goalInput.value.trim(),
          learningInterests: interestsInput.value.trim()
        });
        this.updateHeroGreeting();
        this.showHudBanner('Identity profile updated in Memory Vault.', '👤');
      });
    }

    // Save Preferences
    const savePrefBtn = document.getElementById('savePreferencesBtn');
    if (savePrefBtn) {
      savePrefBtn.addEventListener('click', () => {
        window.MemoryVault.saveProfile({
          responseStyle: styleSelect.value,
          autoVocalize: vocalizeCb.checked,
          offlineFirst: offlineCb.checked
        });
        this.showHudBanner('Assistant personality preferences updated.', '⚙️');
      });
    }

    // Export Data (JSON)
    const exportBtn = document.getElementById('exportDataBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        window.MemoryVault.exportAllData();
        this.showHudBanner('Data export generated (JSON download).', '📥');
      });
    }

    // Clear Memory
    const wipeBtn = document.getElementById('wipeDataBtn');
    if (wipeBtn) {
      wipeBtn.addEventListener('click', () => {
        if (confirm('CRITICAL ALERT: Are you certain you want to wipe all local memory, reminders, and notes?')) {
          window.MemoryVault.wipeAllData();
          location.reload();
        }
      });
    }

    // Add Note
    const addNoteBtn = document.getElementById('addNoteBtn');
    if (addNoteBtn) {
      addNoteBtn.addEventListener('click', () => {
        const text = prompt('Enter knowledge snippet or note to store:');
        if (text && text.trim()) {
          window.MemoryVault.addNote(text.trim(), 'Personal Note');
          this.renderNotes();
          this.showHudBanner('Note stored in Cognitive Vault.', '📝');
        }
      });
    }

    this.updateHeroGreeting();
  },

  updateHeroGreeting() {
    const profile = window.MemoryVault ? window.MemoryVault.getProfile() : {};
    const greetingEl = document.getElementById('heroGreeting');
    if (greetingEl) {
      greetingEl.textContent = `Good day, ${profile.userName || 'Commander'}.`;
    }
  },

  renderNotes() {
    const container = document.getElementById('notesListContainer');
    if (!container) return;

    const notes = window.MemoryVault ? window.MemoryVault.getNotes() : [];
    if (notes.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 20px; text-align: center; color: var(--text-dim); font-size: 0.85rem;">
          No notes stored. Click "+ ADD NOTE" or tell JARVIS "Note down..." to save knowledge snippets.
        </div>
      `;
      return;
    }

    container.innerHTML = notes.map(n => `
      <div class="note-card">
        <p class="note-text">${this.escapeHtml(n.text)}</p>
        <div class="note-footer">
          <span>📅 ${n.date} // 🏷️ ${n.category}</span>
          <button class="btn-action btn-danger" style="padding: 2px 8px; font-size: 0.65rem;" onclick="App.deleteNote('${n.id}')">DELETE</button>
        </div>
      </div>
    `).join('');
  },

  deleteNote(id) {
    if (window.MemoryVault) {
      window.MemoryVault.deleteNote(id);
      this.renderNotes();
      this.showHudBanner('Note removed.', '🗑️');
    }
  },

  // --- System Core & Settings UI ---
  setupSettingsUI() {
    // Mic permission test
    const testMicBtn = document.getElementById('requestMicPermBtn');
    if (testMicBtn) {
      testMicBtn.addEventListener('click', () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
              this.showHudBanner('Microphone permission confirmed OK!', '🎙️');
              testMicBtn.textContent = 'ACTIVE ✓';
              testMicBtn.style.borderColor = 'var(--green-ok)';
              testMicBtn.style.color = 'var(--green-ok)';
              setTimeout(() => stream.getTracks().forEach(t => t.stop()), 2000);
            })
            .catch(err => {
              this.showHudBanner('Microphone permission denied.', '⚠️');
            });
        } else {
          this.showHudBanner('MediaDevices API not available in this context.', 'ℹ️');
        }
      });
    }

    // Notification permission request
    const notifBtn = document.getElementById('requestNotifPermBtn');
    if (notifBtn) {
      if ('Notification' in window && Notification.permission === 'granted') {
        notifBtn.textContent = 'ACTIVE ✓';
        notifBtn.style.borderColor = 'var(--green-ok)';
        notifBtn.style.color = 'var(--green-ok)';
      }

      notifBtn.addEventListener('click', () => {
        if ('Notification' in window) {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              this.showHudBanner('Notification permission granted!', '🔔');
              notifBtn.textContent = 'ACTIVE ✓';
              notifBtn.style.borderColor = 'var(--green-ok)';
              notifBtn.style.color = 'var(--green-ok)';
            } else {
              this.showHudBanner('Notifications denied by user.', '⚠️');
            }
          });
        } else {
          this.showHudBanner('Notifications not supported by browser.', 'ℹ️');
        }
      });
    }
  },

  // --- Tactical Dashboard Metrics ---
  updateMetrics() {
    const reminders = window.MemoryVault ? window.MemoryVault.getReminders() : [];
    const active = reminders.filter(r => !r.completed);
    const completed = reminders.filter(r => r.completed);

    const activeEl = document.getElementById('metricActiveTasks');
    const compEl = document.getElementById('metricCompletionRate');
    const compTag = document.getElementById('metricCompletionTag');

    if (activeEl) activeEl.textContent = active.length;
    
    if (compEl) {
      const total = reminders.length;
      const rate = total > 0 ? Math.round((completed.length / total) * 100) : 100;
      compEl.textContent = `${rate}%`;

      if (compTag) {
        if (rate >= 75) {
          compTag.textContent = 'OPTIMAL';
          compTag.className = 'metric-trend text-green';
        } else if (rate >= 40) {
          compTag.textContent = 'IN PROGRESS';
          compTag.className = 'metric-trend text-gold';
        } else {
          compTag.textContent = 'ACTION REQUIRED';
          compTag.className = 'metric-trend text-cyan';
        }
      }
    }
  },

  // --- Heads-Up Notification Banner ---
  showHudBanner(text, icon = '⚡') {
    const banner = document.getElementById('hudBanner');
    const bannerText = document.getElementById('bannerText');
    const bannerIcon = document.getElementById('bannerIcon');

    if (banner && bannerText) {
      bannerText.textContent = text;
      if (bannerIcon) bannerIcon.textContent = icon;

      banner.classList.remove('hidden');
      clearTimeout(this._bannerTimeout);
      this._bannerTimeout = setTimeout(() => {
        banner.classList.add('hidden');
      }, 4000);
    }
  },

  // --- PWA Service Worker & Install Logic ---
  setupPWA() {
    if ('serviceWorker' in navigator) {
      const registerSW = () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => {
            console.log('JARVIS PWA Service Worker registered:', reg.scope);
            reg.update().catch(() => {});
          })
          .catch(err => {
            console.warn('JARVIS Service Worker registration failed:', err);
          });
      };

      if (document.readyState === 'complete') {
        registerSW();
      } else {
        window.addEventListener('load', registerSW);
      }
    }

    // Capture install prompt for PWA
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      console.log('PWA beforeinstallprompt captured.');
      this.showHudBanner('JARVIS is ready to install as an on-device PWA app.', '📲');
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.showHudBanner('JARVIS successfully installed to home screen!', '🎉');
    });
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }
};

window.App = App;

// Robust Bootstrap: Run immediately if DOM is already parsed/cached, otherwise listen for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    App.init();
  });
} else {
  App.init();
}
