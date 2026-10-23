/**
 * JARVIS - Spotify Audio Automation & Media Engine
 * Supports Instant Deep-Link URI Automation & Spotify Web API Remote Control
 */

const SpotifyController = {
  CLIENT_ID_KEY: 'jarvis_spotify_client_id',
  ACCESS_TOKEN_KEY: 'jarvis_spotify_access_token',
  REFRESH_TOKEN_KEY: 'jarvis_spotify_refresh_token',
  TOKEN_EXPIRY_KEY: 'jarvis_spotify_token_expiry',

  // Curated Preset Automation Contexts
  PRESETS: {
    coding: {
      name: 'Deep Work // Coding Sprints',
      uri: 'spotify:playlist:37i9dQZF1DXdLEN7aqioXM', // Lo-Fi Beats
      webUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXdLEN7aqioXM'
    },
    stark: {
      name: 'Stark Lab // Synthwave Cyberpunk',
      uri: 'spotify:playlist:37i9dQZF1DXdLEN7aqioXM',
      webUrl: 'https://open.spotify.com/search/synthwave%20cyberpunk'
    },
    rahman: {
      name: 'A.R. Rahman Essentials',
      uri: 'spotify:search:AR%20Rahman',
      webUrl: 'https://open.spotify.com/search/AR%20Rahman'
    },
    focus: {
      name: 'Brain Food // Electronic Focus',
      uri: 'spotify:playlist:37i9dQZF1DXecP72eRVix1',
      webUrl: 'https://open.spotify.com/playlist/37i9dQZF1DXecP72eRVix1'
    }
  },

  init() {
    this.handleOAuthCallback();
    this.setupListeners();
    this.loadConfig();
    this.updateStatusUI();
  },

  async loadConfig() {
    const defaultId = '5a925f0b5243435388a491d4b127c13b';
    try {
      const res = await fetch('/api/spotify/config');
      if (res.ok) {
        const data = await res.json();
        const cid = data.clientId || defaultId;
        localStorage.setItem(this.CLIENT_ID_KEY, cid);
        const cidInput = document.getElementById('spotifyClientIdInput');
        if (cidInput) cidInput.value = cid;
      }
    } catch (e) {
      localStorage.setItem(this.CLIENT_ID_KEY, defaultId);
      const cidInput = document.getElementById('spotifyClientIdInput');
      if (cidInput) cidInput.value = defaultId;
    }
  },

  setupListeners() {
    // Preset buttons
    document.querySelectorAll('.spotify-preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const presetKey = e.currentTarget.getAttribute('data-preset');
        if (presetKey && this.PRESETS[presetKey]) {
          this.playPreset(presetKey);
        }
      });
    });

    // Custom song search input
    const searchBtn = document.getElementById('spotifySearchPlayBtn');
    const searchInput = document.getElementById('spotifySearchInput');
    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
          this.playMusic(query);
        }
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const query = searchInput.value.trim();
          if (query) {
            this.playMusic(query);
          }
        }
      });
    }

    // Media Control Buttons (Pause, Next, Prev)
    const pauseBtn = document.getElementById('spotifyPauseBtn');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.pauseMusic());
    }

    const nextBtn = document.getElementById('spotifyNextBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextTrack());
    }

    const prevBtn = document.getElementById('spotifyPrevBtn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousTrack());
    }

    // Connect Spotify Modal
    const connectBtn = document.getElementById('openSpotifyConnectBtn');
    const modal = document.getElementById('spotifyConnectModal');
    const closeBtn = document.getElementById('closeSpotifyModalBtn');
    const cancelBtn = document.getElementById('cancelSpotifyModalBtn');
    const form = document.getElementById('spotifyConnectForm');

    if (connectBtn && modal) {
      connectBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }
    if (cancelBtn && modal) {
      cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const cidInput = document.getElementById('spotifyClientIdInput');
        const clientId = cidInput ? cidInput.value.trim() : '';
        if (clientId) {
          this.startOAuthPKCE(clientId);
        }
      });
    }
  },

  /**
   * Main Dispatcher: Plays a song, artist, album, or playlist immediately
   */
  async playMusic(query) {
    const clean = (query || '').replace(/^(play\s+|song\s+|music\s+|on\s+spotify\s*)+/gi, '').trim();
    if (!clean) return;

    if (window.App) {
      window.App.showHudBanner(`Automating Spotify: "${clean}"...`, '🎵');
    }

    // Check if Spotify Web API token is available and valid
    const token = this.getValidAccessToken();
    if (token) {
      try {
        const success = await this.playViaWebAPI(clean, token);
        if (success) {
          this.updateNowPlayingUI(clean, 'Streaming via Spotify Connect');
          return;
        }
      } catch (e) {
        console.log('Web API play fallback to URI deep link:', e);
      }
    }

    // Zero-Auth Instant URI Automation (Triggers installed Spotify app or Web Player)
    this.playViaDeepLink(clean);
  },

  /**
   * Automation Mode A: Deep-Link URI (Zero setup required)
   * Automatically launches Spotify to the song and plays it
   */
  playViaDeepLink(query) {
    const encoded = encodeURIComponent(query);
    const spotifyUri = `spotify:search:${encoded}`;
    const webFallbackUrl = `https://open.spotify.com/search/${encoded}`;

    // Update Now Playing UI
    this.updateNowPlayingUI(query, 'Spotify Application Automation');

    // Trigger URI scheme (launches native Spotify App on Android/Windows/Mac)
    window.location.href = spotifyUri;

    // Optional desktop web fallback if app isn't active
    setTimeout(() => {
      // In case mobile OS didn't catch the scheme
      const link = document.getElementById('spotifyDirectWebLink');
      if (link) {
        link.href = webFallbackUrl;
        link.textContent = `Open "${query}" in Spotify Web ➤`;
        link.style.display = 'inline-block';
      }
    }, 1200);
  },

  /**
   * Automation Mode B: Spotify Web API Player
   */
  async playViaWebAPI(query, token) {
    // 1. Search for track
    const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist,playlist&limit=1`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!searchRes.ok) return false;
    const data = await searchRes.json();

    let playContext = null;
    let trackName = query;
    let artistName = 'Spotify';

    if (data.tracks && data.tracks.items && data.tracks.items.length > 0) {
      const track = data.tracks.items[0];
      playContext = { uris: [track.uri] };
      trackName = track.name;
      artistName = track.artists.map(a => a.name).join(', ');
    } else if (data.playlists && data.playlists.items && data.playlists.items.length > 0) {
      const pl = data.playlists.items[0];
      playContext = { context_uri: pl.uri };
      trackName = pl.name;
      artistName = 'Playlist';
    }

    if (!playContext) return false;

    // 2. Send play command to active Spotify device
    const playRes = await fetch('https://api.spotify.com/v1/me/player/play', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(playContext)
    });

    if (playRes.status === 204 || playRes.status === 200) {
      this.updateNowPlayingUI(trackName, artistName);
      return true;
    }

    return false;
  },

  async pauseMusic() {
    const token = this.getValidAccessToken();
    if (token) {
      try {
        await fetch('https://api.spotify.com/v1/me/player/pause', {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (window.App) window.App.showHudBanner('Spotify playback paused.', '⏸️');
      } catch (e) {
        console.log('Pause error', e);
      }
    } else {
      window.location.href = 'spotify:';
    }
  },

  async nextTrack() {
    const token = this.getValidAccessToken();
    if (token) {
      try {
        await fetch('https://api.spotify.com/v1/me/player/next', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (window.App) window.App.showHudBanner('Skipping to next Spotify track...', '⏭️');
      } catch (e) {
        console.log('Next error', e);
      }
    } else {
      window.location.href = 'spotify:';
    }
  },

  async previousTrack() {
    const token = this.getValidAccessToken();
    if (token) {
      try {
        await fetch('https://api.spotify.com/v1/me/player/previous', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (window.App) window.App.showHudBanner('Returning to previous Spotify track...', '⏮️');
      } catch (e) {
        console.log('Prev error', e);
      }
    } else {
      window.location.href = 'spotify:';
    }
  },

  playPreset(key) {
    const preset = this.PRESETS[key];
    if (!preset) return;

    if (window.App) {
      window.App.showHudBanner(`Launching Preset: ${preset.name}...`, '🎧');
    }

    this.updateNowPlayingUI(preset.name, 'Curated Directive');
    window.location.href = preset.uri;
  },

  updateNowPlayingUI(title, artist) {
    const titleEl = document.getElementById('spotifyNowPlayingTitle');
    const artistEl = document.getElementById('spotifyNowPlayingArtist');
    const badge = document.getElementById('spotifyStatusBadge');

    if (titleEl) titleEl.textContent = title;
    if (artistEl) artistEl.textContent = artist;
    if (badge) {
      badge.textContent = '🟢 PLAYING';
      badge.style.color = '#10b981';
      badge.style.borderColor = '#10b981';
    }
  },

  updateStatusUI() {
    const token = this.getValidAccessToken();
    const tag = document.getElementById('spotifyConnectionStatusTag');
    if (tag) {
      if (token) {
        tag.textContent = '🟢 SPOTIFY CONNECT ACTIVE';
        tag.style.color = '#10b981';
      } else {
        tag.textContent = '⚡ DEEP-LINK AUTOMATION ACTIVE';
        tag.style.color = '#00f2fe';
      }
    }
  },

  // --- Spotify OAuth PKCE Helper ---
  async startOAuthPKCE(clientId) {
    localStorage.setItem(this.CLIENT_ID_KEY, clientId);

    const verifier = this.generateRandomString(64);
    const challenge = await this.generateCodeChallenge(verifier);
    localStorage.setItem('spotify_code_verifier', verifier);

    const redirectUri = window.location.origin + window.location.pathname;
    const scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing app-remote-control streaming';

    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&scope=${encodeURIComponent(scope)}&code_challenge_method=S256&code_challenge=${encodeURIComponent(challenge)}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    window.location.href = authUrl;
  },

  async handleOAuthCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (!code) return;

    const verifier = localStorage.getItem('spotify_code_verifier');
    const clientId = localStorage.getItem(this.CLIENT_ID_KEY);
    if (!verifier || !clientId) return;

    const redirectUri = window.location.origin + window.location.pathname;

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          code_verifier: verifier
        })
      });

      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, data.access_token);
        if (data.refresh_token) localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refresh_token);
        localStorage.setItem(this.TOKEN_EXPIRY_KEY, Date.now() + (data.expires_in * 1000));

        // Clean URL query params
        window.history.replaceState({}, document.title, window.location.pathname);
        if (window.App) window.App.showHudBanner('Spotify Web API Connected Successfully!', '✅');
        this.updateStatusUI();
      }
    } catch (e) {
      console.error('Error exchanging Spotify code:', e);
    }
  },

  getValidAccessToken() {
    const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (token && expiry && Date.now() < parseInt(expiry, 10)) {
      return token;
    }
    return null;
  },

  generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },

  async generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
};

window.SpotifyController = SpotifyController;
