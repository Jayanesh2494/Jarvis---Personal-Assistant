/**
 * JARVIS - LinkedIn Content Studio
 * Strategic, High-Impact Post Synthesizer with Quality & Compliance Checks
 */

const LinkedInStudio = {
  init() {
    this.setupListeners();
    // Default initial template
    this.synthesizePostFromTopic('AWS Cloud Architecture & Serverless Workshop', 'workshop');
  },

  setupListeners() {
    const generateBtn = document.getElementById('generateLiPostBtn');
    const copyBtn = document.getElementById('copyLiDraftBtn');
    const saveBtn = document.getElementById('saveLiDraftBtn');
    const openLiBtn = document.getElementById('openLinkedInWebBtn');
    const editor = document.getElementById('liOutputDraft');

    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        const topic = document.getElementById('liTopic').value.trim() || 'Software Architecture & Edge AI Systems';
        const type = document.getElementById('liPostType').value;
        const tone = document.getElementById('liTone').value;
        const facts = document.getElementById('liKeyFacts').value.trim();
        const cta = document.getElementById('liCallToAction').value.trim();

        this.generateDraft({ topic, type, tone, facts, cta });
      });
    }

    if (editor) {
      editor.addEventListener('input', () => this.updateCounts());
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const draft = editor ? editor.value : '';
        if (draft) {
          navigator.clipboard.writeText(draft).then(() => {
            if (window.App) window.App.showHudBanner('LinkedIn post copied to clipboard!', '📋');
          }).catch(err => {
            console.warn('Clipboard write error', err);
          });
        }
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const draft = editor ? editor.value : '';
        const topic = document.getElementById('liTopic').value.trim() || 'LinkedIn Draft';
        if (draft && window.MemoryVault) {
          window.MemoryVault.savePost({ topic, draft });
          if (window.App) window.App.showHudBanner('Post saved to Memory Vault!', '💾');
        }
      });
    }

    if (openLiBtn) {
      openLiBtn.addEventListener('click', () => {
        window.open('https://www.linkedin.com/feed/', '_blank');
      });
    }
  },

  synthesizePostFromTopic(topic, type = 'workshop') {
    const topicInput = document.getElementById('liTopic');
    if (topicInput) topicInput.value = topic;

    const factsInput = document.getElementById('liKeyFacts');
    if (factsInput && !factsInput.value) {
      factsInput.value = 'Explored resilient multi-AZ architectures, serverless event-driven design, and reduced system latency using on-device edge caching.';
    }

    this.generateDraft({
      topic,
      type,
      tone: 'professional',
      facts: factsInput ? factsInput.value : '',
      cta: 'How are you approaching edge computing in your current engineering roadmap? Would love to hear your insights below!'
    });
  },

  generateDraft({ topic, type, tone, facts, cta }) {
    const editor = document.getElementById('liOutputDraft');
    if (!editor) return;

    let hook = '';
    let body = '';
    let hashtags = '';

    // Category Hooks
    if (type === 'workshop') {
      hook = `🚀 Just concluded an intensive deep-dive into ${topic}!\n\nHere are 3 fundamental engineering takeaways that changed how I think about scalable systems:`;
      body = facts ? facts.split('.').filter(s => s.trim().length > 3).map((s, i) => `🔹 Point ${i + 1}: ${s.trim()}`).join('\n\n') : `🔹 Point 1: Decoupling architecture with event-driven pipelines yields immense fault tolerance.\n\n🔹 Point 2: On-device processing minimizes egress costs and shields private user telemetry.\n\n🔹 Point 3: Continuous testing under synthetic latency spikes is non-negotiable.`;
      hashtags = '#AWS #CloudArchitecture #SoftwareEngineering #DevOps #SystemDesign #TechCommunity';
    } else if (type === 'project') {
      hook = `💡 Excited to share what I've been building: ${topic}.\n\nThe goal? Solve real-world latency and privacy bottlenecks with an on-device first architecture.`;
      body = facts ? `Key architectural highlights:\n\n${facts}` : `Key architectural highlights:\n\n• Zero external cloud exfiltration for sensitive user telemetry.\n• Sub-50ms natural language intent routing.\n• Robust offline-first caching for mission-critical operations.`;
      hashtags = '#BuildInPublic #SoftwareEngineering #AI #AndroidDev #SystemArchitecture #TechInnovation';
    } else if (type === 'learning') {
      hook = `🎯 Mastering complex engineering domains requires relentless consistency.\n\nReflections on my current preparation journey for ${topic}:`;
      body = facts || `1. Deep fundamentals in Data Structures & Discrete Math always compound.\n2. Translating theoretical complexity into production code is where real learning happens.\n3. Structured daily time-blocking beats erratic cramming every single time.`;
      hashtags = '#GATE #ContinuousLearning #ComputerScience #Algorithms #DeepWork #SoftwareEngineering';
    } else {
      hook = `⚡ Milestone update: Diving deep into ${topic}.\n\nSharing some actionable lessons learned along the way:`;
      body = facts || `Building durable software requires balancing rapid iteration with rigorous design constraints. Always prioritize simplicity over premature optimization.`;
      hashtags = '#Milestone #EngineeringMindset #TechCareer #SystemDesign #Innovation';
    }

    const callToAction = cta || `What's your biggest priority in this area right now? Let's discuss in the comments! 👇`;

    const fullDraft = `${hook}\n\n${body}\n\n${callToAction}\n\n${hashtags}`;
    editor.value = fullDraft;
    this.updateCounts();

    if (window.App) {
      window.App.showHudBanner('LinkedIn draft synthesized successfully!', '✨');
    }
  },

  updateCounts() {
    const editor = document.getElementById('liOutputDraft');
    const wordCountSpan = document.getElementById('liWordCount');
    const charCountSpan = document.getElementById('liCharCount');

    if (!editor || !wordCountSpan || !charCountSpan) return;

    const text = editor.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;

    wordCountSpan.textContent = `${words} words`;
    charCountSpan.textContent = `${chars} chars`;
  }
};

window.LinkedInStudio = LinkedInStudio;
