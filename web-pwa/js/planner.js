/**
 * JARVIS - Daily Tactical Planning & Algorithmic Time Allocator
 * Synthesizes structured schedules based on user goals, active reminders, and focus preferences.
 */

const PlannerManager = {
  init() {
    this.setupListeners();
    this.generateSchedule();
  },

  setupListeners() {
    const recalcBtn = document.getElementById('recalcPlanBtn');
    const applyBtn = document.getElementById('applyPlanSettingsBtn');
    const refreshDashBtn = document.getElementById('refreshPlannerBtn');

    if (recalcBtn) recalcBtn.addEventListener('click', () => this.generateSchedule());
    if (applyBtn) applyBtn.addEventListener('click', () => this.generateSchedule());
    if (refreshDashBtn) refreshDashBtn.addEventListener('click', () => this.generateSchedule());
  },

  generateSchedule() {
    const hoursInput = document.getElementById('availableHoursInput');
    const focusSelect = document.getElementById('primaryFocusInput');
    const container = document.getElementById('tacticalTimeline');
    const timestampTag = document.getElementById('planGeneratedTime');

    const totalHours = hoursInput ? parseFloat(hoursInput.value) || 6 : 6;
    const focus = focusSelect ? focusSelect.value : 'gate';
    const profile = window.MemoryVault ? window.MemoryVault.getProfile() : {};
    const reminders = window.MemoryVault ? window.MemoryVault.getReminders() : [];
    const pendingReminders = reminders.filter(r => !r.completed);

    if (timestampTag) {
      timestampTag.textContent = `SYNTHESIZED AT ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

    // Build timeline blocks
    const blocks = [];
    let currentHour = 9; // Start at 9:00 AM

    const formatTime = (h, m = 0) => {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      return `${displayH}:${String(m).padStart(2, '0')} ${ampm}`;
    };

    // 1. Morning Deep Work Block (Primary Focus)
    if (focus === 'gate') {
      blocks.push({
        time: `${formatTime(currentHour)} - ${formatTime(currentHour + 2)}`,
        title: 'Deep Work: GATE Engineering Mathematics & Algorithms',
        desc: 'Focus on high-yield topics (Linear Algebra Eigenvalues & Dynamic Programming recurrences). Peak morning focus period.',
        category: 'Study Deep Work',
        duration: 2
      });
      currentHour += 2;
    } else if (focus === 'coding') {
      blocks.push({
        time: `${formatTime(currentHour)} - ${formatTime(currentHour + 2)}`,
        title: 'Deep Work: Software Architecture & LeetCode Hard Sprints',
        desc: 'Tackle Graphs, Dijkstra optimizations, and System Design concepts while cognitive load capacity is highest.',
        category: 'Coding Sprint',
        duration: 2
      });
      currentHour += 2;
    } else {
      blocks.push({
        time: `${formatTime(currentHour)} - ${formatTime(currentHour + 2)}`,
        title: 'Deep Work: Project Architecture & Cloud Deployment',
        desc: 'AWS infrastructure, Dockerized microservices, or Edge AI model fine-tuning.',
        category: 'Cloud Engineering',
        duration: 2
      });
      currentHour += 2;
    }

    // 2. Tactical Break & Hydration
    blocks.push({
      time: `${formatTime(currentHour)} - ${formatTime(currentHour, 30)}`,
      title: 'Cognitive Reset & Review',
      desc: 'Step away from screen, hydrate, and prepare tactical notes for secondary sprint.',
      category: 'Rest & Recovery',
      duration: 0.5
    });
    currentHour += 0.5;

    // 3. Pending Reminders Integration
    if (pendingReminders.length > 0) {
      const topRem = pendingReminders[0];
      blocks.push({
        time: `${formatTime(Math.floor(currentHour))} - ${formatTime(Math.floor(currentHour + 1))}`,
        title: `Scheduled Directive: ${topRem.title}`,
        desc: `Integrated directly from your active reminder queue (Target: ${topRem.time}, Priority: ${topRem.priority.toUpperCase()}).`,
        category: 'High Priority Directive',
        duration: 1
      });
      currentHour += 1;
    }

    // 4. Secondary Skill & Practical Application Block
    const remainingTime = Math.max(1, totalHours - 3.5);
    const endH = Math.floor(currentHour + remainingTime);
    blocks.push({
      time: `${formatTime(Math.floor(currentHour))} - ${formatTime(endH)}`,
      title: focus === 'gate' ? 'Practical Lab: Hands-on Python & PyTorch Systems' : 'Theory Consolidation: GATE Core CS Syllabus',
      desc: 'Balancing theoretical foundations with high-impact applied software engineering.',
      category: 'Skill Synergy',
      duration: remainingTime
    });
    currentHour = endH;

    // 5. Evening Synthesis & Content Studio
    blocks.push({
      time: `7:00 PM - 7:45 PM`,
      title: 'LinkedIn Studio & Professional Milestone Review',
      desc: 'Document key workshop takeaways and publish architectural insights to build professional visibility.',
      category: 'Career Growth',
      duration: 0.75
    });

    if (container) {
      container.innerHTML = blocks.map(b => `
        <div class="timeline-block">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="timeline-time">${b.time} (${b.duration}h)</span>
            <span class="priority-pill medium">${b.category}</span>
          </div>
          <h4 class="timeline-heading">${b.title}</h4>
          <p class="timeline-details">${b.desc}</p>
        </div>
      `).join('');
    }

    if (window.App) {
      window.App.showHudBanner(`Tactical Plan generated: ${totalHours} hours allocated.`, '⚡');
      window.App.updateMetrics();
    }
  }
};

window.PlannerManager = PlannerManager;
