/**
 * JARVIS - Tactical Reminders & Task Management Engine
 * Natural Language Parser + Local-First CRUD + Notification Scheduler
 */

const RemindersManager = {
  currentFilter: 'all',

  init() {
    this.setupListeners();
    this.renderReminders();
    this.startSchedulerLoop();
  },

  setupListeners() {
    // Natural Language Input Parse Button
    const nlBtn = document.getElementById('parseNlReminderBtn');
    const nlInput = document.getElementById('nlReminderInput');
    if (nlBtn && nlInput) {
      nlBtn.addEventListener('click', () => {
        const text = nlInput.value.trim();
        if (text) {
          const parsed = this.parseNaturalLanguage(text);
          if (parsed) {
            window.MemoryVault.addReminder(parsed);
            nlInput.value = '';
            this.renderReminders();
            if (window.App) window.App.showHudBanner(`Directive scheduled: ${parsed.title} for ${parsed.time}`, '⏰');
          } else {
            if (window.App) window.App.showHudBanner('Could not parse time. Please specify time (e.g., at 7 PM).', '⚠️');
          }
        }
      });

      nlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') nlBtn.click();
      });
    }

    // Hint tags click
    document.querySelectorAll('.hint-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const sample = tag.getAttribute('data-sample');
        if (sample && nlInput) {
          nlInput.value = sample;
          nlBtn.click();
        }
      });
    });

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentFilter = e.currentTarget.getAttribute('data-filter') || 'all';
        this.renderReminders();
      });
    });

    // Create Modal triggers
    const openModalBtn = document.getElementById('openAddReminderModalBtn');
    const modal = document.getElementById('reminderModal');
    const closeModalBtn = document.getElementById('closeReminderModalBtn');
    const cancelModalBtn = document.getElementById('cancelReminderBtn');
    const form = document.getElementById('reminderForm');

    if (openModalBtn && modal) {
      openModalBtn.addEventListener('click', () => {
        // Preset default date & time (1 hour from now)
        const now = new Date();
        const dateInput = document.getElementById('modalReminderDate');
        const timeInput = document.getElementById('modalReminderTime');
        if (dateInput) dateInput.value = now.toISOString().split('T')[0];
        if (timeInput) {
          const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
          timeInput.value = `${String(nextHour.getHours()).padStart(2, '0')}:${String(nextHour.getMinutes()).padStart(2, '0')}`;
        }
        modal.classList.remove('hidden');
      });
    }

    if (closeModalBtn && modal) {
      closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }
    if (cancelModalBtn && modal) {
      cancelModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('modalReminderTitle').value.trim();
        const date = document.getElementById('modalReminderDate').value;
        const time = document.getElementById('modalReminderTime').value;
        const priority = document.getElementById('modalReminderPriority').value;
        const category = document.getElementById('modalReminderCategory').value;

        if (title && date && time) {
          window.MemoryVault.addReminder({ title, date, time, priority, category });
          form.reset();
          modal.classList.add('hidden');
          this.renderReminders();
          if (window.App) window.App.showHudBanner(`Directive created: ${title}`, '✅');
        }
      });
    }
  },

  /**
   * Natural Language Date/Time Parser
   * Parses statements like:
   * "9pm aws meeting with crew"
   * "Schedule 9pm aws meeting with crew"
   * "Remind me to study GATE at 7 PM"
   * "Meeting with crew at 9:30pm"
   * "AWS discussion tomorrow at 10 AM"
   */
  parseNaturalLanguage(raw) {
    let clean = (raw || '').trim();

    // Strip common prefixes
    clean = clean.replace(/^(jarvis\s*,?\s*)/i, '');
    clean = clean.replace(/^(please\s+)/i, '');
    clean = clean.replace(/^(can you\s+|could you\s+|i want to\s+|i need to\s+)/i, '');
    clean = clean.replace(/^(schedule\s+(a\s+|an\s+|like\s+)?|set\s+(a\s+)?reminder\s+(for|to)?|remind\s+me\s+(to|about|for|at)?|alert\s+me\s+(to|for|at)?|create\s+(a\s+)?reminder\s+(for|to)?|book\s+(a\s+)?meeting\s+(for|with|at)?|add\s+(a\s+)?task\s+(for|to)?)\s*/i, '');

    const now = new Date();
    let targetDate = new Date();
    let priority = 'medium';
    let category = 'work';

    // Priority detection
    if (/urgent|important|asap|critical|high priority/i.test(clean)) {
      priority = 'high';
      clean = clean.replace(/\b(urgent|important|asap|critical|high priority)\b/gi, '').trim();
    }

    // Category detection
    if (/meeting|crew|client|standup|call|sync|discussion|presentation/i.test(clean)) {
      category = 'work';
    } else if (/gate|exam|study|revision|books|math|discrete/i.test(clean)) {
      category = 'study';
    } else if (/code|coding|java|python|aws|bug|github|docker/i.test(clean)) {
      category = 'coding';
    }

    // Date detection
    if (/\btomorrow\b/i.test(clean)) {
      targetDate.setDate(targetDate.getDate() + 1);
      clean = clean.replace(/\btomorrow\b/gi, '').trim();
    } else if (/\btonight\b/i.test(clean)) {
      clean = clean.replace(/\btonight\b/gi, '').trim();
    } else {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      for (let i = 0; i < days.length; i++) {
        const regex = new RegExp(`\\b(on |this |next )?${days[i]}\\b`, 'i');
        if (regex.test(clean)) {
          const currentDay = targetDate.getDay();
          const targetDay = i;
          let diff = targetDay - currentDay;
          if (diff <= 0) diff += 7;
          targetDate.setDate(targetDate.getDate() + diff);
          clean = clean.replace(regex, '').trim();
          break;
        }
      }
    }

    // Time detection:
    // e.g. "9pm", "9:30pm", "9 pm", "at 9pm", "at 9:30 pm", "21:00", "9:00"
    let hours = null;
    let minutes = 0;

    const timeRegex = /(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i;
    const timeMatch = clean.match(timeRegex);

    if (timeMatch && (timeMatch[3] || clean.match(/\b(at\s+\d{1,2})\b/i) || parseInt(timeMatch[1], 10) > 12 || clean.includes(':') || /^\s*\d{1,2}\s*(am|pm)/i.test(raw))) {
      let h = parseInt(timeMatch[1], 10);
      const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const meridiem = timeMatch[3] ? timeMatch[3].toLowerCase() : null;

      if (meridiem === 'pm' && h < 12) h += 12;
      if (meridiem === 'am' && h === 12) h = 0;

      // If no meridiem specified and hour is between 1 and 6, default to PM (common in afternoon/evening)
      if (!meridiem && h >= 1 && h <= 6) {
        h += 12;
      }

      hours = h;
      minutes = m;

      clean = clean.replace(timeMatch[0], '').trim();
    }

    // Default to 1 hour from now if no time was detected
    if (hours === null) {
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
      hours = nextHour.getHours();
      minutes = 0;
    }

    // If time is earlier today than current time, roll over to tomorrow automatically
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    const targetTotalMinutes = hours * 60 + minutes;
    const isToday = targetDate.toDateString() === now.toDateString();
    if (isToday && targetTotalMinutes <= currentTotalMinutes) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    // Clean up title
    let title = clean
      .replace(/^(\s*at\s+|\s*for\s+|\s*on\s+|\s*to\s+|\s*with\s+)+/i, '')
      .replace(/(\s*at\s+|\s*for\s+|\s*on\s+|\s*to\s+)+$/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!title || title.length < 2) {
      title = 'Scheduled Directive';
    } else {
      // Capitalize first letter
      title = title.charAt(0).toUpperCase() + title.slice(1);
    }

    const dateStr = targetDate.toISOString().split('T')[0];
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    return {
      title,
      date: dateStr,
      time: timeStr,
      priority,
      category
    };
  },

  renderReminders() {
    const container = document.getElementById('remindersContainer');
    if (!container) return;

    const all = window.MemoryVault ? window.MemoryVault.getReminders() : [];
    
    // Update badge counters
    const active = all.filter(r => !r.completed);
    const completed = all.filter(r => r.completed);
    const high = all.filter(r => r.priority === 'high' && !r.completed);

    const badge = document.getElementById('reminderCountBadge');
    if (badge) badge.textContent = active.length;

    const cAll = document.getElementById('countAll');
    if (cAll) cAll.textContent = all.length;
    const cActive = document.getElementById('countActive');
    if (cActive) cActive.textContent = active.length;
    const cComp = document.getElementById('countCompleted');
    if (cComp) cComp.textContent = completed.length;
    const cHigh = document.getElementById('countHigh');
    if (cHigh) cHigh.textContent = high.length;

    // Filter items
    let filtered = all;
    if (this.currentFilter === 'active') filtered = active;
    else if (this.currentFilter === 'completed') filtered = completed;
    else if (this.currentFilter === 'high') filtered = high;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card" style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-dim);">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">🎯</div>
          <h4 style="font-family: var(--font-hud); color: #ffffff; margin-bottom: 6px;">NO DIRECTIVES IN THIS VIEW</h4>
          <p style="font-size: 0.85rem;">All operations for this query have been addressed or cleared.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(r => `
      <div class="reminder-card ${r.completed ? 'completed' : ''}" data-id="${r.id}">
        <div class="reminder-header-row">
          <h4 class="reminder-title">${this.escapeHtml(r.title)}</h4>
          <div class="reminder-badges">
            <span class="priority-pill ${r.priority}">${r.priority.toUpperCase()}</span>
          </div>
        </div>

        <div class="reminder-meta-row">
          <span>📅 ${r.date} // ⏰ ${r.time}</span>
          <span style="text-transform: capitalize; color: var(--cyan-core);">🏷️ ${r.category}</span>
        </div>

        <div class="reminder-actions-row">
          <button class="btn-action ${r.completed ? '' : 'btn-cyan'}" onclick="RemindersManager.toggleComplete('${r.id}')">
            ${r.completed ? '↩️ REOPEN' : '✓ MARK COMPLETE'}
          </button>
          ${!r.completed ? `
            <button class="btn-action" onclick="RemindersManager.snoozeReminder('${r.id}')">
              ⏳ +30m
            </button>
          ` : ''}
          <button class="btn-action btn-danger" onclick="RemindersManager.deleteReminder('${r.id}')">
            🗑️
          </button>
        </div>
      </div>
    `).join('');

    // Also update Dashboard Directives
    this.renderDashboardDirectives(active);
  },

  renderDashboardDirectives(activeReminders) {
    const list = document.getElementById('dashboardDirectivesList');
    if (!list) return;

    if (activeReminders.length === 0) {
      list.innerHTML = `
        <div style="padding: 16px; text-align: center; color: var(--text-dim); font-size: 0.85rem;">
          No active directives pending. You are on track, Commander.
        </div>
      `;
      return;
    }

    list.innerHTML = activeReminders.slice(0, 4).map(r => {
      const cd = this.calculateCountdown(r.date, r.time);
      return `
        <div class="directive-item priority-${r.priority}">
          <div class="directive-content">
            <span class="directive-title">${this.escapeHtml(r.title)}</span>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
              <span class="directive-time">⏰ ${r.time} (${r.date})</span>
              <span class="live-countdown-badge ${cd.isDue ? 'due-pulse' : ''}">${cd.text}</span>
            </div>
          </div>
          <button class="directive-check-btn" onclick="RemindersManager.toggleComplete('${r.id}')">DONE ✓</button>
        </div>
      `;
    }).join('');
  },

  calculateCountdown(dateStr, timeStr) {
    if (!dateStr || !timeStr) return { text: 'Scheduled', isDue: false };
    const target = new Date(`${dateStr}T${timeStr}:00`).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 60000 && diff >= -120000) {
      return { text: '🚨 DUE NOW', isDue: true };
    }
    if (diff < -120000) {
      return { text: '⚠️ Overdue', isDue: false };
    }

    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) {
      return { text: `⏳ In ${minutes}m`, isDue: false };
    }
    const hours = Math.floor(minutes / 60);
    const remMinutes = minutes % 60;
    if (hours < 24) {
      return { text: `⏳ In ${hours}h ${remMinutes}m`, isDue: false };
    }
    const days = Math.floor(hours / 24);
    return { text: `📅 In ${days}d`, isDue: false };
  },

  playAlarmChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';

      // 3-tone chime (D5 -> A5 -> D6)
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880.00, now + 0.15);
      osc.frequency.setValueAtTime(1174.66, now + 0.3);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.9);
    } catch (e) {
      console.log('Audio chime error:', e);
    }
  },

  toggleComplete(id) {
    const reminders = window.MemoryVault ? window.MemoryVault.getReminders() : [];
    const item = reminders.find(r => r.id === id);
    if (item) {
      window.MemoryVault.updateReminder(id, { completed: !item.completed });
      this.renderReminders();
      if (window.App) window.App.updateMetrics();
    }
  },

  snoozeReminder(id) {
    const reminders = window.MemoryVault ? window.MemoryVault.getReminders() : [];
    const item = reminders.find(r => r.id === id);
    if (item && item.time) {
      const [h, m] = item.time.split(':').map(Number);
      let newM = m + 30;
      let newH = h;
      if (newM >= 60) {
        newM -= 60;
        newH = (newH + 1) % 24;
      }
      const newTime = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
      window.MemoryVault.updateReminder(id, { time: newTime, alerted: false });
      this.renderReminders();
      if (window.App) window.App.showHudBanner(`Snoozed: ${item.title} until ${newTime}`, '⏳');
    }
  },

  deleteReminder(id) {
    window.MemoryVault.deleteReminder(id);
    this.renderReminders();
    if (window.App) window.App.updateMetrics();
  },

  /**
   * Real-Time Precision Scheduler: checks every 5 seconds for due tasks
   */
  startSchedulerLoop() {
    // 5-second precision check for alarms
    setInterval(() => {
      const reminders = window.MemoryVault ? window.MemoryVault.getReminders() : [];
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const nowMs = now.getTime();

      reminders.forEach(r => {
        if (!r.completed && !r.alerted) {
          const targetMs = new Date(`${r.date}T${r.time}:00`).getTime();
          // Trigger if within 30 seconds of target time
          if (Math.abs(nowMs - targetMs) <= 30000 || (r.date === currentDate && r.time === currentTime)) {
            r.alerted = true;
            window.MemoryVault.updateReminder(r.id, { alerted: true });

            // 1. Play real audio synthesizer chime
            this.playAlarmChime();

            // 2. High visibility HUD Alert Banner
            if (window.App) {
              window.App.showHudBanner(`ALARM DUE: ${r.title.toUpperCase()} (${r.time})`, '⏰');
            }

            // 3. Vocal speech alert
            if (window.VoiceEngine) {
              window.VoiceEngine.speak(`Pardon the interruption, Jayanesh. Directive due: ${r.title}`);
            }

            // 4. Native Notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('JARVIS // Directive Due', {
                body: `${r.title} (Scheduled for ${r.time})`,
                icon: './icons/icon-192.svg'
              });
            }

            // Re-render countdowns
            this.renderReminders();
          }
        }
      });
    }, 5000);

    // 15-second countdown ticker to update countdown badges live
    setInterval(() => {
      const activeTab = document.querySelector('.nav-tab.active');
      if (activeTab && (activeTab.dataset.target === 'dashboard' || activeTab.dataset.target === 'reminders')) {
        this.renderReminders();
      }
    }, 15000);
  },

  escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }
};

window.RemindersManager = RemindersManager;
