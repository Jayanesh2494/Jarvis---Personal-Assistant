/**
 * JARVIS - Communications & Direct Contacts Dispatcher
 * Synchronizes with LinkedIn, Gmail, and Direct Phone Calling (e.g. "Call Amma")
 */

const CommsManager = {
  currentFilter: 'all',
  isGmailConnected: false,

  init() {
    this.setupListeners();
    this.renderContacts();
    this.renderMessages();
    this.checkGmailStatus();
  },

  setupListeners() {
    // Quick Call Amma button on Dashboard & Comms
    const callAmmaDashBtn = document.getElementById('dashCallAmmaBtn');
    if (callAmmaDashBtn) {
      callAmmaDashBtn.addEventListener('click', () => this.callContact('amma'));
    }

    const commsCallAmmaBtn = document.getElementById('commsCallAmmaBtn');
    if (commsCallAmmaBtn) {
      commsCallAmmaBtn.addEventListener('click', () => this.callContact('amma'));
    }

    // Save Amma phone number
    const saveAmmaBtn = document.getElementById('saveAmmaPhoneBtn');
    const ammaPhoneInput = document.getElementById('ammaPhoneInput');
    if (saveAmmaBtn && ammaPhoneInput) {
      // Pre-fill existing phone
      const existing = window.MemoryVault ? window.MemoryVault.getContactPhone('amma') : '';
      if (existing) ammaPhoneInput.value = existing;

      saveAmmaBtn.addEventListener('click', () => {
        const phone = ammaPhoneInput.value.trim();
        if (window.MemoryVault) {
          window.MemoryVault.setContact('amma', 'Amma', phone);
          if (window.App) window.App.showHudBanner(`Amma's contact updated: ${phone || 'Not set'}`, '📞');
        }
      });
    }

    // Direct LinkedIn Links
    const openLiMsgBtn = document.getElementById('openLinkedInMessagesBtn');
    if (openLiMsgBtn) {
      openLiMsgBtn.addEventListener('click', () => {
        window.open('https://www.linkedin.com/messaging/', '_blank');
      });
    }

    const openLiProfBtn = document.getElementById('openLinkedInProfileBtn');
    if (openLiProfBtn) {
      openLiProfBtn.addEventListener('click', () => {
        window.open('https://linkedin.com/in/jayanesh2494/', '_blank');
      });
    }

    // Direct Gmail Links
    const openGmailInboxBtn = document.getElementById('openGmailInboxBtn');
    if (openGmailInboxBtn) {
      openGmailInboxBtn.addEventListener('click', () => {
        window.open('https://mail.google.com/mail/u/0/#inbox', '_blank');
      });
    }

    // 1-Tap Important Gmail Emails
    const openImpGmailBtn = document.getElementById('openImportantGmailBtn');
    if (openImpGmailBtn) {
      openImpGmailBtn.addEventListener('click', () => {
        window.open('https://mail.google.com/mail/u/0/#search/is%3Aimportant+is%3Aunread', '_blank');
      });
    }

    const openGmailComposeBtn = document.getElementById('openGmailComposeBtn');
    if (openGmailComposeBtn) {
      openGmailComposeBtn.addEventListener('click', () => {
        window.location.href = 'mailto:?from=jayaneshdhanakkotti@gmail.com';
      });
    }

    // Connect Gmail Modal Triggers
    const openModalBtn = document.getElementById('openConnectGmailModalBtn');
    const modal = document.getElementById('connectGmailModal');
    const closeModalBtn = document.getElementById('closeConnectGmailModalBtn');
    const cancelModalBtn = document.getElementById('cancelConnectGmailBtn');
    const form = document.getElementById('connectGmailForm');

    if (openModalBtn && modal) {
      openModalBtn.addEventListener('click', () => modal.classList.remove('hidden'));
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
        const pwdInput = document.getElementById('gmailAppPasswordInput');
        const pwd = pwdInput ? pwdInput.value.trim() : '';
        if (pwd) {
          this.connectGmailAppPassword(pwd);
        }
      });
    }

    // Sync Live Gmail Button
    const syncBtn = document.getElementById('syncLiveGmailBtn');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => this.fetchLiveGmail(true));
    }

    // Clear Sample Data Button
    const clearBtn = document.getElementById('clearSampleDataBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearSampleData());
    }

    // Sync / Import Phone Contacts (Android Native Contact Picker)
    const importContactsBtn = document.getElementById('importPhoneContactsBtn');
    if (importContactsBtn) {
      importContactsBtn.addEventListener('click', () => this.importPhoneContacts());
    }

    // Add Custom Contact
    const addContactBtn = document.getElementById('addCustomContactBtn');
    if (addContactBtn) {
      addContactBtn.addEventListener('click', () => {
        const name = prompt('Enter contact name (e.g. Appa, Brother, Team Lead):');
        if (name && name.trim()) {
          const phone = prompt(`Enter phone number for ${name.trim()}:`) || '';
          window.MemoryVault.setContact(name.trim(), name.trim(), phone.trim());
          this.renderContacts();
          if (window.App) window.App.showHudBanner(`Contact saved: ${name.trim()}`, '👤');
        }
      });
    }

    // Filter messages
    document.querySelectorAll('.comms-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.comms-filter-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentFilter = e.currentTarget.getAttribute('data-filter') || 'all';
        this.renderMessages();
      });
    });
  },

  async importPhoneContacts() {
    if ('contacts' in navigator && 'ContactsManager' in window && navigator.contacts.select) {
      try {
        const results = await navigator.contacts.select(['name', 'tel'], { multiple: true });
        if (results && results.length > 0) {
          const list = [];
          results.forEach(r => {
            const name = r.name && r.name[0] ? r.name[0] : 'Contact';
            const phone = r.tel && r.tel[0] ? r.tel[0] : '';
            if (phone) list.push({ name, phone });
          });
          const count = window.MemoryVault ? window.MemoryVault.importContacts(list) : 0;
          this.renderContacts();
          if (window.App) window.App.showHudBanner(`Imported ${count} contacts from phone!`, '📱');
        }
      } catch (e) {
        console.log('Contacts picker dismissed', e);
      }
    } else {
      // Direct instruction
      alert('Native Contact Picker is supported directly on Android Chrome. You can also quickly add contacts via "+ ADD CONTACT" or speak "Call <number>".');
    }
  },

  callContact(nameKey) {
    const key = (nameKey || '').toLowerCase().trim();
    let contact = null;
    if (window.MemoryVault && window.MemoryVault.searchContact) {
      contact = window.MemoryVault.searchContact(key);
    }
    const phone = contact ? contact.phone : (window.MemoryVault ? window.MemoryVault.getContactPhone(key) : '');

    if (phone && phone.replace(/\D/g, '').length >= 3) {
      const displayName = contact ? contact.name : nameKey;
      if (window.App) window.App.showHudBanner(`Calling ${displayName.toUpperCase()} (${phone}) immediately...`, '📞');
      window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
    } else {
      // Check native contact picker if available on Android
      if ('contacts' in navigator && 'ContactsManager' in window && navigator.contacts.select) {
        navigator.contacts.select(['name', 'tel'], { multiple: false })
          .then(results => {
            if (results && results[0] && results[0].tel && results[0].tel[0]) {
              const pickedName = results[0].name && results[0].name[0] ? results[0].name[0] : nameKey;
              const pickedPhone = results[0].tel[0];
              if (window.MemoryVault) {
                window.MemoryVault.setContact(nameKey, pickedName, pickedPhone);
              }
              this.renderContacts();
              window.location.href = `tel:${pickedPhone.replace(/\s+/g, '')}`;
            } else {
              window.location.href = 'tel:';
            }
          })
          .catch(() => {
            window.location.href = 'tel:';
          });
      } else {
        // Direct to dialler with zero prompt delay
        window.location.href = 'tel:';
      }
    }
  },

  renderContacts() {
    const container = document.getElementById('contactsListContainer');
    if (!container) return;

    const contacts = window.MemoryVault ? window.MemoryVault.getContacts() : {};
    const entries = Object.entries(contacts);

    if (entries.length === 0) {
      container.innerHTML = '<div style="color: var(--text-dim); font-size: 0.85rem;">No contacts saved.</div>';
      return;
    }

    container.innerHTML = entries.map(([key, data]) => `
      <div class="contact-pill-card">
        <div class="contact-info">
          <span class="contact-name">👤 ${this.escapeHtml(data.name || key)}</span>
          <span class="contact-phone">${data.phone ? this.escapeHtml(data.phone) : 'No phone set'}</span>
        </div>
        <button class="call-touch-btn" onclick="CommsManager.callContact('${key}')">
          📞 CALL
        </button>
      </div>
    `).join('');
  },

  renderMessages() {
    const container = document.getElementById('commsMessagesContainer');
    if (!container) return;

    const all = window.MemoryVault ? window.MemoryVault.getCommsMessages() : [];
    let filtered = all;

    if (this.currentFilter === 'linkedin') {
      filtered = all.filter(m => m.source === 'linkedin');
    } else if (this.currentFilter === 'gmail') {
      filtered = all.filter(m => m.source === 'gmail');
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-dim); font-size: 0.85rem;">
          <div style="font-size: 1.5rem; margin-bottom: 8px;">📬</div>
          <div>No active messages in this stream.</div>
          <div style="margin-top: 10px; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
            <button class="btn-action btn-cyan" onclick="CommsManager.fetchLiveGmail(true)">🔄 SYNC GMAIL NOW</button>
            <button class="btn-action" onclick="window.open('https://mail.google.com/mail/u/0/#search/is%3Aimportant+is%3Aunread', '_blank')">⭐ VIEW IMPORTANT IN GMAIL</button>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(m => `
      <div class="comms-message-card source-${m.source}">
        <div class="msg-header">
          <span class="msg-badge ${m.source}">${m.source === 'linkedin' ? '💼 LINKEDIN' : '✉️ GMAIL'}</span>
          <span class="msg-time">${m.time}</span>
        </div>
        <h4 class="msg-sender">${this.escapeHtml(m.sender)}</h4>
        <p class="msg-preview">${this.escapeHtml(m.preview || m.subject)}</p>
        <a href="${m.link}" target="_blank" class="msg-action-link">VIEW IN ${m.source.toUpperCase()} ➤</a>
      </div>
    `).join('');
  },

  async checkGmailStatus() {
    try {
      const res = await fetch('/api/gmail/status');
      if (res.ok) {
        const data = await res.json();
        this.isGmailConnected = data.connected;
        const tag = document.getElementById('gmailStatusTag');
        if (tag) {
          if (data.connected) {
            tag.textContent = '🟢 LIVE IMAP ACTIVE';
            tag.style.color = '#10b981';
          } else {
            tag.textContent = '🔑 CONNECT GOOGLE APP PWD';
            tag.style.color = '#f59e0b';
          }
        }
        if (data.connected) {
          this.fetchLiveGmail(false);
        }
      }
    } catch (e) {
      console.log('Gmail status check skipped', e);
    }
  },

  async connectGmailAppPassword(appPassword) {
    const submitBtn = document.getElementById('submitConnectGmailBtn');
    if (submitBtn) {
      submitBtn.textContent = 'CONNECTING TO IMAP...';
      submitBtn.disabled = true;
    }

    try {
      const res = await fetch('/api/gmail/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appPassword })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (window.App) window.App.showHudBanner(data.message, '✅');
        const modal = document.getElementById('connectGmailModal');
        if (modal) modal.classList.add('hidden');
        this.checkGmailStatus();
        this.fetchLiveGmail(true);
      } else {
        alert(data.error || 'Failed to authenticate. Ensure you generated a 16-character App Password at https://myaccount.google.com/apppasswords.');
      }
    } catch (e) {
      alert('Error connecting to backend: ' + e.message);
    } finally {
      if (submitBtn) {
        submitBtn.textContent = 'TEST & CONNECT INBOX';
        submitBtn.disabled = false;
      }
    }
  },

  async fetchLiveGmail(interactive = false) {
    try {
      if (interactive && window.App) window.App.showHudBanner('Fetching live important emails from imap.gmail.com...', '🔄');
      const res = await fetch('/api/gmail/important');
      const data = await res.json();

      if (data.status === 'connected' && Array.isArray(data.messages) && data.messages.length > 0) {
        // Save to MemoryVault
        const existing = window.MemoryVault ? window.MemoryVault.getCommsMessages() : [];
        const nonGmail = existing.filter(m => m.source !== 'gmail');
        const merged = [...data.messages, ...nonGmail];
        window.MemoryVault.saveCommsMessages(merged);
        this.renderMessages();

        if (interactive && window.App) {
          window.App.showHudBanner(`Synced ${data.messages.length} live important emails!`, '✉️');
        }
      } else if (data.status === 'needs_auth' && interactive) {
        const modal = document.getElementById('connectGmailModal');
        if (modal) modal.classList.remove('hidden');
      }
    } catch (e) {
      console.log('Error fetching live Gmail', e);
    }
  },

  clearSampleData() {
    if (confirm('Clear sample placeholder emails and messages to view only your real live communications?')) {
      if (window.MemoryVault) {
        window.MemoryVault.saveCommsMessages([]);
      }
      this.renderMessages();
      if (window.App) window.App.showHudBanner('Sample messages cleared. Ready for live feed.', '🧹');
    }
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

window.CommsManager = CommsManager;
