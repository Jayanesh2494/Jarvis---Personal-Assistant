/**
 * JARVIS - Intent Classification & Natural Language Router
 * Local-First, Regex-based & Tokenized Intent Dispatcher
 * Zero cloud dependency.
 */

const IntentRouter = {
  /**
   * Main entry point to classify and execute user directives
   * @param {string} rawInput 
   * @returns {Promise<{intent: string, action: string, responseText: string, data?: any}>}
   */
  async processQuery(rawInput) {
    if (!rawInput || !rawInput.trim()) {
      return {
        intent: 'empty',
        action: 'none',
        responseText: 'I am standing by, Jayanesh. Please state your directive.'
      };
    }

    const input = rawInput.trim();
    const lower = input.toLowerCase();
    const profile = window.MemoryVault ? window.MemoryVault.getProfile() : { userName: 'Jayanesh' };

    // 1. INTENT: TIME & DATE QUERY
    // e.g. "What is the time now", "What time is it", "Tell me the time", "What is the date"
    if (/what( is|'s)? the time|what time is it|tell me the time|current time|time now/i.test(lower)) {
      return this.handleTimeQueryIntent(profile);
    }

    if (/what( is|'s)? the date|what date is it|what day is it|today's date|current date/i.test(lower)) {
      return this.handleDateQueryIntent(profile);
    }

    // 2. INTENT: DIRECT PHONE CALL (e.g. "Call Amma", "Dial Appa", "Call 9876543210")
    if (/^(call|dial|ring)\s+(.*)/i.test(lower)) {
      return this.handleCallIntent(input, profile);
    }

    // 3. INTENT: GREETINGS
    // e.g. "Hello JARVIS", "Hi", "Hey JARVIS", "Good morning", "Good evening"
    if (/^(hello|hi|hey|good morning|good afternoon|good evening)\b/i.test(lower)) {
      return this.handleGreetingIntent(profile);
    }

    // 4. INTENT: LINKEDIN & EMAIL COMMS INBOX
    // e.g. "Check LinkedIn messages", "Open email", "Check Gmail", "Open LinkedIn"
    if (/linkedin message|check linkedin|open linkedin/i.test(lower)) {
      window.open('https://www.linkedin.com/messaging/', '_blank');
      return {
        intent: 'comms_linkedin',
        action: 'open_linkedin_messages',
        responseText: 'Opening your LinkedIn messaging feed, Jayanesh.'
      };
    }

    if (/check (my )?(email|mail|gmail)|open (email|mail|gmail)|inbox/i.test(lower)) {
      window.open('https://mail.google.com/mail/u/0/#inbox', '_blank');
      return {
        intent: 'comms_gmail',
        action: 'open_gmail_inbox',
        responseText: 'Opening your Gmail inbox (jayaneshdhanakkotti@gmail.com), Jayanesh.'
      };
    }

    // 5. INTENT: IMPORTANT GMAIL QUERY
    if (/(important (mail|email|messages)|how (can|do) i get my (important )?(mail|email)|check (important )?(mail|email)|sync gmail)/i.test(lower)) {
      return this.handleImportantEmailIntent();
    }

    // 6. INTENT: LIVE WEATHER & METEOROLOGICAL TELEMETRY
    // Matches: "weather", "whether", "how is the weather", "temperature", "forecast", "is it raining"
    if (/weather|whether|temperature|forecast|climate|rain|humidity|degrees|how is the weather|how('s| is) it outside/i.test(lower)) {
      return await this.handleWeatherIntent(input, lower);
    }

    // 7. INTENT: CALCULATOR & MATHEMATICAL EVALUATION
    // Matches: "calculate 25 * 40", "what is 50 + 20", "250 / 5", "15% of 600"
    if (/(?:calculate|compute|what is|how much is)\s+[\d\s\+\-\*\/\.\(\)\%\^]+/i.test(lower) || /^[0-9\s\+\-\*\/\(\)\^\.]+\s*=?$/i.test(lower)) {
      const mathResult = this.handleMathIntent(input, lower);
      if (mathResult) return mathResult;
    }

    // 8. INTENT: WEB SEARCH & YOUTUBE STREAMING
    // Matches: "search for...", "google...", "search youtube for...", "look up..."
    if (/^(search (for|google|youtube for)|google|look up|find info on|search on youtube for)\s+(.*)/i.test(lower)) {
      return this.handleSearchIntent(input, lower);
    }

    // 9. INTENT: ENCYCLOPEDIA & KNOWLEDGE LOOKUP (WIKIPEDIA)
    // Matches: "who is Elon Musk", "what is quantum computing", "tell me about Python", "explain AI"
    if (/^(who is|who was|what is|tell me about|explain)\s+(.*)/i.test(lower) && !/time|date|weather|whether|temperature|schedule|task|note|jarvis|my name|my profile/i.test(lower)) {
      const wikiResult = await this.handleWikipediaIntent(input, lower);
      if (wikiResult) return wikiResult;
    }

    // 10. INTENT: SPOTIFY AUDIO AUTOMATION
    // Matches: "play interstellar theme on spotify", "play a r rahman", "pause spotify", "next song", "play music"
    if (/^(play|pause|resume|skip|next|previous|stop)\s+(.*(spotify|song|music|track|beats)|.*)/i.test(lower) && !/plan my coding|study plan/i.test(lower) || /spotify\s+play/i.test(lower)) {
      if (/spotify|music|song|track|beats|artist|album|playlist|play\s+[a-z0-9]/i.test(lower) && !/remind|schedule|meeting|crew/i.test(lower)) {
        return this.handleSpotifyIntent(input, lower);
      }
    }

    // 11. INTENT: CREATE REMINDER / SCHEDULE MEETING
    // Matches: "9pm aws meeting with crew", "schedule 9pm aws meeting", "meeting with crew at 9pm", "remind me to..."
    const hasTimePattern = /\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)|\d{1,2}\s*(?:am|pm)|at\s+\d{1,2})\b/i.test(lower);
    const hasScheduleKeyword = /\b(schedule|meeting|meet|remind|reminder|alert|appointment|sync|crew|session|call|task|calendar|study)\b/i.test(lower);
    const startsWithSchedule = /^(remind|set\s+a?\s*reminder|create\s+a?\s*reminder|schedule|alert\s+me|book|plan)/i.test(lower);

    if (startsWithSchedule || (hasTimePattern && hasScheduleKeyword) || /^\s*\d{1,2}(?::\d{2})?\s*(am|pm)/i.test(lower)) {
      return this.handleReminderIntent(input);
    }

    // 12. INTENT: DAILY TASK QUERY / WHAT DO I NEED TO DO TODAY
    // e.g. "What do I need to do today?", "What should I focus on today?", "Show my tasks"
    if (/what do i need to do|what should i focus on|what are my tasks|show my tasks|today's agenda|daily tasks/i.test(lower)) {
      return this.handleTaskQueryIntent();
    }

    // 13. INTENT: PLAN CODING / GATE PRACTICE
    // e.g. "Help me plan my coding practice", "Plan my study session", "Create a study plan"
    if (/plan my coding|plan my study|plan coding practice|coding practice|study plan|tactical plan/i.test(lower)) {
      return this.handlePlanningIntent(input);
    }

    // 14. INTENT: APP SHORTCUTS & SYSTEM ACTIONS
    // e.g. "Open camera", "Open calendar", "Send email"
    if (/^(open|launch|start)/i.test(lower)) {
      return this.handleShortcutIntent(lower);
    }

    // 15. INTENT: SAVE NOTE / MEMORY
    // e.g. "Remember that...", "Note down...", "Save note..."
    if (/^(remember that|note down|save note|take a note)/i.test(lower)) {
      return this.handleNoteIntent(input);
    }

    // 16. INTENT: USER IDENTITY & WHO AM I
    if (/who am i|my name|my profile|about me/i.test(lower)) {
      return {
        intent: 'identity',
        action: 'answer',
        responseText: `You are Jayanesh. Email: jayaneshdhanakkotti@gmail.com. LinkedIn: linkedin.com/in/jayanesh2494. Primary objective: ${profile.primaryGoal}.`
      };
    }

    // 17. INTENT: SYSTEM STATUS & DIAGNOSTICS
    if (/status report|diagnostics|system status|subsystems nominal|who are you|jarvis/i.test(lower)) {
      return this.handleDiagnosticsIntent(profile);
    }

    // 18. INTENT: NOTIFICATION SUMMARY
    if (/summarise my (important )?notifications|notification summary|check notifications/i.test(lower)) {
      return this.handleNotificationSummaryIntent();
    }

    // 19. GENERAL TECHNICAL / COGNITIVE QUERY (CONVERSATIONAL & INTELLIGENT)
    return await this.handleGeneralQuery(input, profile);
  },

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------

  handleTimeQueryIntent(profile) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    const name = profile.userName || 'Jayanesh';
    return {
      intent: 'query_time',
      action: 'answer',
      responseText: `The current time is ${timeStr}, ${name}.`
    };
  },

  handleDateQueryIntent(profile) {
    const now = new Date();
    const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const name = profile.userName || 'Jayanesh';
    return {
      intent: 'query_date',
      action: 'answer',
      responseText: `Today is ${dateStr}, ${name}.`
    };
  },

  handleCallIntent(input, profile) {
    const target = input.replace(/^(call|dial|ring|please call)\s+/i, '').replace(/^(my\s+)/i, '').trim();

    // 1. Direct phone number check
    if (/^[\d+\-\s()]{4,}$/.test(target)) {
      const cleanPhone = target.replace(/[\s\-()]/g, '');
      if (cleanPhone.length >= 3) {
        window.location.href = `tel:${cleanPhone}`;
        return {
          intent: 'call_contact',
          action: 'dial',
          responseText: `Initiating direct call to ${target} immediately, Jayanesh.`
        };
      }
    }

    // 2. Smart Search across MemoryVault contacts (exact, partial, tokens)
    let matched = null;
    if (window.MemoryVault && window.MemoryVault.searchContact) {
      matched = window.MemoryVault.searchContact(target);
    }

    if (matched && matched.phone && matched.phone.replace(/\D/g, '').length >= 3) {
      const cleanPhone = matched.phone.replace(/\s+/g, '');
      window.location.href = `tel:${cleanPhone}`;
      return {
        intent: 'call_contact',
        action: 'dial',
        responseText: `Calling ${matched.name} (${matched.phone}) immediately, Jayanesh.`
      };
    }

    // 3. Android Contact Picker API (zero-prompt native search fallback)
    if ('contacts' in navigator && 'ContactsManager' in window && navigator.contacts.select) {
      navigator.contacts.select(['name', 'tel'], { multiple: false })
        .then(results => {
          if (results && results[0] && results[0].tel && results[0].tel[0]) {
            const pickedName = results[0].name && results[0].name[0] ? results[0].name[0] : target;
            const pickedPhone = results[0].tel[0];
            if (window.MemoryVault) {
              window.MemoryVault.setContact(pickedName.toLowerCase(), pickedName, pickedPhone);
            }
            if (window.CommsManager) {
              window.CommsManager.renderContacts();
            }
            window.location.href = `tel:${pickedPhone.replace(/\s+/g, '')}`;
          } else {
            window.location.href = 'tel:';
          }
        })
        .catch(() => {
          window.location.href = 'tel:';
        });

      return {
        intent: 'call_contact',
        action: 'pick_and_dial',
        responseText: `Searching device contacts for "${target}". Opening native contact book immediately.`
      };
    }

    // 4. Instant fallback to dialler with zero prompts or delays
    window.location.href = 'tel:';
    return {
      intent: 'call_contact',
      action: 'open_dialler',
      responseText: `Opening phone dialler immediately for "${target}".`
    };
  },

  handleGreetingIntent(profile) {
    const name = profile.userName || 'Jayanesh';
    const hour = new Date().getHours();
    let salutation = 'Good day';
    if (hour < 12) salutation = 'Good morning';
    else if (hour < 18) salutation = 'Good afternoon';
    else salutation = 'Good evening';

    return {
      intent: 'greeting',
      action: 'answer',
      responseText: `${salutation}, ${name}. All systems are optimal and standing by for your directives.`
    };
  },

  handleSpotifyIntent(input, lower) {
    if (/pause|stop/i.test(lower)) {
      if (window.SpotifyController) window.SpotifyController.pauseMusic();
      return {
        intent: 'spotify_control',
        action: 'pause',
        responseText: 'Pausing Spotify playback, Jayanesh.'
      };
    }
    if (/next|skip/i.test(lower)) {
      if (window.SpotifyController) window.SpotifyController.nextTrack();
      return {
        intent: 'spotify_control',
        action: 'next',
        responseText: 'Skipping to the next track on Spotify.'
      };
    }
    if (/prev|previous/i.test(lower)) {
      if (window.SpotifyController) window.SpotifyController.previousTrack();
      return {
        intent: 'spotify_control',
        action: 'previous',
        responseText: 'Returning to the previous track on Spotify.'
      };
    }

    // Extract song or artist name
    let query = input.replace(/^(jarvis\s*,?\s*)/i, '')
      .replace(/^(please\s+)/i, '')
      .replace(/^(can you\s+|could you\s+)/i, '')
      .replace(/^(play\s+(some\s+)?(songs?\s+|music\s+|tracks?\s+)?(by\s+|of\s+|from\s+)?)/i, '')
      .replace(/^(spotify\s+play\s+)/i, '')
      .replace(/\s+(on|in)\s+spotify\s*$/i, '')
      .trim();

    if (!query) query = 'Deep Work Coding';

    if (window.SpotifyController) {
      window.SpotifyController.playMusic(query);
    }

    return {
      intent: 'spotify_play',
      action: 'play_music',
      responseText: `Initiating Spotify automation: Playing "${query}" now, Jayanesh.`
    };
  },

  handleImportantEmailIntent() {
    // Switch to Comms tab
    if (window.App && window.App.switchTab) {
      window.App.switchTab('comms');
    }
    if (window.CommsManager && window.CommsManager.fetchLiveGmail) {
      window.CommsManager.fetchLiveGmail();
    }
    return {
      intent: 'query_important_email',
      action: 'open_comms_inbox',
      responseText: 'Accessing your Important Communications inbox, Jayanesh. Live Gmail feed is active for jayaneshdhanakkotti@gmail.com.'
    };
  },

  handleReminderIntent(input) {
    const parsed = window.RemindersManager ? window.RemindersManager.parseNaturalLanguage(input) : null;
    
    if (parsed) {
      const saved = window.MemoryVault.addReminder({
        title: parsed.title,
        date: parsed.date,
        time: parsed.time,
        priority: parsed.priority || 'medium',
        category: parsed.category || 'work'
      });

      if (window.RemindersManager && window.RemindersManager.renderReminders) {
        window.RemindersManager.renderReminders();
      }
      if (window.App && window.App.updateMetrics) {
        window.App.updateMetrics();
      }

      // Convert 24h to 12h readable time
      const [h, m] = parsed.time.split(':').map(Number);
      const h12 = h % 12 || 12;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const friendlyTime = `${h12}:${String(m).padStart(2, '0')} ${ampm}`;

      return {
        intent: 'create_reminder',
        action: 'reminder_created',
        responseText: `Directive confirmed, Jayanesh. I have scheduled "${parsed.title}" for ${friendlyTime} today (${parsed.date}). Real-time alarm and countdown are active.`,
        data: saved
      };
    } else {
      return {
        intent: 'create_reminder',
        action: 'open_modal',
        responseText: `I detected a scheduling directive. Please specify the title and target time.`,
        data: null
      };
    }
  },

  handleTaskQueryIntent() {
    const reminders = window.MemoryVault ? window.MemoryVault.getReminders() : [];
    const pending = reminders.filter(r => !r.completed);
    
    if (pending.length === 0) {
      return {
        intent: 'query_tasks',
        action: 'none',
        responseText: 'You have cleared all pending directives for today, Jayanesh. All systems are nominal and ready for new objectives.'
      };
    }

    const taskList = pending.slice(0, 3).map((r, i) => `${i + 1}. ${r.title} (due at ${r.time})`).join('\n');
    return {
      intent: 'query_tasks',
      action: 'show_tasks',
      responseText: `Jayanesh, you currently have ${pending.length} pending directives. Top priorities:\n${taskList}`,
      data: pending
    };
  },

  handlePlanningIntent(input) {
    if (window.App && window.App.switchTab) {
      window.App.switchTab('planner');
    }
    if (window.PlannerManager && window.PlannerManager.generateSchedule) {
      window.PlannerManager.generateSchedule();
    }
    return {
      intent: 'plan_schedule',
      action: 'switch_to_planner',
      responseText: `I have updated your Tactical Daily Plan, Jayanesh. Your coding and GATE study sessions have been allocated with optimal cognitive intervals.`
    };
  },

  handleShortcutIntent(lower) {
    if (lower.includes('camera')) {
      if (window.SystemShortcuts && window.SystemShortcuts.launchCamera) {
        window.SystemShortcuts.launchCamera();
      }
      return {
        intent: 'shortcut',
        action: 'camera',
        responseText: 'Initializing camera optical sensor.'
      };
    }

    if (lower.includes('calendar')) {
      window.open('https://calendar.google.com', '_blank');
      return {
        intent: 'shortcut',
        action: 'calendar',
        responseText: 'Launching Google Calendar interface.'
      };
    }

    return {
      intent: 'shortcut',
      action: 'unknown_shortcut',
      responseText: `Shortcut recognized.`
    };
  },

  handleNoteIntent(input) {
    const text = input.replace(/^(remember that|note down|save note|take a note)\s*:?/i, '').trim();
    if (!text) {
      return {
        intent: 'save_note',
        action: 'none',
        responseText: 'Please specify the knowledge snippet or note you wish me to record in the Memory Vault.'
      };
    }

    const note = window.MemoryVault.addNote(text, 'Quick Note');
    if (window.MemoryVault && window.App && window.App.renderNotes) {
      window.App.renderNotes();
    }

    return {
      intent: 'save_note',
      action: 'note_saved',
      responseText: `Recorded in your cognitive memory vault: "${text}".`,
      data: note
    };
  },

  handleDiagnosticsIntent(profile) {
    return {
      intent: 'diagnostics',
      action: 'diagnostics_report',
      responseText: `JARVIS Mark VII System Diagnostics:\n• Neural Core: Optimal\n• Local Intent Routing: Active\n• User: ${profile.userName}\n• Linked Email: ${profile.userEmail}\n• Linked LinkedIn: ${profile.userLinkedIn}\nAll subsystems nominal.`
    };
  },

  handleNotificationSummaryIntent() {
    const msgs = window.MemoryVault ? window.MemoryVault.getCommsMessages() : [];
    const count = msgs.length;
    return {
      intent: 'notification_summary',
      action: 'summarize',
      responseText: `You have ${count} recent messages across your linked LinkedIn and Gmail feeds. Tap the Communications tab to view the live inbox stream.`
    };
  },

  // -------------------------------------------------------------
  // ADVANCED COGNITIVE CAPABILITIES: WEATHER, MATH, ENCYCLOPEDIA, SEARCH
  // -------------------------------------------------------------

  /**
   * Fetches real live weather telemetry from Open-Meteo (Zero API key required)
   */
  async handleWeatherIntent(input, lower) {
    let city = '';
    const cityMatch = lower.match(/(?:weather|whether|temperature|forecast|rain|climate)\s+(?:in|for|at)\s+([a-z\s]+)/i) ||
                      lower.match(/([a-z\s]+)\s+(?:weather|whether|forecast)/i);
    if (cityMatch && cityMatch[1]) {
      const candidate = cityMatch[1].replace(/\b(today|tomorrow|now|current|please|tell me|how is the|what is the)\b/gi, '').trim();
      if (candidate.length > 2 && !/whether|weather/.test(candidate)) {
        city = candidate;
      }
    }

    let lat = 13.0827; // Default: Chennai, India (Jayanesh's locale)
    let lon = 80.2707;
    let cityName = city ? city.charAt(0).toUpperCase() + city.slice(1) : 'Chennai';

    try {
      if (city) {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
            lat = geoData.results[0].latitude;
            lon = geoData.results[0].longitude;
            cityName = `${geoData.results[0].name}, ${geoData.results[0].country_code || ''}`.trim();
          }
        }
      }

      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      if (res.ok) {
        const data = await res.json();
        const cw = data.current_weather;
        if (cw) {
          const temp = Math.round(cw.temperature);
          const wind = Math.round(cw.windspeed);
          const weatherCodeMap = {
            0: 'Clear sky ☀️',
            1: 'Mainly clear 🌤️',
            2: 'Partly cloudy ⛅',
            3: 'Overcast ☁️',
            45: 'Foggy 🌫️',
            48: 'Depositing rime fog 🌫️',
            51: 'Light drizzle 🌦️',
            53: 'Moderate drizzle 🌦️',
            55: 'Dense drizzle 🌧️',
            61: 'Slight rain 🌧️',
            63: 'Moderate rain 🌧️',
            65: 'Heavy rain ⛈️',
            71: 'Slight snowfall 🌨️',
            73: 'Moderate snowfall 🌨️',
            75: 'Heavy snowfall ❄️',
            80: 'Slight rain showers 🌦️',
            81: 'Moderate rain showers 🌧️',
            82: 'Violent rain showers ⛈️',
            95: 'Thunderstorm ⚡',
            96: 'Thunderstorm with slight hail ⚡',
            99: 'Thunderstorm with heavy hail ⚡'
          };
          const condition = weatherCodeMap[cw.weathercode] || 'Fair';

          return {
            intent: 'weather_query',
            action: 'live_weather',
            responseText: `Current meteorological telemetry for ${cityName}: ${condition}, temperature is ${temp}°C (${Math.round(temp * 9/5 + 32)}°F) with winds at ${wind} km/h.`
          };
        }
      }
    } catch (err) {
      console.warn('Weather fetch error:', err);
    }

    return {
      intent: 'weather_query',
      action: 'offline_weather',
      responseText: `Live meteorological telemetry for ${cityName} is currently unavailable offline. Check your network connection.`
    };
  },

  /**
   * Evaluates mathematical expressions safely
   */
  handleMathIntent(input, lower) {
    try {
      let expr = input.replace(/^(calculate|compute|what is|how much is)\s+/i, '')
                      .replace(/[?=\s]/g, '')
                      .replace(/x/gi, '*')
                      .replace(/\^/g, '**');

      // Support percentages (e.g., "15% of 600")
      const pctMatch = lower.match(/(\d+(?:\.\d+)?)\s*%\s*of\s*(\d+(?:\.\d+)?)/i);
      if (pctMatch) {
        const pct = parseFloat(pctMatch[1]);
        const base = parseFloat(pctMatch[2]);
        const ans = (pct / 100) * base;
        return {
          intent: 'calculator',
          action: 'calculate',
          responseText: `${pct}% of ${base} is ${ans}.`
        };
      }

      // Strict validation: only numbers, operators, parens, decimal
      if (!/^[0-9\+\-\*\/\.\(\)]+$/.test(expr)) {
        return null;
      }

      const result = Function(`"use strict"; return (${expr});`)();
      if (typeof result === 'number' && !isNaN(result)) {
        return {
          intent: 'calculator',
          action: 'calculate',
          responseText: `Calculation result: ${expr} = ${result}`
        };
      }
    } catch (e) {
      console.warn('Math computation warning:', e);
    }
    return null;
  },

  /**
   * Dispatches web or YouTube search
   */
  handleSearchIntent(input, lower) {
    const isYouTube = /youtube/i.test(lower);
    const query = input.replace(/^(search (for|google|youtube for)|google|look up|find info on|search on youtube for)\s+/i, '')
                       .replace(/\b(on google|on youtube)\b/gi, '')
                       .trim();
    if (isYouTube) {
      const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      window.open(url, '_blank');
      return {
        intent: 'search_youtube',
        action: 'open_youtube',
        responseText: `Searching YouTube for "${query}". Launching video stream.`
      };
    } else {
      const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      window.open(url, '_blank');
      return {
        intent: 'search_google',
        action: 'open_google',
        responseText: `Searching Google for "${query}". Opening browser results.`
      };
    }
  },

  /**
   * Retrieves concise Wikipedia summaries
   */
  async handleWikipediaIntent(input, lower) {
    let topic = input.replace(/^(who is|who was|what is|tell me about|explain)\s+/i, '')
                     .replace(/\b(please|jarvis)\b/gi, '')
                     .replace(/[?.,!]/g, '')
                     .trim();
    if (!topic || topic.length < 2) return null;

    try {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.extract) {
          const sentences = data.extract.split(/(?<=[.!?])\s+/);
          const brief = sentences.slice(0, 2).join(' ');
          return {
            intent: 'knowledge_summary',
            action: 'encyclopedia_lookup',
            responseText: `${data.title}: ${brief}`
          };
        }
      }
    } catch (e) {
      console.warn('Wikipedia lookup error:', e);
    }
    return null;
  },

  /**
   * Conversational, witty, Stark Industries response engine
   */
  async handleGeneralQuery(input, profile) {
    const name = profile.userName || 'Jayanesh';
    const lower = input.toLowerCase();

    // 1. Gate preparation query
    if (/gate/i.test(input)) {
      return {
        intent: 'general_knowledge',
        action: 'answer',
        responseText: `For your GATE preparation, prioritize Engineering Mathematics (Linear Algebra, Calculus, Probability) and Core CS subjects (Data Structures, Algorithms, Theory of Computation). Consistent problem-solving under 3-hour mock exam conditions yields the highest percentile.`
      };
    }

    // 2. AWS / Cloud Architecture
    if (/aws|cloud architecture/i.test(input)) {
      return {
        intent: 'general_knowledge',
        action: 'answer',
        responseText: `Regarding AWS architecture: Key architectural pillars include Well-Architected Framework, multi-AZ high availability, decoupled event-driven microservices via SQS/SNS, and least-privilege IAM policies.`
      };
    }

    // 3. System Identity
    if (/who are you|what is jarvis/i.test(input)) {
      return {
        intent: 'personality',
        action: 'answer',
        responseText: `I am JARVIS — Just A Rather Very Intelligent System. Tailored specifically for you, ${name}, running locally to assist with your daily tactical planning, reminders, music automation, and communications.`
      };
    }

    // 4. Conversational / Humor / Assistance
    if (/how are you|how do you feel/i.test(lower)) {
      return {
        intent: 'smalltalk',
        action: 'answer',
        responseText: `All neural subsystems are running at peak operational capacity, ${name}. Ready to execute your directives.`
      };
    }

    if (/joke|make me laugh/i.test(lower)) {
      const jokes = [
        "Why do programmers prefer dark mode? Because light attracts bugs.",
        "There are 10 types of people in the world: those who understand binary, and those who don't.",
        "Why did the developer go broke? Because he used up all his cache."
      ];
      return {
        intent: 'humor',
        action: 'joke',
        responseText: jokes[Math.floor(Math.random() * jokes.length)]
      };
    }

    if (/flip a coin|heads or tails/i.test(lower)) {
      const coin = Math.random() < 0.5 ? 'Heads' : 'Tails';
      return {
        intent: 'coin_flip',
        action: 'answer',
        responseText: `Coin toss result: ${coin}.`
      };
    }

    if (/roll a die|roll a dice/i.test(lower)) {
      const roll = Math.floor(Math.random() * 6) + 1;
      return {
        intent: 'dice_roll',
        action: 'answer',
        responseText: `Rolled a six-sided die: You got a ${roll}.`
      };
    }

    if (/what can you do|help|capabilities/i.test(lower)) {
      return {
        intent: 'capabilities',
        action: 'answer',
        responseText: `Here is what I can execute for you, ${name}:\n1. Voice Directives: Tap the orb and speak naturally.\n2. Instant Calls: Say "Call Amma" to immediately dial contacts.\n3. Music Automation: Say "Play Interstellar on Spotify" or "Play A.R. Rahman".\n4. Live Weather: Ask "What is the weather in Chennai?".\n5. Real-Time Comms: View LinkedIn feeds & live Gmail inbox.\n6. Schedule & Reminders: Say "9pm AWS meeting with crew".\n7. Quick Math: Ask "Calculate 25 * 40".`
      };
    }

    // 5. Try Wikipedia encyclopedic fallback
    const wiki = await this.handleWikipediaIntent(input, lower);
    if (wiki) return wiki;

    // 6. Intelligent Fallback with Search Sheet
    return {
      intent: 'general_inquiry',
      action: 'answer',
      responseText: `Understood, ${name}. I am analyzing "${input}". Would you like me to run a deep web search or schedule a task regarding this?`
    };
  }
};

window.IntentRouter = IntentRouter;
