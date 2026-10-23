/**
 * JARVIS - System Shortcuts & Web Intents Dispatcher
 * Bridges web environment with device hardware and app URLs
 */

const SystemShortcuts = {
  init() {
    this.setupListeners();
  },

  setupListeners() {
    const btnCall = document.getElementById('btnShortcutCall');
    const btnEmail = document.getElementById('btnShortcutEmail');
    const btnCal = document.getElementById('btnShortcutCalendar');
    const btnLi = document.getElementById('btnShortcutLinkedin');
    const btnShare = document.getElementById('btnShortcutShare');
    const btnCam = document.getElementById('btnShortcutCamera');

    if (btnCall) btnCall.addEventListener('click', () => this.launchDialler());
    if (btnEmail) btnEmail.addEventListener('click', () => this.launchEmail());
    if (btnCal) btnCal.addEventListener('click', () => this.launchCalendar());
    if (btnLi) btnLi.addEventListener('click', () => this.launchLinkedIn());
    if (btnShare) btnShare.addEventListener('click', () => this.launchShareSheet());
    if (btnCam) btnCam.addEventListener('click', () => this.launchCamera());
  },

  launchDialler() {
    if (confirm('JARVIS: Launch system dialler interface?')) {
      window.location.href = 'tel:';
    }
  },

  launchEmail() {
    window.location.href = 'mailto:';
  },

  launchCalendar() {
    window.open('https://calendar.google.com', '_blank');
  },

  launchLinkedIn() {
    window.open('https://www.linkedin.com', '_blank');
  },

  launchShareSheet() {
    if (navigator.share) {
      navigator.share({
        title: 'JARVIS Personal AI Assistant',
        text: 'Deploying high-impact on-device AI operations with JARVIS.',
        url: window.location.href
      }).catch(err => console.log('Share dismissed', err));
    } else {
      if (window.App) window.App.showHudBanner('Web Share API not supported on this browser.', 'ℹ️');
    }
  },

  launchCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (window.App) window.App.showHudBanner('Camera API unavailable in this browser context.', '⚠️');
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (window.App) window.App.showHudBanner('Camera sensor online. Testing feed OK.', '📷');
        // Stop the tracks immediately after successful test
        setTimeout(() => {
          stream.getTracks().forEach(track => track.stop());
        }, 3000);
      })
      .catch((err) => {
        console.warn('Camera access denied or unavailable', err);
        if (window.App) window.App.showHudBanner('Camera permission was not granted.', '⚠️');
      });
  }
};

window.SystemShortcuts = SystemShortcuts;
