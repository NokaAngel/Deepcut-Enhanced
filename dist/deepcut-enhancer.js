(() => {
  const APP_ID = "deepcut-enhancer";
  const TRIGGER_ID = "deepcut-enhancer-trigger";
  const DEEPCUT_FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
  const STORAGE_KEY = "deepcut-enhancer.settings.v1";
  const STATE_KEY = "deepcut-enhancer.state.v1";
  const STYLE_ID = "deepcut-enhancer-site-style";
  const CUSTOM_STYLE_ID = "deepcut-enhancer-custom-style";

  if (window.__deepcutEnhancer?.version) {
    window.__deepcutEnhancer.togglePanel?.();
    return;
  }

  const DEFAULT_SETTINGS = {
    autobop: true,
    autoLame: false,
    smartBopCooldownSeconds: 16,
    autobopRandomDelay: true,
    skipBopWhenDj: true,
    autoQueue: false,
    autoQueueMentionTrigger: "deck me",
    showVolume: true,
    tempMute: false,
    nextDj: false,
    escortAfterSong: false,
    theme: "deep",
    stylePreset: "teal",
    accent: "#34d399",
    hideAudience: false,
    hideVideo: false,
    compactChat: false,
    chatTimestamps: false,
    desktopNotifications: true,
    chatNotifications: true,
    alertSnag: true,
    alertJoin: false,
    alertLeave: false,
    alertSongStats: false,
    hotbar: true,
    voteTracker: true,
    voteNotify: false,
    voteGuestHighlights: true,
    guestIdleMarkers: false,
    guestIdleMinutes: 15,
    reduceAnimations: false,
    siteUiFixes: true,
    keywords: [],
    afk: false,
    afkMessage: "I'm AFK right now, but I saw the mention.",
    idleAfk: false,
    idleAfkMinutes: 15,
    quickReplies: ["Nice one!", "Thanks!", "Be right back."],
    customCss: "",
    commandHotkey: true
  };

  const HOTBAR_ID = "dce-hotbar";

  const HOTBAR_ACTIONS = [
    { key: "autobop", label: "Bop" },
    { key: "autoQueue", label: "Queue" },
    { key: "nextDj", label: "Next" },
    { key: "afk", label: "AFK" },
    { key: "tempMute", label: "Mute" }
  ];

  const THEMES = {
    deep: {
      label: "Deep",
      css: `
        body { background: #101418 !important; }
        [class*="chat"], [class*="Chat"], [data-testid*="chat"] { scrollbar-color: var(--dce-accent) #17202a; }
      `
    },
    midnight: {
      label: "Midnight",
      css: `
        body { background: #090b10 !important; color: #f7f8fb !important; }
        button, input, textarea { border-color: rgba(255,255,255,.18) !important; }
      `
    },
    contrast: {
      label: "Contrast",
      css: `
        body { background: #050505 !important; color: #ffffff !important; }
        a, button { color: #ffffff !important; }
      `
    },
    clean: {
      label: "Clean",
      css: ""
    }
  };

  const STYLE_PRESETS = {
    blue: { label: "Blue", accent: "#008ddd", hue: "110deg" },
    green: { label: "Green", accent: "#3ca633", hue: "20deg" },
    pink: { label: "Pink", accent: "#ca5dc8", hue: "200deg" },
    purple: { label: "Purple", accent: "#886eef", hue: "155deg" },
    teal: { label: "Teal", accent: "#54bfb4", hue: "75deg" },
    custom: { label: "Custom", accent: "", hue: "75deg" }
  };

  const SELECTORS = {
    chrome: ".chrome",
    rightPanel: "ul.tabbed-panel.right-panel",
    chatFeed: [".chat .messages"],
    chatMessage: ".chat .messages .message",
    chatInput: ["#chat-input", "textarea.message-input"],
    chatForm: "#chat-form",
    profileLink: ".chrome a.profile-link, a.profile-link",
    awesomeButton: ".mini-room-view .awesome-button, #turntable .awesome-button",
    lameButton: ".mini-room-view .lame-button, #turntable .lame-button",
    becomeDjBtn: ".mini-djs .become-dj-btn, .become-dj-btn",
    songArtist: ".mini-room-view .songboard-artist.songboard-main, #turntable .songboard-artist.songboard-main",
    songTitle: ".mini-room-view .songboard-song.songboard-main, #turntable .songboard-song.songboard-main",
    currentDjName: ".mini-room-current-dj-name",
    roomTheme: ".mini-room-view .roomtheme, #turntable .roomtheme"
  };

  const roomBridge = {
    room: null,
    manager: null,
    api: null,
    readyLogged: false,

    reset() {
      this.room = null;
      this.manager = null;
      this.api = null;
    },

    getRoom() {
      if (this.room) return this.room;
      if (window.ttObjects?.room) {
        this.room = window.ttObjects.room;
        return this.room;
      }
      const turntable = window.turntable;
      if (!turntable) return null;
      
      // Try to find room by setupRoom method
      for (const key of Object.keys(turntable)) {
        const member = turntable[key];
        if (member && typeof member === "object" && typeof member.setupRoom !== "undefined") {
          this.room = member;
          return member;
        }
      }
      
      // Fallback to topViewController or roomData
      this.room = window.turntable?.topViewController || window.turntable?.topViewController?.roomData || null;
      return this.room;
    },

    getManager() {
      if (this.manager) return this.manager;
      if (window.ttObjects?.manager) {
        this.manager = window.ttObjects.manager;
        return this.manager;
      }
      const room = this.getRoom();
      if (!room) return null;
      for (const key of Object.keys(room)) {
        const member = room[key];
        if (member && typeof member === "object" && typeof member.blackswan !== "undefined") {
          this.manager = member;
          return member;
        }
      }
      return null;
    },

    getApi() {
      if (this.api) return this.api;
      if (window.ttObjects?.api) {
        this.api = window.ttObjects.api;
        return this.api;
      }
      const turntable = window.turntable;
      if (!turntable) return null;
      const apiRegex = / Preparing message /i;
      for (const key of Object.keys(turntable)) {
        const member = turntable[key];
        if (typeof member !== "function") continue;
        if (apiRegex.test(Function.prototype.toString.call(member))) {
          this.api = member;
          return member;
        }
      }
      
      // Fallback to sendMessage which deepcut.live (and TurnStyles) uses
      if (typeof window.turntable?.sendMessage === "function") {
        this.api = window.turntable.sendMessage.bind(window.turntable);
        return this.api;
      }
      
      return null;
    },

    isReady() {
      // Just need getRoom() or turntable to be ready, don't strictly require manager and api
      // since deepcut.live might not expose them in the same way.
      return Boolean(this.getRoom() || window.turntable?.sendMessage);
    }
  };

  function getTurntableView() {
    return window.turntable?.topViewController || null;
  }

  function getTurntableUser() {
    return window.turntable?.user || null;
  }

  function getUserId() {
    const user = getTurntableUser();
    return user?.id || user?.userid || null;
  }

  function getRoomData() {
    return getTurntableView()?.roomData || roomBridge.getRoom()?.roomData || null;
  }

  function hashToken(value) {
    const text = String(value);
    const sha1fn = window.$?.sha1 || window.jQuery?.sha1;
    if (sha1fn) return sha1fn(text);
    return fallbackSha1(text);
  }

  function fallbackSha1(message) {
    const rotateLeft = (n, s) => (n << s) | (n >>> (32 - s));
    const toHex = (val) => {
      let str = "";
      for (let i = 7; i >= 0; i -= 1) {
        str += ((val >>> (i * 4)) & 0x0f).toString(16);
      }
      return str;
    };
    const utf8 = unescape(encodeURIComponent(message));
    const words = [];
    for (let i = 0; i < utf8.length; i += 1) {
      words[i >> 2] |= utf8.charCodeAt(i) << (24 - (i % 4) * 8);
    }
    words[utf8.length >> 2] |= 0x80 << (24 - (utf8.length % 4) * 8);
    words[(((utf8.length + 8) >> 6) << 4) + 15] = utf8.length * 8;
    let h0 = 0x67452301;
    let h1 = 0xefcdab89;
    let h2 = 0x98badcfe;
    let h3 = 0x10325476;
    let h4 = 0xc3d2e1f0;
    for (let block = 0; block < words.length; block += 16) {
      const w = words.slice(block, block + 16);
      for (let i = 16; i < 80; i += 1) {
        w[i] = rotateLeft(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
      }
      let a = h0;
      let b = h1;
      let c = h2;
      let d = h3;
      let e = h4;
      for (let i = 0; i < 80; i += 1) {
        let f;
        let k;
        if (i < 20) {
          f = (b & c) | (~b & d);
          k = 0x5a827999;
        } else if (i < 40) {
          f = b ^ c ^ d;
          k = 0x6ed9eba1;
        } else if (i < 60) {
          f = (b & c) | (b & d) | (c & d);
          k = 0x8f1bbcdc;
        } else {
          f = b ^ c ^ d;
          k = 0xca62c1d6;
        }
        const temp = (rotateLeft(a, 5) + f + e + k + (w[i] | 0)) | 0;
        e = d;
        d = c;
        c = rotateLeft(b, 30);
        b = a;
        a = temp;
      }
      h0 = (h0 + a) | 0;
      h1 = (h1 + b) | 0;
      h2 = (h2 + c) | 0;
      h3 = (h3 + d) | 0;
      h4 = (h4 + e) | 0;
    }
    return [h0, h1, h2, h3, h4].map(toHex).join("");
  }

  function ensureRoomBridge() {
    roomBridge.getRoom();
    roomBridge.getManager();
    roomBridge.getApi();
    if (roomBridge.isReady() && !roomBridge.readyLogged) {
      roomBridge.readyLogged = true;
      log("Connected to deepcut.live room API.");
      refreshVoteStateFromRoom();
    }
    return roomBridge.isReady();
  }

  const VOLUME_WRAP_ID = "dce-volume-wrap";

  const ENHANCER_SECTIONS = [
    { id: "overview", label: "Now" },
    { id: "votes", label: "Votes" },
    { id: "auto", label: "Auto" },
    { id: "chat", label: "Chat" },
    { id: "look", label: "Look" },
    { id: "tools", label: "Tools" }
  ];

  const state = {
    settings: loadSettings(),
    mounted: false,
    panelOpen: false,
    activeSection: "overview",
    host: null,
    trigger: null,
    tabItem: null,
    pane: null,
    log: [],
    lastBopAt: 0,
    lastBopTrack: "",
    lastAutobopTrack: "",
    lastAutolameTrack: "",
    lastTrack: "",
    lastNotificationKey: "",
    mutedByEnhancer: false,
    priorMuteState: null,
    wasDj: false,
    lastActivityAt: Date.now(),
    chatSeen: new WeakSet(),
    lastAfkReplyAt: 0,
    observers: [],
    uiRemountTimer: 0,
    lastNowPlayingKey: "",
    hotbarHost: null,
    pendingBopTimer: 0,
    pendingLameTimer: 0,
    userActivity: new Map(),
    voteHooked: false,
    voteTracker: {
      up: new Map(),
      down: new Map(),
      names: {},
      switches: [],
      upCount: 0,
      downCount: 0
    }
  };

  const api = {
    version: "0.3.2",
    togglePanel,
    getSettings: () => ({ ...state.settings }),
    updateSetting
  };

  window.__deepcutEnhancer = api;
  mount();
  startAutomationLoops();
  initVoteTracking();
  wireExtensionMessages();

  function loadSettings() {
    try {
      const stored = { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
      return normalizeSettings(stored);
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function normalizeSettings(settings) {
    const next = { ...DEFAULT_SETTINGS };
    Object.keys(DEFAULT_SETTINGS).forEach((key) => {
      if (key in settings) next[key] = sanitizeSetting(key, settings[key]);
    });
    return next;
  }

  function saveSettings(options = {}) {
    const shouldRender = options.render !== false;
    applySiteStyles();
    syncHeaderVolume();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.settings));
    syncHotbar();
    if (shouldRender) render();
    else updateNowPlaying();
  }

  function rememberRuntimeState(patch) {
    const current = readRuntimeState();
    localStorage.setItem(STATE_KEY, JSON.stringify({ ...current, ...patch }));
  }

  function readRuntimeState() {
    try {
      return JSON.parse(localStorage.getItem(STATE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function mount() {
    if (state.mounted) return;
    state.mounted = true;
    applySiteStyles();
    mountEnhancerUi();
    syncHeaderVolume();

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && state.panelOpen) {
        event.preventDefault();
        selectChatTab();
        return;
      }
      if (!state.settings.commandHotkey) return;
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "e") {
        event.preventDefault();
        togglePanel();
      }
    });
    ["mousemove", "mousedown", "keydown", "touchstart", "wheel"].forEach((eventName) => {
      document.addEventListener(eventName, markActivity, { passive: true });
    });

    scheduleUiRemountCheck();
    syncUsername();
    mountHotbar();
    log("Deepcut Enhancer is running.");
  }

  function scheduleUiRemountCheck() {
    const panelRoot = document.querySelector(SELECTORS.chrome);
    if (!panelRoot) {
      state.uiRemountTimer = window.setTimeout(scheduleUiRemountCheck, 1500);
      return;
    }

    const uiObserver = new MutationObserver(() => {
      const hasTab = document.getElementById(APP_ID)?.classList.contains("dce-sidebar-tab");
      if (hasTab && document.getElementById(TRIGGER_ID)) return;
      if (state.uiRemountTimer) return;
      state.uiRemountTimer = window.setTimeout(() => {
        state.uiRemountTimer = 0;
        const tab = document.getElementById(APP_ID);
        if (!tab?.classList.contains("dce-sidebar-tab") || !document.getElementById(TRIGGER_ID)) mountEnhancerUi();
      }, 400);
    });
    uiObserver.observe(panelRoot, { childList: true, subtree: true });
    state.observers.push(uiObserver);
  }

  function cleanupLegacyUi() {
    document.querySelectorAll(`#${APP_ID}.dce-modal-root`).forEach((node) => node.remove());
    document.body.classList.remove("dce-modal-open");

    const legacy = document.getElementById(APP_ID);
    if (legacy?.classList.contains("dce-tab") && !legacy.classList.contains("dce-sidebar-tab")) {
      const panel = legacy.closest(".tabbed-panel");
      legacy.remove();
      if (panel) syncPanelTabCount(panel);
      selectFirstPanelTab(panel);
    }
  }

  function syncPanelTabCount(panel) {
    if (!panel) return;
    const count = panel.querySelectorAll(":scope > .tabbed-panel-tab").length;
    panel.className = panel.className.replace(/\btabs-\d+\b/g, "").trim();
    panel.classList.add(`tabs-${Math.min(Math.max(count, 1), 4)}`);
  }

  function selectFirstPanelTab(panel) {
    const first = panel?.querySelector(":scope > .tabbed-panel-tab");
    if (!first) return;
    selectPanelTab(first);
  }

  function selectPanelTab(tabEl) {
    const panel = tabEl?.closest(".tabbed-panel");
    if (!panel || !tabEl) return;
    panel.querySelectorAll(":scope > .tabbed-panel-tab").forEach((tab) => {
      const selected = tab === tabEl;
      tab.classList.toggle("selected", selected);
      tab.querySelector(":scope > .tab-item")?.classList.toggle("selected", selected);
    });
    state.panelOpen = tabEl.id === APP_ID;
    state.trigger?.classList.toggle("is-active", state.panelOpen);
  }

  function selectChatTab() {
    const panel = document.querySelector(SELECTORS.rightPanel);
    const chatTab = panel?.querySelector(":scope > .tabbed-panel-tab:not(.dce-sidebar-tab)");
    if (chatTab) selectPanelTab(chatTab);
    state.panelOpen = false;
    state.trigger?.classList.remove("is-active");
  }

  function selectEnhancerTab() {
    const tab = document.getElementById(APP_ID);
    if (!tab) return false;
    selectPanelTab(tab);
    state.panelOpen = true;
    state.trigger?.classList.add("is-active");
    render();
    tab.querySelector(".dce-subnav [data-section]")?.focus?.();
    return true;
  }

  function mountEnhancerUi() {
    cleanupLegacyUi();

    let tab = document.getElementById(APP_ID);
    let trigger = document.getElementById(TRIGGER_ID);
    const rightPanel = document.querySelector(SELECTORS.rightPanel);

    if (tab?.classList.contains("dce-sidebar-tab") && trigger && rightPanel) {
      state.host = tab;
      state.tabItem = tab.querySelector(".tab-item");
      state.trigger = trigger;
      state.pane = tab.querySelector(".tab-pane");
      if (!state.pane?.querySelector(".dce-panel")) render();
      else updateNowPlaying();
      return true;
    }

    if (!rightPanel) {
      setTimeout(mountEnhancerUi, 1000);
      return false;
    }

    if (!tab) {
      tab = document.createElement("li");
      tab.id = APP_ID;
      tab.className = "tabbed-panel-tab dce-sidebar-tab";
      tab.innerHTML = `
        <div class="tab-item">
          <div class="tab-icon">
            <span class="chrome-sprite chrome-gold-record dce-tab-icon" aria-hidden="true"></span>
          </div>
          <div class="tab-title">Enhancer</div>
        </div>
        <div class="tab-pane"></div>
      `;
      rightPanel.append(tab);
      syncPanelTabCount(rightPanel);

      tab.querySelector(".tab-item")?.addEventListener("click", (event) => {
        event.preventDefault();
        selectEnhancerTab();
      });
    }

    const headerButtons = document.querySelector(".chrome .header-buttons, .header-buttons");
    if (!trigger && headerButtons) {
      trigger = document.createElement("div");
      trigger.id = TRIGGER_ID;
      trigger.className = "dce-trigger";
      trigger.innerHTML = `
        <button type="button" class="dce-trigger-button" title="Deepcut Enhancer (Ctrl+Shift+E)" aria-label="Open Deepcut Enhancer">
          <span class="chrome-sprite chrome-gold-record dce-trigger-icon" aria-hidden="true"></span>
        </button>
      `;
      const settings = headerButtons.querySelector("#settings, .settings-dropdown");
      if (settings) headerButtons.insertBefore(trigger, settings);
      else headerButtons.append(trigger);
      trigger.querySelector("button").addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        togglePanel();
      });
    }

    state.host = tab;
    state.tabItem = tab.querySelector(".tab-item");
    state.trigger = trigger;
    state.pane = tab.querySelector(".tab-pane");
    render();
    return true;
  }

  function render() {
    if (!state.pane && !mountEnhancerUi()) return;
    const settings = state.settings;
    const section = state.activeSection || "overview";
    const themeOptions = Object.entries(THEMES)
      .map(([value, theme]) => `<option value="${value}" ${settings.theme === value ? "selected" : ""}>${escapeHtml(theme.label)}</option>`)
      .join("");
    const styleOptions = Object.entries(STYLE_PRESETS)
      .map(([value, style]) => `<option value="${value}" ${settings.stylePreset === value ? "selected" : ""}>${escapeHtml(style.label)}</option>`)
      .join("");
    const activeChips = [
      ["Autobop", settings.autobop],
      ["Queue", settings.autoQueue],
      ["Next DJ", settings.nextDj],
      ["AFK", settings.afk || settings.idleAfk],
      ["Alerts", settings.desktopNotifications],
      ["Hotbar", settings.hotbar],
      ["Votes", settings.voteTracker]
    ].filter(([, enabled]) => enabled);

    const scrollTop = state.pane.querySelector(".dce-panel")?.scrollTop || 0;
    state.pane.innerHTML = `
      <div class="dce-panel" aria-label="Deepcut Enhancer controls">
        <nav class="dce-subnav" aria-label="Enhancer sections">
          ${ENHANCER_SECTIONS.map((item) => `
            <button type="button" class="dce-subnav-btn${section === item.id ? " is-active" : ""}" data-section="${item.id}">${escapeHtml(item.label)}</button>
          `).join("")}
        </nav>

        <div class="dce-subpane${section === "overview" ? " is-active" : ""}" data-section-pane="overview">
          <div class="dce-hero">
            <div class="dce-hero-copy">
              <span class="dce-eyebrow">deepcut.live · Now Playing</span>
              <strong class="dce-song" data-now-song>${escapeHtml(currentSongSummary())}</strong>
              <small class="dce-dj" data-now-dj>${escapeHtml(currentDjSummary())}</small>
              <small class="dce-vote-tally" data-vote-tally>${escapeHtml(voteTallySummary())}</small>
            </div>
            <div class="dce-chips">
              ${activeChips.map(([label]) => `<span class="dce-chip">${escapeHtml(label)}</span>`).join("") || '<span class="dce-chip muted">Ready</span>'}
            </div>
          </div>
          <section class="dce-section dce-activity">
            <h3>Activity</h3>
            <ol class="log">${state.log.slice(-8).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
          </section>
        </div>

        <div class="dce-subpane${section === "votes" ? " is-active" : ""}" data-section-pane="votes">
          ${voteTrackerSection()}
        </div>

        <div class="dce-subpane${section === "auto" ? " is-active" : ""}" data-section-pane="auto">
          <section class="dce-section">
            <h3>Automation</h3>
            <div class="dce-grid">
              ${toggle("autobop", "Autobop", "Auto-awesome new songs.")}
              ${toggle("autoLame", "Autolame", "Auto-downvote new songs.")}
              ${toggle("skipBopWhenDj", "Skip Own Set", "Do not vote while you are DJ.")}
              ${toggle("autoQueue", "Auto Queue", "Join when your trigger appears in chat.")}
              ${toggle("nextDj", "Next DJ", "Take the next open deck once.")}
              ${toggle("escortAfterSong", "Escort", "Leave after your song changes.")}
              ${toggle("showVolume", "Show Volume", "Keep volume visible in the header.")}
              ${toggle("tempMute", "Temp Mute", "Mute for one song.")}
              ${toggle("autobopRandomDelay", "Random Vote Delay", "Humanize autobop/autolame timing.")}
            </div>
            <label class="dce-field">
              Queue trigger
              <input data-setting="autoQueueMentionTrigger" type="text" value="${escapeHtml(settings.autoQueueMentionTrigger)}">
            </label>
            <label class="dce-field">
              Bop cooldown (seconds)
              <input data-setting="smartBopCooldownSeconds" type="number" min="0" max="120" value="${escapeHtml(settings.smartBopCooldownSeconds)}">
            </label>
          </section>
        </div>

        <div class="dce-subpane${section === "chat" ? " is-active" : ""}" data-section-pane="chat">
          <section class="dce-section">
            <h3>Chat & Alerts</h3>
            <div class="dce-grid">
              ${toggle("desktopNotifications", "Desktop Alerts", "Song and keyword notifications.")}
              ${toggle("chatNotifications", "Keyword Alerts", "Notify on custom keywords.")}
              ${toggle("voteTracker", "Vote Tracker", "Show who bopped or lamed this song.")}
              ${toggle("voteNotify", "Vote Alerts", "Notify when someone switches bop/lame.")}
              ${toggle("voteGuestHighlights", "People Highlights", "Color People Here list by vote.")}
              ${toggle("guestIdleMarkers", "Idle Markers", "Show who has been quiet in People Here.")}
              ${toggle("alertSnag", "Snag Alerts", "Notify when someone snags a song.")}
              ${toggle("alertJoin", "Join Alerts", "Notify when users join the room.")}
              ${toggle("alertLeave", "Leave Alerts", "Notify when users leave the room.")}
              ${toggle("alertSongStats", "Song Stats", "Highlight spins and stats in chat.")}
              ${toggle("afk", "AFK Reply", "Reply once when mentioned.")}
              ${toggle("idleAfk", "Idle AFK", "Mark AFK after inactivity.")}
              ${toggle("chatTimestamps", "Timestamps", "Add compact local times.")}
              ${toggle("compactChat", "Compact Chat", "Denser message spacing.")}
            </div>
            <label class="dce-field">
              Keywords
              <input data-setting="keywords" type="text" value="${escapeHtml(settings.keywords.join(", "))}" placeholder="vinyl, house, your name">
            </label>
            <label class="dce-field">
              AFK message
              <input data-setting="afkMessage" type="text" value="${escapeHtml(settings.afkMessage)}">
            </label>
            <label class="dce-field">
              Idle minutes
              <input data-setting="idleAfkMinutes" type="number" min="1" max="240" value="${escapeHtml(settings.idleAfkMinutes)}">
            </label>
            <label class="dce-field">
              Guest idle threshold (minutes)
              <input data-setting="guestIdleMinutes" type="number" min="5" max="120" value="${escapeHtml(settings.guestIdleMinutes)}">
            </label>
            <div class="dce-quick">
              ${settings.quickReplies.map((reply, index) => quickReplyButton(reply, index)).join("")}
            </div>
            <label class="dce-field">
              Quick replies
              <input data-setting="quickReplies" type="text" value="${escapeHtml(settings.quickReplies.join(" | "))}" placeholder="Nice one! | Thanks! | BRB">
            </label>
          </section>
        </div>

        <div class="dce-subpane${section === "look" ? " is-active" : ""}" data-section-pane="look">
          <section class="dce-section">
            <h3>Appearance</h3>
            <div class="dce-grid">
              ${toggle("hideAudience", "Hide Audience", "Reduce crowd visual noise.")}
              ${toggle("hideVideo", "Hide Video", "Hide side screens and video.")}
              ${toggle("reduceAnimations", "Reduce Animations", "Tone down room avatar animations.")}
              ${toggle("siteUiFixes", "Site UI Fixes", "Fix profile stats, modals, and layout clipping.")}
              ${toggle("hotbar", "Quick Hotbar", "Floating one-click controls.")}
              ${toggle("commandHotkey", "Ctrl+Shift+E", "Keyboard shortcut for this sidebar.")}
            </div>
            <div class="dce-inline-fields">
              <label class="dce-field">
                Theme
                <select data-setting="theme">${themeOptions}</select>
              </label>
              <label class="dce-field">
                Style
                <select data-setting="stylePreset">${styleOptions}</select>
              </label>
            </div>
            <label class="dce-field dce-color-field">
              Accent
              <input data-setting="accent" type="color" value="${escapeHtml(settings.accent)}">
            </label>
            <label class="dce-field">
              Custom CSS
              <textarea data-setting="customCss" spellcheck="false" placeholder="body { ... }">${escapeHtml(settings.customCss)}</textarea>
            </label>
          </section>
        </div>

        <div class="dce-subpane${section === "tools" ? " is-active" : ""}" data-section-pane="tools">
          <section class="dce-section">
            <h3>Quick Tools</h3>
            <div class="dce-tools">
              <button data-action="search-youtube" type="button">YouTube</button>
              <button data-action="search-soundcloud" type="button">SoundCloud</button>
              <button data-action="casino-roll" type="button">Roll</button>
              <button data-action="show-love" type="button">Show Love</button>
            </div>
            <p class="dce-tools-note">Shortcuts for the current song and room.</p>
          </section>
          <section class="dce-section">
            <h3>Settings</h3>
            <div class="dce-actions">
              <button data-action="request-notifications" type="button">Enable Alerts</button>
              <button data-action="export" type="button">Export</button>
              <button data-action="import" type="button">Import</button>
              <button data-action="reset" type="button">Reset</button>
            </div>
          </section>
          <input class="dce-import" data-action="import-file" type="file" accept="application/json,.json">
        </div>
      </div>
    `;

    wirePanelEvents(settings);
    state.pane.querySelector(".dce-panel").scrollTop = scrollTop;
  }

  function switchSection(sectionId) {
    if (!ENHANCER_SECTIONS.some((item) => item.id === sectionId)) return;
    state.activeSection = sectionId;
    state.pane?.querySelectorAll(".dce-subnav-btn").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.section === sectionId);
    });
    state.pane?.querySelectorAll(".dce-subpane").forEach((pane) => {
      pane.classList.toggle("is-active", pane.dataset.sectionPane === sectionId);
    });
  }

  function wirePanelEvents(settings) {
    state.pane.querySelectorAll("[data-section]").forEach((button) => {
      button.addEventListener("click", () => switchSection(button.dataset.section));
    });
    state.pane.querySelectorAll("[data-toggle]").forEach((el) => {
      el.addEventListener("change", () => updateSetting(el.dataset.toggle, el.checked));
    });
    state.pane.querySelectorAll("[data-setting]").forEach((el) => {
      el.addEventListener("change", () => {
        const key = el.dataset.setting;
        const value = parseSettingValue(key, el.value);
        updateSetting(key, value);
      });
    });
    state.pane.querySelectorAll("[data-quick-reply]").forEach((el) => {
      el.addEventListener("click", () => sendChatMessage(settings.quickReplies[Number(el.dataset.quickReply)] || ""));
    });
    state.pane.querySelector('[data-action="request-notifications"]')?.addEventListener("click", requestNotifications);
    state.pane.querySelector('[data-action="export"]')?.addEventListener("click", exportSettings);
    state.pane.querySelector('[data-action="import"]')?.addEventListener("click", () => state.pane.querySelector('[data-action="import-file"]').click());
    state.pane.querySelector('[data-action="import-file"]')?.addEventListener("change", importSettings);
    state.pane.querySelector('[data-action="reset"]')?.addEventListener("click", resetSettings);
    state.pane.querySelector('[data-action="search-youtube"]')?.addEventListener("click", searchYouTube);
    state.pane.querySelector('[data-action="search-soundcloud"]')?.addEventListener("click", searchSoundCloud);
    state.pane.querySelector('[data-action="casino-roll"]')?.addEventListener("click", casinoRoll);
    state.pane.querySelector('[data-action="show-love"]')?.addEventListener("click", showTheLove);
    state.pane.querySelector('[data-action="vote-bop"]')?.addEventListener("click", () => voteSong("bop"));
    state.pane.querySelector('[data-action="vote-lame"]')?.addEventListener("click", () => voteSong("lame"));
  }

  function toggle(key, title, detail) {
    return `
      <label class="dce-toggle">
        <input data-toggle="${key}" type="checkbox" ${state.settings[key] ? "checked" : ""}>
        <span class="dce-toggle-ui" aria-hidden="true"></span>
        <span class="dce-toggle-copy">
          <b>${title}</b>
          <small>${detail}</small>
        </span>
      </label>
    `;
  }

  function quickReplyButton(reply, index) {
    if (!reply) return "";
    return `<button data-quick-reply="${index}" type="button">${escapeHtml(reply)}</button>`;
  }

  function parseSettingValue(key, value) {
    if (key === "keywords") return value.split(",").map((word) => word.trim()).filter(Boolean);
    if (key === "quickReplies") return value.split("|").map((reply) => reply.trim()).filter(Boolean).slice(0, 5);
    if (key === "idleAfkMinutes") return Math.min(Math.max(Number(value) || 15, 1), 240);
    if (key === "smartBopCooldownSeconds") return Math.min(Math.max(Number(value) || 16, 0), 120);
    if (key === "guestIdleMinutes") return Math.min(Math.max(Number(value) || 15, 5), 120);
    return value;
  }

  function panelCss() {
    return `
      #${APP_ID}, #${APP_ID} *, #${TRIGGER_ID}, #${TRIGGER_ID} * {
        box-sizing: border-box;
      }

      #${APP_ID}, #${TRIGGER_ID} {
        --dce-accent: ${state.settings.accent};
        --dce-blue: #0086b5;
        --dce-blue-dark: #006fa1;
        --dce-gold-top: #e3bf23;
        --dce-gold-bottom: #d7a31a;
        --dce-gold-text: #594608;
        --dce-chrome: #2f2f2f;
        --dce-panel-bg: #eeeeee;
        --dce-panel-surface: #ffffff;
        --dce-panel-border: #d8d8d8;
        --dce-panel-border-dark: #bfbfbf;
        --dce-panel-text: #282828;
        --dce-panel-muted: #888888;
        --dce-input-bg: #f7f7f7;
        --dce-font: ${DEEPCUT_FONT};
      }

      #${TRIGGER_ID} {
        display: inline-block;
        vertical-align: middle;
        padding: 0 6px;
      }

      #${TRIGGER_ID} .dce-trigger-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: auto;
        height: 42px;
        padding: 0 6px;
        border: 0;
        background: transparent;
        cursor: pointer;
        line-height: 0;
      }

      #${TRIGGER_ID} .dce-trigger-icon {
        display: block;
        margin: 0 auto;
        filter: drop-shadow(0 1px 1px rgba(0,0,0,.65));
      }

      #${TRIGGER_ID} .dce-trigger-button:hover .dce-trigger-icon,
      #${TRIGGER_ID}.is-active .dce-trigger-icon {
        filter: brightness(1.12) drop-shadow(0 0 6px rgba(227, 191, 35, .85));
      }

      .chrome .right-panel.tabbed-panel > .tabbed-panel-tab > .tab-pane,
      .chrome .left-panel.tabbed-panel > .tabbed-panel-tab > .tab-pane {
        left: 0 !important;
        right: 0 !important;
        width: 256px !important;
        max-width: 100%;
        box-sizing: border-box;
      }

      #${APP_ID}.dce-sidebar-tab .tab-pane {
        left: 0 !important;
        right: 0 !important;
        width: 256px !important;
        max-width: 100%;
        box-sizing: border-box;
        overflow: hidden;
      }

      #${APP_ID}.dce-sidebar-tab:not(.selected) .tab-pane {
        display: none !important;
      }

      #${APP_ID} .dce-panel {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        width: 100%;
        background: var(--dce-panel-bg);
        cursor: default;
        pointer-events: auto;
        container-type: inline-size;
        container-name: dce-panel;
        font: 13px/1.35 var(--dce-font);
        color: var(--dce-panel-text);
      }

      #${APP_ID} .dce-subnav {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0;
        flex: 0 0 auto;
        border-bottom: 1px solid #999;
        background: linear-gradient(to bottom, #eee, #ccc);
        box-shadow: inset 0 1px 0 #fff, 0 1px 0 #999;
      }

      #${APP_ID} .dce-subnav-btn {
        min-height: 34px;
        padding: 0 4px;
        border: 0;
        border-right: 1px solid #bbb;
        background: transparent;
        color: #666;
        font: 700 11px/1 var(--dce-font);
        text-transform: uppercase;
        letter-spacing: .03em;
        cursor: pointer;
        text-shadow: 0 1px 0 #fff;
      }

      #${APP_ID} .dce-subnav-btn:last-child {
        border-right: 0;
      }

      #${APP_ID} .dce-subnav-btn:hover {
        background: #fefce9;
        color: #444;
      }

      #${APP_ID} .dce-subnav-btn.is-active {
        background: linear-gradient(to bottom, var(--dce-gold-top), var(--dce-gold-bottom));
        color: var(--dce-gold-text);
        text-shadow: 0 1px 1px #644606;
        cursor: default;
      }

      #${APP_ID} .dce-subpane {
        display: none;
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
        overscroll-behavior: contain;
      }

      #${APP_ID} .dce-subpane.is-active {
        display: block;
      }

      #${APP_ID} .dce-hero {
        display: grid;
        gap: 10px;
        padding: 12px;
        border-bottom: 1px solid var(--dce-panel-border);
        background: var(--dce-panel-surface);
        box-shadow: 0 1px 0 #fff;
      }

      #${APP_ID} .dce-eyebrow {
        display: block;
        margin-bottom: 4px;
        color: var(--dce-panel-muted);
        font-size: 11px;
        font-weight: 700;
        letter-spacing: .04em;
        text-transform: uppercase;
      }

      #${APP_ID} .dce-song {
        display: block;
        overflow-wrap: anywhere;
        word-break: break-word;
        white-space: normal;
        font-size: 15px;
        font-weight: 700;
        line-height: 1.3;
        color: var(--dce-panel-text);
      }

      #${APP_ID} .dce-dj {
        display: block;
        margin-top: 4px;
        overflow-wrap: anywhere;
        word-break: break-word;
        white-space: normal;
        font-size: 12px;
        line-height: 1.35;
        color: var(--dce-panel-muted);
      }

      #${APP_ID} .dce-vote-tally,
      #${APP_ID} .dce-vote-summary {
        display: block;
        margin-top: 6px;
        font-size: 12px;
        color: var(--dce-blue);
        font-weight: 700;
      }

      #${APP_ID} .dce-vote-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding: 12px 12px 0;
      }

      #${APP_ID} .dce-vote-btn {
        min-height: 36px;
        border-radius: 4px;
        border: 1px solid #444;
        font: 700 12px/1 var(--dce-font);
        cursor: pointer;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.35), 0 1px 2px rgba(0,0,0,.25);
      }

      #${APP_ID} .dce-vote-btn.bop {
        background: linear-gradient(to bottom, #6ec125, #42801a);
        color: #fff;
        text-shadow: 0 1px 1px rgba(0,0,0,.45);
      }

      #${APP_ID} .dce-vote-btn.lame {
        background: linear-gradient(to bottom, #b21212, #800000);
        color: #fff;
        text-shadow: 0 1px 1px rgba(0,0,0,.45);
      }

      #${APP_ID} .dce-vote-btn:hover {
        filter: brightness(1.08);
      }

      #${APP_ID} .dce-vote-summary {
        padding: 0 12px 8px;
        margin-top: 0;
      }

      #${APP_ID} .dce-vote-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding: 10px 12px 0;
      }

      #${APP_ID} .dce-vote-list {
        margin: 0;
        padding: 8px 10px 10px 22px;
        min-height: 54px;
        border: 1px solid var(--dce-panel-border);
        border-radius: 4px;
        background: #fff;
        color: var(--dce-panel-text);
        font-size: 12px;
        line-height: 1.45;
        box-shadow: inset 0 0 0 1px #444;
      }

      #${APP_ID} .dce-vote-list li {
        margin: 0 0 4px;
      }

      #${APP_ID} .dce-vote-list.bop {
        border-color: #9eca9e;
        background: #f6fff6;
      }

      #${APP_ID} .dce-vote-list.lame {
        border-color: #e0a0a0;
        background: #fff6f6;
      }

      #${APP_ID} .dce-vote-list .empty {
        list-style: none;
        margin-left: -12px;
        color: var(--dce-panel-muted);
      }

      #${APP_ID} .dce-vote-switches {
        margin: 0;
        padding: 8px 12px 12px 28px;
        color: var(--dce-panel-muted);
        font-size: 12px;
      }

      #${APP_ID} .dce-vote-switches li.switch {
        color: #644d0d;
        font-weight: 600;
      }

      #${APP_ID} .dce-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      #${APP_ID} .dce-chip {
        display: inline-flex;
        align-items: center;
        min-height: 22px;
        padding: 0 8px;
        border: 1px solid #c5ad3d;
        border-radius: 999px;
        background: linear-gradient(to bottom, var(--dce-gold-top), var(--dce-gold-bottom));
        color: var(--dce-gold-text);
        font-size: 11px;
        font-weight: 700;
        line-height: 1;
        box-shadow: 0 1px 2px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.45);
      }

      #${APP_ID} .dce-chip.muted {
        border-color: var(--dce-panel-border-dark);
        background: linear-gradient(to bottom, #f5f5f5, #d8d8d8);
        color: #666;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.68);
      }

      #${APP_ID} .dce-section {
        margin: 10px 12px;
        border: 1px solid #444;
        border-radius: 5px;
        background: var(--dce-panel-surface);
        overflow: hidden;
        box-shadow: inset 0 0 0 1px #444;
      }

      #${APP_ID} .dce-section h3 {
        margin: 0;
        padding: 10px 12px;
        border-bottom: 1px solid #999;
        background: linear-gradient(to bottom, #eee, #ccc);
        color: #666;
        font-size: 12px;
        font-weight: 700;
        line-height: 1;
        letter-spacing: .02em;
        text-transform: uppercase;
        text-shadow: 0 1px 0 #fff;
        box-shadow: inset 0 1px 0 #fff, 0 1px 0 #999;
      }

      #${APP_ID} .dce-grid {
        display: grid;
        gap: 0;
        grid-template-columns: 1fr;
      }

      #${APP_ID} .dce-toggle {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        min-height: 0;
        padding: 10px 12px;
        border-bottom: 1px solid #e6e6e6;
        background: #fff;
        color: var(--dce-panel-text);
        cursor: pointer;
      }

      #${APP_ID} .dce-toggle:nth-child(even) {
        background: #f6f6f6;
      }

      #${APP_ID} .dce-toggle:last-child {
        border-bottom: 0;
      }

      #${APP_ID} .dce-toggle:hover {
        background: #fefce9;
      }

      #${APP_ID} .dce-toggle input {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }

      #${APP_ID} .dce-toggle-copy {
        flex: 1 1 auto;
        min-width: 0;
      }

      #${APP_ID} .dce-toggle-ui {
        position: relative;
        flex: 0 0 42px;
        width: 42px;
        height: 22px;
        margin-left: auto;
        border-radius: 999px;
        background: linear-gradient(to bottom, #777, #555);
        box-shadow: inset 0 0 0 1px #444;
        transition: background .15s ease;
      }

      #${APP_ID} .dce-toggle-ui:after {
        content: "";
        position: absolute;
        top: 2px;
        left: 2px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: linear-gradient(to bottom, #fff, #c9caca);
        box-shadow: 0 1px 3px rgba(0,0,0,.75);
        transition: transform .15s ease;
      }

      #${APP_ID} .dce-toggle:has(input:checked) .dce-toggle-ui {
        background: linear-gradient(to bottom, #00a6e7, #0081b4);
      }

      #${APP_ID} .dce-toggle:has(input:checked) .dce-toggle-ui:after {
        transform: translateX(20px);
      }

      #${APP_ID} .dce-toggle:has(input:checked) {
        background: #e2f7ff;
      }

      #${APP_ID} .dce-toggle-copy b {
        display: block;
        margin-bottom: 2px;
        color: #222;
        font-size: 13px;
        font-weight: 700;
        overflow-wrap: anywhere;
        word-break: break-word;
      }

      #${APP_ID} .dce-toggle-copy small {
        display: block;
        color: var(--dce-panel-muted);
        font-size: 12px;
        line-height: 1.35;
        overflow-wrap: anywhere;
        word-break: break-word;
      }

      #${APP_ID} .dce-field {
        display: grid;
        gap: 6px;
        padding: 10px 12px 0;
        color: #555;
        font-size: 12px;
        font-weight: 600;
      }

      #${APP_ID} .dce-field:last-child {
        padding-bottom: 12px;
      }

      #${APP_ID} .dce-inline-fields {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0;
        padding: 0 12px;
      }

      #${APP_ID} .dce-inline-fields .dce-field {
        padding-left: 0;
        padding-right: 0;
      }

      #${APP_ID} .dce-tools {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding: 12px;
      }

      #${APP_ID} .dce-tools button {
        min-height: 34px;
        border: 1px solid var(--dce-panel-border-dark);
        border-radius: 4px;
        background: linear-gradient(to bottom, #f5f5f5, #d8d8d8);
        color: #555;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.68);
      }

      #${APP_ID} .dce-tools button:hover {
        background: linear-gradient(to bottom, #00a6e7, #0081b4);
        border-color: #006fa1;
        color: #fff;
      }

      #${APP_ID} .dce-tools-note {
        margin: 0;
        padding: 0 12px 12px;
        color: var(--dce-panel-muted);
        font-size: 10px;
        line-height: 1.35;
      }

      #${APP_ID} .dce-color-field input {
        width: 52px;
      }

      #${APP_ID} input,
      #${APP_ID} select,
      #${APP_ID} textarea {
        width: 100%;
        border: 1px solid var(--dce-panel-border-dark);
        border-radius: 4px;
        background: var(--dce-input-bg);
        color: var(--dce-panel-text);
        font: 13px var(--dce-font);
        box-shadow: inset 0 0 0 1px #444;
      }

      #${APP_ID} input:focus,
      #${APP_ID} select:focus,
      #${APP_ID} textarea:focus {
        outline: none;
        border-color: var(--dce-blue);
        background: #e1e2e5;
      }

      #${APP_ID} input,
      #${APP_ID} select {
        min-height: 34px;
        padding: 0 10px;
      }

      #${APP_ID} input[type="color"] {
        padding: 4px;
      }

      #${APP_ID} textarea {
        min-height: 84px;
        padding: 10px;
        resize: vertical;
      }

      #${APP_ID} .dce-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        padding: 12px;
      }

      #${APP_ID} .dce-quick {
        display: grid;
        grid-template-columns: 1fr;
        gap: 6px;
        padding: 10px 12px 0;
      }

      #${APP_ID} .dce-quick button,
      #${APP_ID} .dce-actions button {
        min-height: 34px;
        border: 1px solid var(--dce-panel-border-dark);
        border-radius: 4px;
        background: linear-gradient(to bottom, #f5f5f5, #d8d8d8);
        color: #555;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.68);
      }

      #${APP_ID} .dce-quick button:hover,
      #${APP_ID} .dce-actions button:hover {
        background: linear-gradient(to bottom, #00a6e7, #0081b4);
        border-color: #006fa1;
        color: #fff;
      }

      #${APP_ID} .dce-import {
        display: none;
      }

      #${APP_ID} .log {
        display: grid;
        gap: 6px;
        margin: 0;
        padding: 10px 12px 12px 28px;
        background: #f6f6f6;
        color: var(--dce-panel-muted);
        font-size: 12px;
        border-top: 1px solid #e6e6e6;
      }

      #${APP_ID} .dce-activity {
        margin-bottom: 0;
      }

      #${HOTBAR_ID} {
        position: fixed;
        left: 50%;
        bottom: 14px;
        transform: translateX(-50%);
        display: flex;
        gap: 6px;
        max-width: calc(100vw - 24px);
        padding: 6px 8px;
        border: 1px solid #191919;
        border-radius: 7px;
        background: var(--dce-chrome, #2f2f2f);
        box-shadow: inset -1px 0 0 0 #3b3b3b, inset 1px 0 0 0 #191919, 0 8px 24px rgba(0,0,0,.55);
        z-index: 1001;
        pointer-events: auto;
        cursor: default;
        font-family: ${DEEPCUT_FONT};
      }

      #${HOTBAR_ID}[hidden] {
        display: none !important;
      }

      #${HOTBAR_ID} button {
        min-width: 72px;
        min-height: 32px;
        padding: 0 12px;
        border: 1px solid #444;
        border-radius: 4px;
        background: linear-gradient(to bottom, #666, #333);
        color: #fff;
        font: 600 12px/1 var(--dce-font);
        cursor: pointer;
        white-space: nowrap;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.15);
      }

      #${HOTBAR_ID} button:hover {
        background: linear-gradient(to bottom, #606265, #444);
      }

      #${HOTBAR_ID} button.is-on {
        border-color: #c5ad3d;
        background: linear-gradient(to bottom, var(--dce-gold-top, #e3bf23), var(--dce-gold-bottom, #d7a31a));
        color: var(--dce-gold-text, #594608);
        text-shadow: 0 1px 0 rgba(255,255,255,.35);
      }

      #${HOTBAR_ID} button[data-hotbar="panel"] {
        min-width: 84px;
      }

      @container dce-panel (min-width: 380px) {
        #${APP_ID} .dce-grid {
          grid-template-columns: 1fr 1fr;
        }
      }

      @container dce-panel (min-width: 420px) {
        #${APP_ID} .dce-inline-fields {
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
      }
    `;
  }

  function applySiteStyles() {
    const settings = state.settings;
    const theme = THEMES[settings.theme] || THEMES.deep;
    const preset = STYLE_PRESETS[settings.stylePreset] || STYLE_PRESETS.teal;
    const accent = settings.stylePreset === "custom" ? settings.accent : preset.accent;
    state.settings.accent = accent;
    applyBodyClasses();
    upsertStyle(STYLE_ID, `
      :root { --dce-accent: ${accent}; }
      ${panelCss()}
      ${settings.showVolume ? volumeCss() : ""}
      ${settings.siteUiFixes ? siteUiCss() : ""}
      ${appearanceCss(settings, preset)}
      ${theme.css}
    `);
    upsertStyle(CUSTOM_STYLE_ID, settings.customCss || "");
  }

  function applyBodyClasses() {
    const map = {
      "dce-hide-audience": state.settings.hideAudience,
      "dce-hide-video": state.settings.hideVideo,
      "dce-compact-chat": state.settings.compactChat,
      "dce-chat-stamps": state.settings.chatTimestamps,
      "dce-show-volume": state.settings.showVolume,
      "dce-afk": state.settings.afk,
      "dce-next-dj": state.settings.nextDj,
      "dce-escort": state.settings.escortAfterSong,
      "dce-vote-highlights": state.settings.voteTracker && state.settings.voteGuestHighlights,
      "dce-guest-idle": state.settings.guestIdleMarkers,
      "dce-reduce-animations": state.settings.reduceAnimations
    };
    Object.entries(map).forEach(([className, enabled]) => document.body?.classList.toggle(className, Boolean(enabled)));
  }

  function volumeCss() {
    return `
      #${VOLUME_WRAP_ID} {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin-right: 8px;
        padding: 0 8px;
        border: 1px solid #191919;
        border-radius: 4px;
        background: rgba(255,255,255,.08);
        vertical-align: middle;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.12);
      }

      #${VOLUME_WRAP_ID} span {
        color: #f4f4f4;
        font: 700 10px/1 ${DEEPCUT_FONT};
        letter-spacing: .04em;
        text-transform: uppercase;
      }

      #${VOLUME_WRAP_ID} input[type="range"] {
        width: 88px;
        margin: 0;
        cursor: pointer;
        accent-color: #deb41f;
      }

      body.dce-show-volume .settings-dropdown .dropdown-volume-container {
        opacity: 1 !important;
        visibility: visible !important;
      }
    `;
  }

  function siteUiCss() {
    return `
      /* ── Profile modal (room.css: width 25% + overflow-x hidden on stats) ── */
      .modal .content,
      .content-container .content {
        overflow-x: hidden !important;
        overflow-y: auto !important;
        scrollbar-gutter: stable;
        padding-bottom: 12px !important;
      }

      .modal.profile .section,
      .content-container .content > .section {
        box-sizing: border-box;
      }

      .modal.profile .section:has(.joined),
      .content-container .content > .section:has(.joined) {
        display: grid !important;
        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
        gap: 8px 6px !important;
        margin: 0.75em 1em 0 !important;
        padding: 0.5em 0.25em !important;
      }

      .modal.profile .joined,
      .modal.profile .points,
      .modal.profile .fans,
      .modal.profile .fanofs,
      .content-container .joined,
      .content-container .points,
      .content-container .fans,
      .content-container .fanofs {
        display: block !important;
        width: auto !important;
        min-width: 0 !important;
        overflow: visible !important;
        text-align: center !important;
        padding: 0 2px 0.5em !important;
        font-size: 11px !important;
        line-height: 1.25 !important;
      }

      .modal.profile .stat-number,
      .content-container .stat-number {
        display: block !important;
        margin-top: 4px !important;
        overflow: visible !important;
        text-overflow: unset !important;
        white-space: normal !important;
        word-break: break-word !important;
        font-size: clamp(11px, 2.4vw, 22px) !important;
        font-weight: bold !important;
        font-variant-numeric: tabular-nums !important;
        line-height: 1.15 !important;
        letter-spacing: -0.02em;
      }

      .modal.profile .section.big,
      .content-container .section.big {
        margin: 0.5em 1.25em 0 !important;
        padding: 0 !important;
        border: none !important;
      }

      .modal.profile .section.big .name,
      .content-container .section.big .name {
        display: block !important;
        margin-right: 0 !important;
        overflow-wrap: anywhere !important;
        line-height: 1.2 !important;
        margin-bottom: 4px !important;
        font-size: clamp(20px, 5vw, 32px) !important;
      }

      .modal.profile .section.big .acl,
      .content-container .section.big .acl {
        display: block !important;
        margin-top: 2px !important;
        padding-bottom: 0 !important;
        font-size: 11px !important;
        line-height: 1.35 !important;
        opacity: 0.9;
        overflow-wrap: anywhere !important;
      }

      .modal.profile .section.about,
      .modal.profile .section.topartists,
      .modal.profile .section.hangout,
      .modal.profile .section.past-names,
      .content-container .section.about,
      .content-container .section.topartists,
      .content-container .section.hangout,
      .content-container .section.past-names {
        display: grid !important;
        grid-template-columns: minmax(72px, 30%) minmax(0, 1fr) !important;
        gap: 10px 12px !important;
        align-items: start !important;
        margin-left: 1em !important;
        margin-right: 1em !important;
        padding-top: 0.5em !important;
      }

      .modal.profile .section .left,
      .content-container .section .left {
        width: auto !important;
        text-align: left !important;
        font-weight: 700;
        line-height: 1.35 !important;
      }

      .modal.profile .section .right,
      .content-container .section .right {
        width: auto !important;
        min-width: 0 !important;
      }

      .modal.profile .profileText,
      .content-container .profileText {
        margin: 0 !important;
        max-width: 100% !important;
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
        white-space: pre-wrap !important;
        line-height: 1.45 !important;
        font-size: 12px !important;
      }

      .modal.profile .profile-images,
      .content-container .profile-images {
        display: flex !important;
        flex-wrap: wrap !important;
        gap: 10px !important;
        justify-content: center !important;
        align-items: flex-start !important;
        padding: 0.5em 1em 0 !important;
      }

      .modal.profile .profile-images .avatar img,
      .content-container .profile-images .avatar img {
        max-width: 100% !important;
        height: auto !important;
      }

      .modal.profile .profile-images canvas.laptop,
      .content-container .profile-images canvas.laptop {
        max-width: 100% !important;
        height: auto !important;
      }

      .fan-grid .fan div p.stats {
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
        font-size: 11px !important;
      }

      @media (max-width: 420px) {
        .modal.profile .section:has(.joined),
        .content-container .content > .section:has(.joined) {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
      }

      /* ── Lobby: long room names & themes ── */
      .room-list .roomListItemContent {
        overflow: visible !important;
        min-width: 0 !important;
      }

      .room-list .roomName {
        display: block !important;
        margin-right: 0 !important;
        margin-bottom: 4px !important;
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
        line-height: 1.25 !important;
        font-size: clamp(14px, 2.2vw, 18px) !important;
      }

      .room-list .roomTheme {
        display: block !important;
        max-width: none !important;
        margin-bottom: 4px !important;
        overflow: visible !important;
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
        white-space: normal !important;
        font-size: 11px !important;
        line-height: 1.35 !important;
      }

      .room-list .songName {
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      .roomListItem .roomListBuddies {
        max-width: 45% !important;
      }

      .buddyListRoom .buddyRoomName {
        float: none !important;
        display: block !important;
        margin: 0 16px 8px !important;
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
        line-height: 1.3 !important;
        clear: both;
      }

      .buddyListRoom .buddyIcons {
        clear: both;
      }

      #myInfo .myName {
        overflow: visible !important;
        text-overflow: unset !important;
        white-space: normal !important;
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
        line-height: 1.25 !important;
        padding-right: 4px !important;
      }

      #myInfo .myStats,
      #myInfo .myStats .myStatsNum {
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
      }

      /* ── In-room header & songboard ── */
      .header-bar .header-room-name {
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      .miniplayer .header-bar .header-room-name {
        white-space: normal !important;
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
        display: -webkit-box !important;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden !important;
      }

      .mini-room-view .songboard-artist.songboard-main,
      .mini-room-view .songboard-song.songboard-main,
      #turntable .songboard-artist.songboard-main,
      #turntable .songboard-song.songboard-main {
        max-width: 100% !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }

      .room-tab .room-name {
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
      }

      .room-tab .description,
      .room-tab .edit-description {
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
        line-height: 1.4 !important;
        white-space: pre-wrap !important;
      }

      .room-tab .roomtheme,
      .mini-room-view .roomtheme,
      #turntable .roomtheme {
        max-width: 100% !important;
        overflow-wrap: anywhere !important;
        white-space: normal !important;
        line-height: 1.3 !important;
      }

      /* ── Chat & misc ── */
      .chat .messages {
        overflow-wrap: anywhere !important;
        word-break: break-word !important;
      }

      .chat .message .text,
      .chat .message .subject {
        overflow-wrap: anywhere !important;
      }

      .point-display {
        max-width: min(240px, 40vw) !important;
        overflow: visible !important;
        white-space: normal !important;
        text-align: center !important;
        line-height: 1.2 !important;
        font-size: clamp(10px, 1.8vw, 13px) !important;
      }

      .modal .content,
      #transition-modal .content {
        overflow-x: hidden !important;
        overflow-y: auto !important;
      }

      .song .title,
      .song .details {
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .settings-dropdown .dropdown {
        max-height: min(70vh, 520px) !important;
        overflow-y: auto !important;
      }
    `;
  }

  function appearanceCss(settings, preset) {
    return `
      body.dce-hide-audience .room-renderer.mouse-map,
      body.dce-hide-audience .room-renderer[style*="z-index: 3"],
      body.dce-hide-audience .point-display,
      body.dce-hide-audience .mini-djs .mini-dj:not(.active) {
        opacity: .04 !important;
      }

      body.dce-hide-video .screen-link,
      body.dce-hide-video .mini-room-view .youtube,
      body.dce-hide-video iframe.screen-content,
      body.dce-hide-video .screen-content {
        display: none !important;
      }

      body.dce-compact-chat .chat .message {
        padding-top: 2px !important;
        padding-bottom: 2px !important;
        line-height: 16px !important;
      }

      body.dce-chat-stamps .chat .message .dce-timestamp {
        display: inline-block;
      }

      .dce-timestamp {
        display: none;
        margin-right: 5px;
        color: #888;
        font-size: 10px;
      }

      .chat .message.dce-song-event {
        opacity: .72;
        font-style: italic;
      }

      .awesome-button,
      #${TRIGGER_ID} .dce-trigger-button,
      #${APP_ID} .dce-actions button:hover,
      #${APP_ID} .dce-quick button:hover {
        filter: hue-rotate(${preset.hue}) saturate(1.18);
      }

      .header-bar .header-room-name,
      .room-tab .room-name,
      .mini-room-current-dj-name {
        color: var(--dce-accent) !important;
      }

      body.dce-vote-highlights .guest.dce-vote-up,
      body.dce-vote-highlights [id][class*="guest"].dce-vote-up,
      body.dce-vote-highlights .listener.dce-vote-up,
      body.dce-vote-highlights .user-row.dce-vote-up {
        background: rgba(52, 211, 153, .18) !important;
      }

      body.dce-vote-highlights .guest.dce-vote-down,
      body.dce-vote-highlights [id][class*="guest"].dce-vote-down,
      body.dce-vote-highlights .listener.dce-vote-down,
      body.dce-vote-highlights .user-row.dce-vote-down {
        background: rgba(248, 113, 113, .18) !important;
      }

      body.dce-guest-idle .guest-list .guest-name,
      body.dce-guest-idle .guest .guest-name {
        position: relative;
        padding-left: 12px;
      }

      body.dce-guest-idle .guest-list .guest.dce-idle-green .guest-name:before,
      body.dce-guest-idle .guest.dce-idle-green .guest-name:before {
        background: #85d515;
      }

      body.dce-guest-idle .guest-list .guest.dce-idle-yellow .guest-name:before,
      body.dce-guest-idle .guest.dce-idle-yellow .guest-name:before {
        background: #ffba00;
      }

      body.dce-guest-idle .guest-list .guest.dce-idle-red .guest-name:before,
      body.dce-guest-idle .guest.dce-idle-red .guest-name:before {
        background: #c24a4f;
      }

      body.dce-guest-idle .guest-list .guest .guest-name:before,
      body.dce-guest-idle .guest .guest-name:before {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        width: 7px;
        height: 7px;
        margin-top: -3px;
        border-radius: 50%;
      }

      body.dce-reduce-animations .room-renderer,
      body.dce-reduce-animations canvas.room-renderer,
      body.dce-reduce-animations .avatar-head .ascreen {
        animation: none !important;
        transition: none !important;
      }

      body.dce-reduce-animations * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
  }

  function upsertStyle(id, css) {
    let style = document.getElementById(id);
    if (!style) {
      style = document.createElement("style");
      style.id = id;
      document.documentElement.append(style);
    }
    style.textContent = css;
  }

  function voteTrackerSection() {
    return `
      <section class="dce-section dce-votes">
        <h3>Track Votes</h3>
        <div class="dce-vote-actions">
          <button type="button" data-action="vote-bop" class="dce-vote-btn bop">Bop</button>
          <button type="button" data-action="vote-lame" class="dce-vote-btn lame">Lame</button>
        </div>
        <p class="dce-vote-summary" data-vote-tally>${escapeHtml(voteTallySummary() || "Bops 0 · Lames 0")}</p>
        <div class="dce-vote-grid">
          <div>
            <div class="dce-eyebrow">Bopped</div>
            <ol class="dce-vote-list bop" data-vote-up-list>${voteNamesListHtml(state.voteTracker.up, "No bops yet")}</ol>
          </div>
          <div>
            <div class="dce-eyebrow">Lamed</div>
            <ol class="dce-vote-list lame" data-vote-down-list>${voteNamesListHtml(state.voteTracker.down, "No lames yet")}</ol>
          </div>
        </div>
        <ol class="dce-vote-switches" data-vote-switch-list>${voteSwitchListHtml()}</ol>
      </section>
    `;
  }

  function voteNamesListHtml(map, emptyLabel) {
    const names = [...map.values()].map((entry) => entry.name).filter(Boolean);
    if (!names.length) return `<li class="empty">${escapeHtml(emptyLabel)}</li>`;
    return names.map((name) => `<li>${escapeHtml(name)}</li>`).join("");
  }

  function voteSwitchListHtml() {
    const items = state.voteTracker.switches.slice(-4);
    if (!items.length) return `<li class="empty">Vote switches will appear here.</li>`;
    return items.map((item) => `<li class="switch">${escapeHtml(item)}</li>`).join("");
  }

  function voteTallySummary() {
    const up = state.voteTracker.upCount || state.voteTracker.up.size;
    const down = state.voteTracker.downCount || state.voteTracker.down.size;
    return `Bops ${up} · Lames ${down}`;
  }

  function normalizeVoteLogEntry(entry) {
    if (Array.isArray(entry)) {
      return { userId: entry[0], vote: entry[1] };
    }
    if (entry && typeof entry === "object") {
      return {
        userId: entry.userid || entry.userId || entry.id,
        vote: entry.vote || entry.type || entry.value
      };
    }
    return { userId: null, vote: null };
  }

  function refreshVoteStateFromRoom() {
    if (!state.settings.voteTracker) return;
    if (!ensureRoomBridge()) return;
    rebuildVoteTrackerFromRoom();
  }

  function rebuildVoteTrackerFromRoom() {
    const room = roomBridge.getRoom();
    if (!room) return;

    const metadata = room.metadata || {};
    const upvoters = Array.isArray(room.upvoters) ? room.upvoters : [];
    const downvoterIds = [];
    const votelog = Array.isArray(metadata.votelog) ? metadata.votelog : [];

    state.voteTracker.up.clear();
    state.voteTracker.down.clear();

    upvoters.forEach((userId) => {
      if (!userId) return;
      state.voteTracker.up.set(userId, { name: resolveVoteUserName(userId), at: Date.now() });
    });

    votelog.forEach((entry) => {
      const { userId, vote } = normalizeVoteLogEntry(entry);
      if (!userId) return;
      const normalized = String(vote || "").toLowerCase();
      if (normalized === "up" || normalized === "awesome" || normalized === "bop") {
        const index = downvoterIds.indexOf(userId);
        if (index > -1) downvoterIds.splice(index, 1);
        state.voteTracker.down.delete(userId);
        state.voteTracker.up.set(userId, { name: resolveVoteUserName(userId), at: Date.now() });
        return;
      }
      if (!downvoterIds.includes(userId)) downvoterIds.push(userId);
      state.voteTracker.up.delete(userId);
      state.voteTracker.down.set(userId, { name: resolveVoteUserName(userId), at: Date.now() });
    });

    state.voteTracker.upCount = upvoters.length || state.voteTracker.up.size;
    state.voteTracker.downCount = Number(metadata.downvotes) || downvoterIds.length || state.voteTracker.down.size;
    syncVoteTrackerUi();
    applyGuestVoteHighlights();
  }
  function initVoteTracking() {
    if (state.voteHooked) return;
    const room = window.turntable;
    if (!room?.addEventListener) {
      window.setTimeout(initVoteTracking, 1500);
      return;
    }
    room.addEventListener("message", handleRoomMessage);
    state.voteHooked = true;
    ensureRoomBridge();
    log("Vote tracker connected to deepcut.live room feed.");
    refreshVoteStateFromRoom();
  }

  function handleRoomMessage(message) {
    if (message?.command === "speak" && message.userid) {
      recordUserActivity(message.userid);
      handleSpeakMessage(message);
    }

    if (message?.command === "registered" && message.user) {
      cacheVoteNames(Array.isArray(message.user) ? message.user : [message.user]);
      (Array.isArray(message.user) ? message.user : [message.user]).forEach((user) => {
        const userId = user?.userid || user?.id;
        if (userId) recordUserActivity(userId, Date.now());
      });
      if (state.settings.alertJoin) {
        (Array.isArray(message.user) ? message.user : [message.user]).forEach((user) => {
          const name = compact(user?.name || user?.username);
          if (name) notify("User joined", `${name} joined.`);
        });
      }
    }

    if (message?.command === "deregistered" && message.user && state.settings.alertLeave) {
      (Array.isArray(message.user) ? message.user : [message.user]).forEach((user) => {
        const name = compact(user?.name || user?.username);
        if (name) notify("User left", `${name} left.`);
      });
    }

    if (!message?.command) {
      if (state.settings.guestIdleMarkers) applyGuestIdleMarkers();
      return;
    }

    if (message.command === "newsong") {
      handleNewSong(message);
      if (state.settings.voteTracker) resetVoteTracker();
      if (state.settings.guestIdleMarkers) applyGuestIdleMarkers();
      return;
    }

    if (message.command === "nosong") {
      if (state.mutedByEnhancer) restoreMute();
      if (state.settings.voteTracker) resetVoteTracker();
      if (state.settings.guestIdleMarkers) applyGuestIdleMarkers();
      return;
    }

    if (message.command === "rem_dj" && state.settings.nextDj) {
      maybeJoinQueue();
    }

    if (message.command === "add_dj") {
      handleDjAdded(message);
    }

    if (message.command === "snagged" && state.settings.alertSnag) {
      const name = resolveVoteUserName(message.userid) || "Someone";
      notify("Snag", `${name} snagged this track.`);
    }

    if (state.settings.voteTracker && message.command === "update_votes") {
      processVoteUpdate(message.room?.metadata || {});
    }

    if (state.settings.guestIdleMarkers) applyGuestIdleMarkers();
  }

  function handleSpeakMessage(message) {
    const text = String(message.text || "");
    const lowered = text.toLowerCase();
    const userId = message.userid;
    const selfId = getUserId();

    if (selfId && userId === selfId && state.settings.afk && state.settings.idleAfk) {
      updateSetting("afk", false);
      log("AFK disabled after you spoke.");
    }

    const trigger = state.settings.autoQueueMentionTrigger.toLowerCase();
    if (state.settings.autoQueue && trigger && lowered.includes(trigger)) {
      maybeJoinQueue(3);
    }

    if (state.settings.afk && userId !== selfId && looksLikeMention({ text, full: text, subject: "" })) {
      maybeAfkReply();
    }
  }

  function handleDjAdded(message) {
    const users = Array.isArray(message.user) ? message.user : message.user ? [message.user] : [];
    const selfId = getUserId();
    users.forEach((user) => {
      const userId = user?.userid || user?.id;
      if (selfId && userId === selfId && state.settings.nextDj) {
        updateSetting("nextDj", false);
        log("Next DJ fulfilled — you're on deck.");
      }
    });
  }

  function handleNewSong(message) {
    const song = message.room?.metadata?.current_song;
    const djId = song?.djid;
    const selfId = getUserId();

    if (state.settings.escortAfterSong && state.wasDj && selfId && djId !== selfId) {
      leaveDeck();
    }

    if (selfId && djId === selfId && state.settings.escortAfterSong) {
      log("Escort armed — you'll leave after this song.");
    }

    state.wasDj = Boolean(selfId && djId === selfId);

    if (state.settings.autobop) scheduleAutobopOnNewSong();
    if (state.settings.autoLame) scheduleAutolameOnNewSong();

    if (state.mutedByEnhancer) {
      restoreMute();
      log("Temp mute ended on track change.");
    }

    const track = currentTrackKey();
    if (track) {
      state.lastTrack = track;
      state.lastAutobopTrack = "";
      state.lastAutolameTrack = "";
      log(`Track changed: ${track}`);
      notify("New song", currentSongSummary(), { kind: "song", key: track });
    }
  }

  function scheduleAutobopOnNewSong() {
    if (state.settings.skipBopWhenDj && isCurrentUserDj()) return;
    if (state.pendingBopTimer) window.clearTimeout(state.pendingBopTimer);
    const delay = state.settings.autobopRandomDelay ? Math.floor(Math.random() * 700) : 0;
    state.pendingBopTimer = window.setTimeout(() => {
      state.pendingBopTimer = 0;
      const track = currentTrackKey();
      if (!track || !canVoteNow()) return;
      if (track === state.lastAutobopTrack) return;
      if (Date.now() - state.lastBopAt < state.settings.smartBopCooldownSeconds * 1000) return;
      const button = findAwesomeButton();
      if (button && (isPressed(button) || isDisabled(button))) return;
      if (!castVote("bop")) return;
      state.lastBopAt = Date.now();
      state.lastAutobopTrack = track;
      state.lastBopTrack = track;
      log(`Autobop voted for ${track}`);
    }, delay);
  }

  function scheduleAutolameOnNewSong() {
    if (state.settings.skipBopWhenDj && isCurrentUserDj()) return;
    if (state.pendingLameTimer) window.clearTimeout(state.pendingLameTimer);
    const delay = state.settings.autobopRandomDelay ? Math.floor(Math.random() * 700) : 0;
    state.pendingLameTimer = window.setTimeout(() => {
      state.pendingLameTimer = 0;
      const track = currentTrackKey();
      if (!track || !canVoteNow()) return;
      if (track === state.lastAutolameTrack) return;
      if (Date.now() - state.lastBopAt < state.settings.smartBopCooldownSeconds * 1000) return;
      const button = findLameButton();
      if (button && (isPressed(button) || isDisabled(button))) return;
      if (!castVote("lame")) return;
      state.lastBopAt = Date.now();
      state.lastAutolameTrack = track;
      state.lastBopTrack = track;
      log(`Autolame voted for ${track}`);
    }, delay);
  }

  function cacheVoteNames(users) {
    users.forEach((user) => {
      const userId = user?.userid || user?.id;
      const name = compact(user?.name || user?.username);
      if (userId && name) state.voteTracker.names[userId] = name;
    });
  }

  function resolveVoteUserName(userId) {
    if (!userId) return "Unknown";
    const roomUsers = roomBridge.getRoom()?.users;
    const roomName = compact(roomUsers?.[userId]?.name || roomUsers?.[userId]?.username);
    if (roomName) {
      state.voteTracker.names[userId] = roomName;
      return roomName;
    }
    if (state.voteTracker.names[userId]) return state.voteTracker.names[userId];
    return `User ${String(userId).slice(-6)}`;
  }

  function resetVoteTracker() {
    state.voteTracker.up.clear();
    state.voteTracker.down.clear();
    state.voteTracker.switches = [];
    state.voteTracker.upCount = 0;
    state.voteTracker.downCount = 0;
    syncVoteTrackerUi();
    applyGuestVoteHighlights();
  }

  function processVoteUpdate(metadata) {
    if (!metadata) return;

    const room = roomBridge.getRoom();
    state.voteTracker.upCount = Number(metadata.upvotes) || room?.upvoters?.length || state.voteTracker.up.size;
    state.voteTracker.downCount = Number(metadata.downvotes) || state.voteTracker.down.size;

    const votelog = Array.isArray(metadata.votelog) ? metadata.votelog : [];
    votelog.forEach((entry) => {
      const { userId, vote } = normalizeVoteLogEntry(entry);
      const normalized = String(vote || "").toLowerCase();
      if (!userId || !normalized) return;

      const name = resolveVoteUserName(userId);
      const wasUp = state.voteTracker.up.has(userId);
      const wasDown = state.voteTracker.down.has(userId);

      if (normalized === "up" || normalized === "awesome" || normalized === "bop") {
        state.voteTracker.down.delete(userId);
        state.voteTracker.up.set(userId, { name, at: Date.now() });
        if (wasDown) recordVoteSwitch(name, "bop");
        else if (!wasUp) recordVote(name, "bop");
      } else {
        state.voteTracker.up.delete(userId);
        state.voteTracker.down.set(userId, { name, at: Date.now() });
        if (wasUp) recordVoteSwitch(name, "lame");
        else if (!wasDown) recordVote(name, "lame");
      }
    });

    if (room?.upvoters) {
      room.upvoters.forEach((userId) => {
        if (!userId || state.voteTracker.down.has(userId)) return;
        state.voteTracker.up.set(userId, { name: resolveVoteUserName(userId), at: Date.now() });
      });
      state.voteTracker.upCount = Math.max(state.voteTracker.upCount, room.upvoters.length);
    }

    if (Number.isFinite(Number(metadata.downvotes))) {
      state.voteTracker.downCount = Number(metadata.downvotes);
    } else {
      state.voteTracker.downCount = Math.max(state.voteTracker.downCount, state.voteTracker.down.size);
    }

    syncVoteTrackerUi();
    applyGuestVoteHighlights();
  }

  function recordVote(name, vote) {
    const label = vote === "lame" ? "lamed" : "bopped";
    log(`${name} ${label} this track.`);
  }

  function recordVoteSwitch(name, vote) {
    const label = vote === "lame" ? "switched to lame" : "switched to bop";
    const line = `${name} ${label}`;
    state.voteTracker.switches.push(line);
    if (state.voteTracker.switches.length > 12) state.voteTracker.switches.shift();
    log(line);
    if (state.settings.voteNotify && state.settings.desktopNotifications) {
      notify("Vote switch", line);
    }
  }

  function syncVoteTrackerUi() {
    const tally = voteTallySummary();
    const tallyEl = state.pane?.querySelector("[data-vote-tally]");
    if (tallyEl) tallyEl.textContent = tally;

    const upList = state.pane?.querySelector("[data-vote-up-list]");
    const downList = state.pane?.querySelector("[data-vote-down-list]");
    const switchList = state.pane?.querySelector("[data-vote-switch-list]");
    if (upList) upList.innerHTML = voteNamesListHtml(state.voteTracker.up, "No bops yet");
    if (downList) downList.innerHTML = voteNamesListHtml(state.voteTracker.down, "No lames yet");
    if (switchList) switchList.innerHTML = voteSwitchListHtml();
  }

  function applyGuestVoteHighlights() {
    if (!state.settings.voteTracker || !state.settings.voteGuestHighlights) return;

    const candidates = [...document.querySelectorAll(".guest, .listener, .user-row, [class*='guest-list'] [id]")];
    candidates.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      const userId = node.id || node.dataset.userid || node.dataset.userId;
      node.classList.remove("dce-vote-up", "dce-vote-down");
      if (!userId) return;
      if (state.voteTracker.down.has(userId)) node.classList.add("dce-vote-down");
      else if (state.voteTracker.up.has(userId)) node.classList.add("dce-vote-up");
    });
  }

  function startAutomationLoops() {
    setInterval(() => {
      ensureRoomBridge();
      syncUsername();
      detectTrackChange();
      updateNowPlaying();
      if (state.settings.voteTracker) refreshVoteStateFromRoom();
      monitorDjState();
      maybeIdleAfk();
      if (state.settings.guestIdleMarkers) applyGuestIdleMarkers();
    }, 2400);

    observeChat();
    setInterval(observeChat, 5000);
  }

  function updateNowPlaying() {
    const song = currentSongSummary();
    const dj = currentDjSummary();
    const key = `${song}|${dj}`;
    if (key === state.lastNowPlayingKey) return;
    state.lastNowPlayingKey = key;

    const songEl = state.pane?.querySelector("[data-now-song]");
    const djEl = state.pane?.querySelector("[data-now-dj]");
    if (songEl) songEl.textContent = song;
    if (djEl) djEl.textContent = dj;
    syncVoteTrackerUi();
    syncHotbar();
  }

  function syncUsername() {
    const username = compact(document.querySelector(SELECTORS.profileLink)?.textContent);
    if (!username) return;
    const runtime = readRuntimeState();
    if (runtime.username === username) return;
    rememberRuntimeState({ username });
  }

  function detectTrackChange(forcedTrack) {
    const track = forcedTrack || currentTrackKey();
    if (!track || track === state.lastTrack) return false;
    state.lastTrack = track;
    state.lastAutobopTrack = "";
    state.lastAutolameTrack = "";
    rememberRuntimeState({ lastTrack: track, changedAt: Date.now() });
    log(`Track changed (chat): ${track}`);
    if (state.settings.autobop) scheduleAutobopOnNewSong();
    if (state.settings.autoLame) scheduleAutolameOnNewSong();
    notify("New song", currentSongSummary(), { kind: "song", key: track });
    return true;
  }

  function currentTrackKey() {
    const song = songParts();
    if (song.artist || song.title) return [song.artist, song.title].filter(Boolean).join(" - ");
    return "";
  }

  function currentSongSummary() {
    const song = songParts();
    if (song.artist && song.title) return `${song.artist} - ${song.title}`;
    if (song.title) return song.title;
    return currentTrackKey() || "Waiting for song info";
  }

  function songParts() {
    return {
      artist: compact(document.querySelector(SELECTORS.songArtist)?.textContent),
      title: compact(document.querySelector(SELECTORS.songTitle)?.textContent)
    };
  }

  function currentDjSummary() {
    const currentDj = compact(document.querySelector(SELECTORS.currentDjName)?.textContent);
    if (currentDj) return `Current DJ: ${currentDj}`;
    const roomTheme = compact(document.querySelector(SELECTORS.roomTheme)?.textContent);
    return roomTheme || "Room controls ready";
  }

  function parseChatMessage(node) {
    if (!(node instanceof HTMLElement) || !node.classList.contains("message")) return null;
    const subject = compact(node.querySelector(".subject")?.textContent);
    const text = compact(node.querySelector(".text")?.textContent);
    return {
      subject,
      text,
      full: compact(`${subject}${text}`)
    };
  }

  function parseSongPlayMessage(text) {
    const match = String(text || "").match(/started playing "(.+?)" by (.+)$/i);
    if (!match) return null;
    return { title: compact(match[1]), artist: compact(match[2]) };
  }

  function clickControl(control) {
    if (!control) return false;
    try {
      window.focus();
    } catch {
      /* ignore */
    }
    const events = ["pointerdown", "mousedown", "mouseup", "pointerup", "click"];
    events.forEach((type) => {
      control.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, view: window }));
    });
    if (typeof control.click === "function") {
      try {
        control.click();
      } catch {
        /* ignore */
      }
    }
    return true;
  }

  function canVoteNow() {
    const room = roomBridge.getRoom();
    if (room?.currentSong) return true;
    const board = document.querySelector(".mini-room-view .board, #turntable .board");
    return board?.classList.contains("song-playing") || Boolean(currentTrackKey());
  }

  function castVote(vote) {
    const isUp = vote === "bop" || vote === "up";
    const val = isUp ? "up" : "down";
    const apiFn = roomBridge.getApi();
    const room = roomBridge.getRoom();
    const songId = room?.currentSong?._id;

    try {
      window.focus();
    } catch {
      /* ignore */
    }

    if (apiFn && room?.roomId && songId) {
      try {
        apiFn({
          api: "room.vote",
          roomid: room.roomId,
          val,
          vh: hashToken(`${room.roomId}${val}${songId}`),
          th: hashToken(String(Math.random())),
          ph: hashToken(String(Math.random()))
        });
        // We still fall through to the button click because sometimes the API call alone isn't enough to update the local UI to 'selected'
      } catch (error) {
        log(`Vote API failed: ${error?.message || error}`);
      }
    }

    const button = isUp ? findAwesomeButton() : findLameButton();
    if (clickControl(button)) return true;
    
    // If button wasn't found but API succeeded, return true
    if (apiFn && room?.roomId && songId) return true;
    
    return false;
  }

  function queryVisible(selector) {
    return [...document.querySelectorAll(selector)].find((node) => !isDisabled(node));
  }

  function findAwesomeButton() {
    return queryVisible(SELECTORS.awesomeButton);
  }

  function findLameButton() {
    return queryVisible(SELECTORS.lameButton);
  }

  function findBecomeDjButton() {
    return queryVisible(SELECTORS.becomeDjBtn);
  }

  function getCurrentVolumePercent() {
    if (window.util?.getSetting) {
      const volume = Number(window.util.getSetting("volume"));
      if (Number.isFinite(volume)) return Math.min(100, Math.max(0, Math.round(100 * Math.pow(2, volume - 4))));
    }
    const fill = document.querySelector(".settings-dropdown .volume-slider-fill");
    if (fill) {
      const width = parseFloat(fill.style.width);
      if (Number.isFinite(width)) return Math.round(width);
    }
    return 65;
  }

  function setPlayerVolume(percent) {
    if (!window.turntablePlayer?.setVolume) return false;
    const value = Number(percent);
    const volume = value > 0 ? Math.log(value / 100) / Math.LN2 + 4 : -7;
    window.turntablePlayer.setVolume(volume);
    window.util?.setSetting?.("volume", volume);
    return true;
  }

  function syncHeaderVolume() {
    let wrap = document.getElementById(VOLUME_WRAP_ID);
    if (!state.settings.showVolume) {
      wrap?.remove();
      return;
    }

    const host = document.querySelector(".chrome .header-buttons");
    if (!host) return;

    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = VOLUME_WRAP_ID;
      wrap.innerHTML = `
        <span>Vol</span>
        <input type="range" min="0" max="100" step="1" aria-label="Room volume">
      `;
      wrap.querySelector("input").addEventListener("input", (event) => setPlayerVolume(event.target.value));
      host.prepend(wrap);
    }

    const slider = wrap.querySelector("input");
    if (slider) slider.value = String(getCurrentVolumePercent());
  }

  function recordUserActivity(userId, at = Date.now()) {
    if (!userId) return;
    state.userActivity.set(String(userId), at);
  }

  function applyGuestIdleMarkers() {
    if (!state.settings.guestIdleMarkers) return;
    const threshold = (Number(state.settings.guestIdleMinutes) || 15) * 60 * 1000;
    const guests = [...document.querySelectorAll(".guest-list .guest, .guest-list .guest[id]")];
    guests.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      const userId = node.id || node.dataset.userid || node.dataset.userId;
      node.classList.remove("dce-idle-green", "dce-idle-yellow", "dce-idle-red");
      if (!userId) return;
      const last = state.userActivity.get(String(userId)) || 0;
      const idle = Date.now() - last;
      if (!last || idle > threshold) node.classList.add("dce-idle-red");
      else if (idle > threshold / 2) node.classList.add("dce-idle-yellow");
      else node.classList.add("dce-idle-green");
    });
  }

  function currentSongSearchQuery() {
    const song = songParts();
    if (song.artist && song.title) return `${song.artist} - ${song.title}`;
    return song.title || song.artist || currentSongSummary();
  }

  function searchYouTube() {
    const query = currentSongSearchQuery();
    if (!query || query === "Waiting for song info") {
      log("No song loaded for YouTube search.");
      return;
    }
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank", "noopener");
    log("Opened YouTube search.");
  }

  function searchSoundCloud() {
    const query = currentSongSearchQuery();
    if (!query || query === "Waiting for song info") {
      log("No song loaded for SoundCloud search.");
      return;
    }
    window.open(`https://soundcloud.com/search?q=${encodeURIComponent(query)}`, "_blank", "noopener");
    log("Opened SoundCloud search.");
  }

  function casinoRoll() {
    if (sendChatMessage("roll")) log("Sent casino roll.");
  }

  function showTheLove() {
    const manager = roomBridge.getManager();
    const users = roomBridge.getRoom()?.users;
    if (!manager?.show_heart || !users) {
      log("Show Love needs the room manager (not available yet).");
      return;
    }
    const userIds = Object.keys(users);
    userIds.forEach((userId, index) => {
      window.setTimeout(() => {
        try {
          manager.show_heart(userId);
        } catch {
          /* ignore per-user failures */
        }
      }, Math.round(Math.random() * Math.max(userIds.length * 120, 400)) + index * 40);
    });
    log(`Show Love sent for ${userIds.length} listeners.`);
  }

  function voteSong(vote) {
    const isLame = vote === "lame" || vote === "down";
    if (!canVoteNow()) {
      log("No song is playing to vote on yet.");
      return false;
    }
    if (!ensureRoomBridge()) {
      log("Waiting for deepcut.live room API...");
    }
    const button = isLame ? findLameButton() : findAwesomeButton();
    if (button && (isPressed(button) || isDisabled(button))) {
      log(`Already ${isLame ? "lamed" : "bopped"} this track.`);
      return false;
    }
    if (!castVote(isLame ? "lame" : "bop")) {
      log(`Could not cast ${isLame ? "lame" : "bop"} vote.`);
      return false;
    }
    log(`${isLame ? "Lame" : "Bop"} sent.`);
    window.setTimeout(refreshVoteStateFromRoom, 600);
    return true;
  }

  function takeDeckSpot() {
    const view = getTurntableView();
    if (typeof view?.becomeDj === "function") {
      view.becomeDj();
      return true;
    }
    const legacyBtn = document.querySelector(".become-dj");
    if (legacyBtn) return clickControl(legacyBtn);
    const button = findBecomeDjButton();
    return button ? clickControl(button) : false;
  }

  function maybeJoinQueue(retries = 0) {
    const room = roomBridge.getRoom();
    const apiFn = roomBridge.getApi();
    const selfId = getUserId();

    if (room?.isDj?.() || (selfId && room?.currentDj === selfId)) {
      if (state.settings.nextDj) updateSetting("nextDj", false);
      return;
    }

    if (apiFn && room?.roomId && typeof room.numDjs === "function") {
      if (room.numDjs() < (room.maxDjs || 5)) {
        apiFn({ api: "room.add_dj", roomid: room.roomId }, (response) => {
          if (response?.success) {
            updateSetting("nextDj", false);
            log("Joined the deck via room API.");
          } else if (retries > 0) {
            window.setTimeout(() => maybeJoinQueue(retries - 1), 500);
          } else {
            takeDeckSpot();
          }
        });
        return;
      }
    }

    if (takeDeckSpot()) {
      log("Attempting to take an open deck.");
      if (retries > 0 && !room?.isDj?.()) {
        window.setTimeout(() => maybeJoinQueue(retries - 1), 250);
      }
      return;
    }

    if (retries > 0) window.setTimeout(() => maybeJoinQueue(retries - 1), 250);
  }

  function leaveDeck() {
    const view = getTurntableView();
    if (typeof view?.quitDj === "function") {
      view.quitDj();
      updateSetting("escortAfterSong", false);
      state.wasDj = false;
      log("Escort left the deck.");
      return true;
    }

    const button = findButton(["quit dj", "leave deck", "stop dj", "step down", "quit-dj", "quitdj"])
      || document.querySelector('.mini-dj-popover [class*="quit" i], .mini-dj-popover button, .mini-dj.active');
    if (!button || isDisabled(button)) {
      log("Escort wanted to leave, but no leave-deck control was found.");
      return false;
    }
    clickControl(button);
    updateSetting("escortAfterSong", false);
    state.wasDj = false;
    log("Escort clicked the leave-deck control.");
    return true;
  }

  function isCurrentUserDj() {
    const room = roomBridge.getRoom();
    const selfId = getUserId();
    if (room?.isDj?.()) return true;
    if (selfId && room?.currentDj === selfId) return true;

    const view = getTurntableView();
    const userMap = view?.userMap;
    if (selfId && userMap?.[selfId]) {
      const djIds = room?.djIds || room?.djids || [];
      if (Array.isArray(djIds) && djIds.includes(selfId)) return true;
    }

    const currentDj = compact(document.querySelector(SELECTORS.currentDjName)?.textContent);
    const possibleNames = currentUserNames();
    if (currentDj && possibleNames.some((name) => currentDj.toLowerCase() === name.toLowerCase())) return true;
    return Boolean(document.querySelector(".mini-djs .mini-dj.active.self, .mini-dj.active.self"));
  }

  function currentUserNames() {
    return [
      readRuntimeState().username,
      document.querySelector(SELECTORS.profileLink)?.textContent
    ].map(compact).filter(Boolean);
  }

  function maybeIdleAfk() {
    if (!state.settings.idleAfk || state.settings.afk) return;
    const minutes = Number(state.settings.idleAfkMinutes) || 15;
    if (Date.now() - state.lastActivityAt < minutes * 60 * 1000) return;
    updateSetting("afk", true);
    log(`Idle AFK enabled after ${minutes} minutes.`);
  }

  function markActivity() {
    state.lastActivityAt = Date.now();
    if (state.settings.afk && state.settings.idleAfk) {
      updateSetting("afk", false);
      log("AFK disabled after activity.");
    }
  }

  function observeChat() {
    const feeds = SELECTORS.chatFeed.flatMap((selector) => [...document.querySelectorAll(selector)])
      .filter((node) => node && node !== document.body && node.children.length);

    feeds.slice(0, 3).forEach((feed) => {
      if (feed.__dceObserved) return;
      feed.__dceObserved = true;
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach(handleChatNode);
        });
      });
      observer.observe(feed, { childList: true, subtree: true });
      state.observers.push(observer);
      feed.querySelectorAll(SELECTORS.chatMessage).forEach(handleChatNode);
    });
  }

  function handleChatNode(node) {
    if (!(node instanceof HTMLElement) || state.chatSeen.has(node)) return;
    if (!node.matches?.(SELECTORS.chatMessage)) {
      node.querySelectorAll?.(SELECTORS.chatMessage).forEach(handleChatNode);
      return;
    }

    state.chatSeen.add(node);
    const message = parseChatMessage(node);
    if (!message?.full || message.full.length < 2) return;

    if (message.subject) {
      const roomUsers = roomBridge.getRoom()?.users;
      if (roomUsers) {
        Object.entries(roomUsers).forEach(([userId, user]) => {
          const name = compact(user?.name || user?.username);
          if (name && name.toLowerCase() === message.subject.toLowerCase()) {
            recordUserActivity(userId);
          }
        });
      }
      if (state.settings.guestIdleMarkers) applyGuestIdleMarkers();
    }

    if (state.settings.chatTimestamps) stampChatNode(node);

    const songPlay = parseSongPlayMessage(message.text);
    if (songPlay) {
      node.classList.add("dce-song-event");
      detectTrackChange(`${songPlay.artist} - ${songPlay.title}`);
    } else if (/started playing/i.test(message.text)) {
      node.classList.add("dce-song-event");
    }

    if (state.settings.alertSongStats && /(spun|points|bop|snag|lame)/i.test(message.full)) {
      node.classList.add("dce-song-event");
    }

    if (state.settings.desktopNotifications) {
      if (state.settings.alertSnag && /\bsnag(?:ged)?\b/i.test(message.full)) {
        notify("Snag", message.full);
        log("Snag alert sent.");
      }
      if (state.settings.alertJoin && /\b(joined|entered|is here)\b/i.test(message.full)) {
        notify("User joined", message.full);
      }
      if (state.settings.alertLeave && /\b(left|departed|goodbye)\b/i.test(message.full)) {
        notify("User left", message.full);
      }
    }

    const lowered = message.full.toLowerCase();
    const keywords = state.settings.keywords.map((word) => word.toLowerCase());
    const matchedKeyword = keywords.find((word) => word && lowered.includes(word));
    const trigger = state.settings.autoQueueMentionTrigger.toLowerCase();

    if (state.settings.chatNotifications && matchedKeyword) {
      notify("Keyword matched", message.full);
      log(`Keyword: ${matchedKeyword}`);
    }

    if (state.settings.autoQueue && trigger && lowered.includes(trigger)) {
      maybeJoinQueue(3);
    }

    if (state.settings.afk && looksLikeMention(message)) {
      maybeAfkReply();
    }
  }

  function stampChatNode(node) {
    if (node.querySelector(".dce-timestamp")) return;
    const stamp = document.createElement("span");
    stamp.className = "dce-timestamp";
    stamp.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const anchor = node.querySelector(".subject") || node;
    anchor.insertAdjacentElement("afterend", stamp);
  }

  function maybeAfkReply() {
    const now = Date.now();
    if (now - state.lastAfkReplyAt < 90000) return;
    const parts = String(state.settings.afkMessage || "").split(";;").map((part) => part.trim()).filter(Boolean).slice(0, 3);
    if (!parts.length) return;
    parts.forEach((part, index) => {
      window.setTimeout(() => sendChatMessage(part), index * 400);
    });
    state.lastAfkReplyAt = now;
    log("AFK reply sent.");
  }

  function looksLikeMention(message) {
    const possibleNames = currentUserNames();
    const haystacks = [message.full, message.text, message.subject].map((part) => String(part || "").toLowerCase());
    const ping = possibleNames.some((name) => haystacks.some((part) => part.includes(`@${name.toLowerCase()}`) || part.includes(name.toLowerCase())));
    return ping || haystacks.some((part) => /@\w+/.test(part));
  }

  function monitorDjState() {
    const isDj = isCurrentUserDj();
    if (isDj && !state.wasDj) {
      log("Deck status detected.");
      if (state.settings.nextDj) updateSetting("nextDj", false);
    }
    state.wasDj = isDj;
  }

  function sendChatMessage(message) {
    const view = getTurntableView();
    const turntable = window.turntable;
    if (turntable?.sendMessage && view?.roomId) {
      turntable.sendMessage({
        text: message,
        api: "room.speak",
        roomid: view.roomId,
        section: view.section
      });
      return true;
    }

    const input = SELECTORS.chatInput.map((selector) => document.querySelector(selector)).find(Boolean);
    if (!input) {
      log("Could not find #chat-input for reply.");
      return false;
    }

    input.focus();
    input.value = message;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));

    const form = document.querySelector(SELECTORS.chatForm);
    if (form) {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    }

    input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key: "Enter", code: "Enter" }));
    input.dispatchEvent(new KeyboardEvent("keypress", { bubbles: true, key: "Enter", code: "Enter" }));
    input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true, key: "Enter", code: "Enter" }));
    return true;
  }

  function findButton(words) {
    const controls = [...document.querySelectorAll('button, [role="button"], a, input[type="button"], input[type="submit"], .awesome-button, .lame-button, .become-dj-btn, .invite-dj-btn, .mini-dj-popover *')];
    return controls.find((control) => {
      const label = [
        control.textContent,
        control.className,
        control.getAttribute("aria-label"),
        control.getAttribute("title"),
        control.value
      ].map(compact).join(" ").toLowerCase();
      return words.some((word) => label.includes(word));
    });
  }

  function isPressed(button) {
    const classes = button.className.toString().toLowerCase();
    return button.getAttribute("aria-pressed") === "true" || classes.includes("selected");
  }

  function isDisabled(button) {
    const style = getComputedStyle(button);
    const hidden = button.getClientRects().length === 0
      || style.display === "none"
      || style.visibility === "hidden"
      || style.pointerEvents === "none";
    return hidden || button.disabled || button.getAttribute("aria-disabled") === "true" || button.className.toString().toLowerCase().includes("disabled");
  }

  function togglePanel() {
    if (!state.host && !mountEnhancerUi()) return;
    if (state.panelOpen) selectChatTab();
    else selectEnhancerTab();
  }

  function openPanel() {
    selectEnhancerTab();
  }

  function closePanel() {
    selectChatTab();
  }

  function updateSetting(key, value) {
    if (!(key in DEFAULT_SETTINGS)) return;
    if (key === "accent") state.settings.stylePreset = "custom";
    if (key === "autobop" && value) state.settings.autoLame = false;
    if (key === "autoLame" && value) state.settings.autobop = false;
    state.settings[key] = value;
    if (key === "stylePreset" && value !== "custom") state.settings.accent = STYLE_PRESETS[value]?.accent || state.settings.accent;
    if (key === "tempMute" && value) enableTempMute();
    if (key === "tempMute" && !value) restoreMute();
    if (key === "nextDj" && value) maybeJoinQueue(3);
    if (key === "escortAfterSong" && value && !isCurrentUserDj()) log("Escort armed for your next DJ slot.");
    if (key === "voteTracker" || key === "voteGuestHighlights" || key === "guestIdleMarkers" || key === "reduceAnimations") applyBodyClasses();
    if (key === "voteTracker" && value) {
      initVoteTracking();
      refreshVoteStateFromRoom();
    }
    if (key === "guestIdleMarkers" && value) applyGuestIdleMarkers();
    saveSettings();
    log(`${humanize(key)} ${typeof value === "boolean" ? (value ? "enabled" : "disabled") : "updated"}.`);
  }

  function mountHotbar() {
    let host = document.getElementById(HOTBAR_ID);
    if (!host) {
      host = document.createElement("div");
      host.id = HOTBAR_ID;
      document.body.append(host);
    }
    state.hotbarHost = host;
    host.innerHTML = `
      ${HOTBAR_ACTIONS.map((action) => `<button type="button" data-hotbar="${action.key}">${action.label}</button>`).join("")}
      <button type="button" data-hotbar="panel">Enhancer</button>
    `;
    host.querySelectorAll("[data-hotbar]").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.hotbar;
        if (key === "panel") {
          togglePanel();
          return;
        }
        updateSetting(key, !state.settings[key]);
      });
    });
    syncHotbar();
  }

  function syncHotbar() {
    if (!state.hotbarHost) return;
    state.hotbarHost.hidden = !state.settings.hotbar;
    HOTBAR_ACTIONS.forEach((action) => {
      const button = state.hotbarHost.querySelector(`[data-hotbar="${action.key}"]`);
      if (!button) return;
      button.classList.toggle("is-on", Boolean(state.settings[action.key]));
    });
  }

  function enableTempMute() {
    if (state.mutedByEnhancer) return;
    if (window.turntablePlayer?.setVolume && window.util?.getSetting) {
      state.priorMuteState = { kind: "player", volume: window.util.getSetting("volume") };
      window.turntablePlayer.setVolume(-7);
      state.mutedByEnhancer = true;
      log("Temp mute enabled until the next track.");
      return;
    }

    const media = [...document.querySelectorAll("audio, video")].find((item) => !item.paused) || document.querySelector("audio, video");
    if (!media) return;
    state.priorMuteState = { kind: "media", muted: media.muted, volume: media.volume };
    media.muted = true;
    state.mutedByEnhancer = true;
    log("Temp mute enabled until the next track.");
  }

  function restoreMute() {
    if (state.priorMuteState?.kind === "player" && window.turntablePlayer?.setVolume) {
      window.turntablePlayer.setVolume(state.priorMuteState.volume);
    }

    const media = document.querySelector("audio, video");
    if (media && state.priorMuteState?.kind === "media") {
      media.muted = state.priorMuteState.muted;
      media.volume = state.priorMuteState.volume;
    }

    state.mutedByEnhancer = false;
    state.priorMuteState = null;
    state.settings.tempMute = false;
    saveSettings();
  }

  async function requestNotifications() {
    if (globalThis.chrome?.runtime?.id) {
      log("Extension notifications are ready.");
      return;
    }
    if (!("Notification" in window)) {
      log("This browser does not support desktop notifications.");
      return;
    }
    const result = await Notification.requestPermission();
    log(`Notifications: ${result}`);
  }

  function notify(title, body, details = {}) {
    if (!state.settings.desktopNotifications) return;
    const notificationKey = `${title}:${details.key || body}`;
    if (notificationKey === state.lastNotificationKey) return;
    state.lastNotificationKey = notificationKey;
    window.setTimeout(() => {
      state.lastNotificationKey = "";
    }, 12000);

    if (globalThis.chrome?.runtime?.sendMessage && details.kind === "song") {
      chrome.runtime.sendMessage({
        source: "deepcut-enhancer",
        command: "notify-song",
        payload: {
          title: `Deepcut Enhancer: ${title}`,
          body: String(body).slice(0, 140),
          key: details.key || body
        }
      }, () => {
        if (chrome.runtime.lastError) fallbackNotify(title, body);
      });
      return;
    }

    fallbackNotify(title, body);
  }

  function fallbackNotify(title, body) {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    new Notification(`Deepcut Enhancer: ${title}`, { body: String(body).slice(0, 140), silent: true });
  }

  function exportSettings() {
    const blob = new Blob([JSON.stringify(state.settings, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.download = "deepcut-enhancer-settings.json";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    log("Settings exported.");
  }

  function importSettings(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const incoming = JSON.parse(String(reader.result || "{}"));
        const next = { ...state.settings };
        Object.keys(DEFAULT_SETTINGS).forEach((key) => {
          if (!(key in incoming)) return;
          next[key] = sanitizeSetting(key, incoming[key]);
        });
        state.settings = next;
        saveSettings();
        log("Settings imported.");
      } catch {
        log("Settings import failed.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  function sanitizeSetting(key, value) {
    const fallback = DEFAULT_SETTINGS[key];
    if (Array.isArray(fallback)) {
      if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean).slice(0, 20);
      if (typeof value === "string") return parseSettingValue(key, value);
      return [...fallback];
    }
    if (typeof fallback === "boolean") return Boolean(value);
    if (typeof fallback === "number") return parseSettingValue(key, value);
    return typeof value === "string" ? value : fallback;
  }

  function resetSettings() {
    state.settings = { ...DEFAULT_SETTINGS };
    saveSettings();
    log("Settings reset.");
  }

  function wireExtensionMessages() {
    if (!globalThis.chrome?.runtime?.onMessage) return;
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message?.source === "deepcut-enhancer-background" && message.command === "vote") {
        voteSong(message.payload?.vote);
        return;
      }
      if (message?.source !== "deepcut-enhancer-popup") return;

      if (message.command === "get-state") {
        sendResponse?.({
          settings: { ...state.settings },
          nowPlaying: `${currentSongSummary()} · ${currentDjSummary()}`
        });
        return;
      }

      if (message.command === "toggle-panel") togglePanel();
      if (message.command === "toggle-setting") {
        const key = message.payload?.key;
        updateSetting(key, !state.settings[key]);
      }
      if (message.command === "export-settings") exportSettings();

      sendResponse?.({
        settings: { ...state.settings },
        nowPlaying: `${currentSongSummary()} · ${currentDjSummary()}`
      });
      return true;
    });
  }

  function log(message) {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    state.log.push(`${time} ${message}`);
    if (state.log.length > 20) state.log.shift();
    updateLogView();
  }

  function updateLogView() {
    if (!state.panelOpen || !state.pane) return;
    const list = state.pane.querySelector(".log");
    if (!list) return;
    list.innerHTML = state.log.slice(-5).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  function compact(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function humanize(key) {
    return key.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
