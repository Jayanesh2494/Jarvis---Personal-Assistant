/**
 * JARVIS - Personal Memory & Cognitive Vault
 * Local-First, Zero-Cloud Data Store using LocalStorage
 */

const STORAGE_KEYS = {
  PROFILE: 'jarvis_profile',
  REMINDERS: 'jarvis_reminders',
  NOTES: 'jarvis_notes',
  CHAT_HISTORY: 'jarvis_chat_history',
  PLANNER_CONFIG: 'jarvis_planner_config',
  CONTACTS: 'jarvis_contacts',
  COMMS_MESSAGES: 'jarvis_comms_messages'
};

const DEFAULT_PROFILE = {
  userName: 'Jayanesh',
  userEmail: 'jayaneshdhanakkotti@gmail.com',
  userLinkedIn: 'https://linkedin.com/in/jayanesh2494/',
  primaryGoal: 'Cracking GATE Examination & Building Advanced Edge AI Systems',
  learningInterests: 'Algorithms, System Design, Android Kotlin, PyTorch, Cloud Architecture',
  responseStyle: 'concise',
  autoVocalize: true,
  offlineFirst: true
};

const MemoryVault = {
  // --- Profile & Preferences ---
  getProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      const parsed = data ? JSON.parse(data) : {};
      // Ensure Jayanesh details are kept current if default was previously Commander
      if (parsed.userName === 'Commander') parsed.userName = 'Jayanesh';
      if (!parsed.userEmail) parsed.userEmail = 'jayaneshdhanakkotti@gmail.com';
      if (!parsed.userLinkedIn) parsed.userLinkedIn = 'https://linkedin.com/in/jayanesh2494/';
      return { ...DEFAULT_PROFILE, ...parsed };
    } catch (e) {
      console.warn('MemoryVault: Error loading profile, using default', e);
      return DEFAULT_PROFILE;
    }
  },

  saveProfile(profile) {
    try {
      const current = this.getProfile();
      const updated = { ...current, ...profile };
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('MemoryVault: Error saving profile', e);
      return null;
    }
  },

  // --- Contacts & Speed Dial (e.g. "Call Amma") ---
  getContacts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      if (data) return JSON.parse(data);
      const initial = {
        'amma': { name: 'Amma', phone: '' },
        'appa': { name: 'Appa', phone: '' }
      };
      this.saveContacts(initial);
      return initial;
    } catch (e) {
      return { 'amma': { name: 'Amma', phone: '' } };
    }
  },

  saveContacts(contacts) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
    } catch (e) {
      console.error('Error saving contacts', e);
    }
  },

  setContact(id, name, phone) {
    const contacts = this.getContacts();
    contacts[id.toLowerCase().trim()] = { name: name.trim(), phone: phone.trim() };
    this.saveContacts(contacts);
    return contacts;
  },

  getContactPhone(id) {
    const contact = this.searchContact(id);
    return contact ? contact.phone : '';
  },

  searchContact(query) {
    if (!query) return null;
    const q = query.toLowerCase().trim();
    const contacts = this.getContacts();

    // 1. Exact key match
    if (contacts[q] && contacts[q].phone) {
      return { id: q, ...contacts[q] };
    }

    // 2. Exact name match
    for (const [id, c] of Object.entries(contacts)) {
      if (c.name && c.name.toLowerCase().trim() === q && c.phone) {
        return { id, ...c };
      }
    }

    // 3. Name contains query or query contains name
    for (const [id, c] of Object.entries(contacts)) {
      const cName = (c.name || id).toLowerCase();
      if (c.phone && (cName.includes(q) || q.includes(cName))) {
        return { id, ...c };
      }
    }

    // 4. Token match (e.g. first name or last name match)
    const qTokens = q.split(/\s+/).filter(t => t.length > 1);
    for (const [id, c] of Object.entries(contacts)) {
      const cTokens = (c.name || id).toLowerCase().split(/\s+/);
      const matches = qTokens.some(qt => cTokens.some(ct => ct === qt || ct.startsWith(qt)));
      if (matches && c.phone) {
        return { id, ...c };
      }
    }

    return null;
  },

  importContacts(contactsList) {
    const contacts = this.getContacts();
    let count = 0;
    contactsList.forEach(c => {
      if (c && c.name && c.phone) {
        const id = c.name.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
        contacts[id] = { name: c.name.trim(), phone: c.phone.trim() };
        count++;
      }
    });
    this.saveContacts(contacts);
    return count;
  },

  // --- Communications: Linked LinkedIn & Gmail Inbox Feed ---
  getCommsMessages() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMMS_MESSAGES);
      if (data) return JSON.parse(data);
      const initial = [
        {
          id: 'msg_li_1',
          source: 'linkedin',
          sender: 'LinkedIn Messaging',
          preview: 'New connection request and message on your LinkedIn profile (Jayanesh).',
          link: 'https://www.linkedin.com/messaging/',
          time: '5m ago'
        },
        {
          id: 'msg_gm_1',
          source: 'gmail',
          sender: 'Google Mail (jayaneshdhanakkotti@gmail.com)',
          preview: 'GATE 2025 syllabus and examination registration updates.',
          link: 'https://mail.google.com/mail/u/0/#inbox',
          time: '25m ago'
        },
        {
          id: 'msg_li_2',
          source: 'linkedin',
          sender: 'Tech Community AWS Group',
          preview: 'Jayanesh, discussion reply on your Edge AI architecture post.',
          link: 'https://www.linkedin.com/messaging/',
          time: '1h ago'
        }
      ];
      this.saveCommsMessages(initial);
      return initial;
    } catch (e) {
      return [];
    }
  },

  saveCommsMessages(msgs) {
    try {
      localStorage.setItem(STORAGE_KEYS.COMMS_MESSAGES, JSON.stringify(msgs));
    } catch (e) {
      console.error('Error saving comms messages', e);
    }
  },

  addCommsMessage(source, sender, preview, link) {
    const msgs = this.getCommsMessages();
    msgs.unshift({
      id: 'msg_' + Date.now(),
      source,
      sender,
      preview,
      link,
      time: 'Just now'
    });
    this.saveCommsMessages(msgs);
    return msgs;
  },

  // --- Reminders & Tasks ---
  getReminders() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (data) return JSON.parse(data);
      const initial = [
        {
          id: 'rem_1',
          title: 'Study GATE: Engineering Mathematics & Discrete Structures',
          date: new Date().toISOString().split('T')[0],
          time: '19:00',
          priority: 'high',
          category: 'study',
          completed: false,
          createdAt: Date.now()
        },
        {
          id: 'rem_2',
          title: 'AWS Cloud Architecture Hands-on Laboratory',
          date: new Date().toISOString().split('T')[0],
          time: '21:30',
          priority: 'medium',
          category: 'coding',
          completed: false,
          createdAt: Date.now()
        }
      ];
      this.saveReminders(initial);
      return initial;
    } catch (e) {
      console.error('MemoryVault: Error loading reminders', e);
      return [];
    }
  },

  saveReminders(reminders) {
    try {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
      return reminders;
    } catch (e) {
      console.error('MemoryVault: Error saving reminders', e);
      return [];
    }
  },

  addReminder(reminder) {
    const reminders = this.getReminders();
    const newRem = {
      id: 'rem_' + Date.now(),
      completed: false,
      createdAt: Date.now(),
      ...reminder
    };
    reminders.unshift(newRem);
    this.saveReminders(reminders);
    return newRem;
  },

  updateReminder(id, updates) {
    const reminders = this.getReminders();
    const idx = reminders.findIndex(r => r.id === id);
    if (idx !== -1) {
      reminders[idx] = { ...reminders[idx], ...updates };
      this.saveReminders(reminders);
      return reminders[idx];
    }
    return null;
  },

  deleteReminder(id) {
    let reminders = this.getReminders();
    reminders = reminders.filter(r => r.id !== id);
    this.saveReminders(reminders);
    return reminders;
  },

  // --- Saved Notes & Snippets ---
  getNotes() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (data) return JSON.parse(data);
      const initial = [
        {
          id: 'note_1',
          text: 'GATE Priority Formulae: Time Complexity of Dijkstra with Min-Heap is O((V + E) log V). Dynamic Programming optimal substructure conditions.',
          category: 'GATE Notes',
          date: new Date().toLocaleDateString()
        },
        {
          id: 'note_2',
          text: 'AWS Project Highlight: Designed multi-AZ serverless pipeline with AWS Lambda, S3 Event triggers, and DynamoDB single-table design.',
          category: 'AWS Cloud',
          date: new Date().toLocaleDateString()
        }
      ];
      this.saveNotes(initial);
      return initial;
    } catch (e) {
      console.error('MemoryVault: Error loading notes', e);
      return [];
    }
  },

  saveNotes(notes) {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
      return notes;
    } catch (e) {
      console.error('MemoryVault: Error saving notes', e);
      return [];
    }
  },

  addNote(text, category = 'General') {
    const notes = this.getNotes();
    const newNote = {
      id: 'note_' + Date.now(),
      text,
      category,
      date: new Date().toLocaleDateString()
    };
    notes.unshift(newNote);
    this.saveNotes(notes);
    return newNote;
  },

  deleteNote(id) {
    let notes = this.getNotes();
    notes = notes.filter(n => n.id !== id);
    this.saveNotes(notes);
    return notes;
  },

  // --- Conversation History ---
  getChatHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
      if (data) return JSON.parse(data);
      const initial = [
        {
          sender: 'jarvis',
          text: 'Good day, Jayanesh. JARVIS Mark VII initialized and standing by. How may I assist your operations today?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      this.saveChatHistory(initial);
      return initial;
    } catch (e) {
      return [];
    }
  },

  saveChatHistory(history) {
    try {
      const trimmed = history.slice(-50);
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(trimmed));
    } catch (e) {
      console.error('MemoryVault: Error saving chat history', e);
    }
  },

  addChatMessage(sender, text) {
    const history = this.getChatHistory();
    const msg = {
      sender,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    history.push(msg);
    this.saveChatHistory(history);
    return msg;
  },

  clearChatHistory() {
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    return this.getChatHistory();
  },

  // --- Export & Wipe Safety ---
  exportAllData() {
    const fullBackup = {
      exportTimestamp: new Date().toISOString(),
      profile: this.getProfile(),
      contacts: this.getContacts(),
      commsMessages: this.getCommsMessages(),
      reminders: this.getReminders(),
      notes: this.getNotes(),
      chatHistory: this.getChatHistory()
    };
    const jsonStr = JSON.stringify(fullBackup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jarvis-backup-jayanesh-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  wipeAllData() {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }
};

window.MemoryVault = MemoryVault;
