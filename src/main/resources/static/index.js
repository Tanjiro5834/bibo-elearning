/* ============================================================
   BIBO SPA — Redesigned UI (backend contract unchanged)
   ============================================================ */

// ── API Layer (unchanged) ──────────────────────────────────
const API_BASE = "/api";
//const API_BASE = "";

const api = {
  async request(method, path, body = null, token = null) {
    const headers = { "Content-Type": "application/json" };
    const validToken =
      token && token !== "null" && token !== "undefined" && token.trim() !== "";
    if (validToken) headers["Authorization"] = `Bearer ${token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(API_BASE + path, opts);
    if (res.status === 401 && validToken) {
      clearAuth();
      render();
      throw new Error("Session expired. Please log in again.");
    }

    if (!res.ok) {
      const err = await res
        .json()
        .catch(() => ({ message: "Something went wrong" }));
      throw new Error(err.message || err.error || `HTTP ${res.status}`);
    }

    return res.json();
  },

  login: (data) => api.request("POST", "/auth/login", data),
  registerStudent: (data) =>
    api.request("POST", "/auth/register/student", data),

  registerParent: (data) => api.request("POST", "/auth/register/parent", data),

  registerTeacher: (data) =>
    api.request("POST", "/auth/register/teacher", data),

  getMe: () => api.request("GET", "/student/me", null, state.token),

  getSubjects: () => api.request("GET", "/subjects/active", null, state.token),

  getLessons: (sid) =>
    api.request("GET", `/lessons/subject/${sid}`, null, state.token),

  getLesson: (lid) => api.request("GET", `/lessons/${lid}`, null, state.token),

  getProgress: (lessonId) =>
    api.request(
      "GET",
      `/student/lessons/${lessonId}/progress`,
      null,
      state.token,
    ),

  getSectionsByLesson: (lessonId) =>
    api.request(
      "GET",
      `/lesson-sections/lesson/${lessonId}`,
      null,
      state.token,
    ),

  startProgress: (lessonId) =>
    api.request("POST", `/student/lessons/${lessonId}/start`, {}, state.token),

  updateProgress: (lessonId, data) =>
    api.request(
      "PATCH",
      `/student/lessons/${lessonId}/progress`,
      data,
      state.token,
    ),

  completeLesson: (lessonId) =>
    api.request(
      "POST",
      `/student/lessons/${lessonId}/complete`,
      {},
      state.token,
    ),

  aiChat: (data) => api.request("POST", "/ai/chat", data, state.token),

  getQuizzesByLesson: (lessonId) =>
    api.request("GET", `/quiz/lesson/${lessonId}`, null, state.token),

  submitQuiz: (data) => api.request("POST", "/quiz/submit", data, state.token),

  checkAnswer: (data) => api.request("POST", "/quiz/check", data, state.token),

  getChildren: () => api.request("GET", "/parent/children", null, state.token),

  getChildProgress: (childId) =>
    api.request("GET", `/parent/child/${childId}/progress`, null, state.token),

  getChildOverview: (childId) =>
    api.request("GET", `/parent/child/${childId}/overview`, null, state.token),

  getChildQuizResults: (childId) =>
    api.request(
      "GET",
      `/parent/child/${childId}/quiz-results`,
      null,
      state.token,
    ),

  getStats: () => api.request("GET", "/student/stats", null, state.token),

  getLeaderboard: (limit = 5) =>
    api.request(
      "GET",
      `/student/leaderboard?limit=${limit}`,
      null,
      state.token,
    ),
};

// ── Theme (light / dark) ───────────────────────────────────
const THEME_KEY = "bibo_theme";

function getTheme() {
  let saved = null;
  try {
    saved = localStorage.getItem(THEME_KEY);
  } catch {}
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function toggleTheme(isDark) {
  const theme = isDark ? "dark" : "light";
  applyTheme(theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
  showToast(isDark ? "Dark mode on" : "Light mode on", isDark ? "🌙" : "☀️");
}

applyTheme(getTheme());
// enable color transitions only after first paint
requestAnimationFrame(() =>
  document.documentElement.classList.add("theme-ready"),
);

// ── Sound effects ────────────────────────────────────────────
const SOUND_KEY = "bibo_sound";

function getSoundEnabled() {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off"; // default ON
  } catch {
    return true;
  }
}

function setSoundEnabled(on) {
  try {
    localStorage.setItem(SOUND_KEY, on ? "on" : "off");
  } catch {}
  showToast(on ? "Sound effects on" : "Sound effects off", on ? "🔊" : "🔇");
}

const SFX = {
  correct: new Audio("/sounds/correct-sound.mp3"),
  wrong: new Audio("/sounds/wrong-sound.mp3"),
};
Object.values(SFX).forEach((a) => {
  a.preload = "auto";
  a.volume = 0.6;
});

function playSfx(name) {
  if (!getSoundEnabled()) return;
  const a = SFX[name];
  if (!a) return;
  a.currentTime = 0;
  a.play().catch(() => {});
}

// ── State (unchanged) ──────────────────────────────────────
const state = {
  token: localStorage.getItem("bibo_token") || null,
  user: JSON.parse(localStorage.getItem("bibo_user") || "null"),
  currentPage: "login",
  selectedSubject: null,
  selectedLesson: null,
  chatHistory: [],
  parentView: false,
};

function setState(updates) {
  Object.assign(state, updates);
}

function saveAuth(token, user) {
  if (
    !token ||
    token === "null" ||
    token === "undefined" ||
    token.trim() === ""
  ) {
    throw new Error("Invalid token received from server");
  }
  state.token = token;
  state.user = user || null;
  localStorage.setItem("bibo_token", token);
  localStorage.setItem("bibo_user", JSON.stringify(user || null));
}

function clearAuth() {
  state.token = null;
  state.user = null;
  localStorage.removeItem("bibo_token");
  localStorage.removeItem("bibo_user");
  _stats = null; // never show the previous account's numbers
}

// ── Router ─────────────────────────────────────────────────
function navigate(page, data = {}) {
  setState({ currentPage: page, ...data });
  render();
  window.scrollTo(0, 0);
  // Close mobile sidebar
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.classList.remove("open");
    document.getElementById("sidebar-overlay").classList.remove("open");
  }
}

function render() {
  const app = document.getElementById("app");

  if (!state.token) {
    app.innerHTML = `<div id="app-auth">${LoginPage()}</div>`;
    bindLogin();
    return;
  }

  // Authenticated: sidebar + main layout
  app.innerHTML = `
    <div id="app-layout">
      ${SidebarHtml()}
      <div id="main-content">
        <div id="page-container"></div>
      </div>
    </div>`;

  updateSidebarActive();

  const pages = {
    dashboard: () => {
      document.getElementById("page-container").innerHTML = DashboardPage();
      bindDashboard();
    },
    subjects: () => {
      document.getElementById("page-container").innerHTML = SubjectsPage();
      bindSubjects();
    },
    lessons: () => {
      document.getElementById("page-container").innerHTML = LessonsPage();
      bindLessons();
    },
    lesson: () => {
      document.getElementById("page-container").innerHTML = LessonDetailPage();
      bindLessonDetail();
    },
    ai: () => {
      document.getElementById("page-container").innerHTML = AIChatPage();
      bindAIChat();
    },
    parent: () => {
      document.getElementById("page-container").innerHTML = ParentViewPage();
      bindParent();
    },
  };
  (pages[state.currentPage] || pages.dashboard)();
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (!sidebar) return;
  sidebar.classList.toggle("open");
  overlay.classList.toggle("open");
}

function updateSidebarActive() {
  document.querySelectorAll(".nav-item").forEach((el) => {
    el.classList.toggle("active", el.dataset.page === state.currentPage);
  });
}

// ── Toast ──────────────────────────────────────────────────
function showToast(msg, emoji = "✅") {
  const t = document.getElementById("toast");
  t.textContent = `${emoji} ${msg}`;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

// ── Helpers ────────────────────────────────────────────────
function Loading(msg = "Loading...") {
  return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:16px;">
    <div class="spinner"></div>
    <p style="color:var(--text-400);font-size:13px;font-weight:600;">${msg}</p>
  </div>`;
}

function EmptyState(emoji, title, sub) {
  return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:12px;text-align:center;">
    <div style="font-size:44px;">${emoji}</div>
    <h3 style="font-size:18px;">${title}</h3>
    <p style="color:var(--text-400);font-size:13px;">${sub}</p>
  </div>`;
}

function ErrorState(msg) {
  return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:12px;text-align:center;">
    <div style="font-size:40px;">😕</div>
    <h3 style="font-size:18px;">Oops!</h3>
    <p style="color:var(--text-400);font-size:13px;">${msg}</p>
  </div>`;
}

function statusBadge(status) {
  if (status === "COMPLETED") {
    return `<span class="badge badge-done">✓ Done</span>`;
  }

  if (status === "IN_PROGRESS") {
    return `<span class="badge badge-progress">In Progress</span>`;
  }

  return `<span class="badge badge-new">New</span>`;
}

const SUBJECT_STYLES = {
  Math: {
    color: "#3B3FC4",
    pale: "#EEF0FF",
    icon: "🔢",
    gradient: "linear-gradient(135deg,#3B3FC4,#6366F1)",
  },
  Science: {
    color: "#0D9488",
    pale: "#CCFBF1",
    icon: "🔬",
    gradient: "linear-gradient(135deg,#0D9488,#0F766E)",
  },
  Reading: {
    color: "#F59E0B",
    pale: "#FEF3C7",
    icon: "📖",
    gradient: "linear-gradient(135deg,#F59E0B,#D97706)",
  },
  Filipino: {
    color: "#EF4444",
    pale: "#FEE2E2",
    icon: "🇵🇭",
    gradient: "linear-gradient(135deg,#EF4444,#DC2626)",
  },
  Arts: {
    color: "#EC4899",
    pale: "#FCE7F3",
    icon: "🎨",
    gradient: "linear-gradient(135deg,#EC4899,#DB2777)",
  },
  Values: {
    color: "#10B981",
    pale: "#D1FAE5",
    icon: "🌟",
    gradient: "linear-gradient(135deg,#10B981,#059669)",
  },
  English: {
    color: "#3B3FC4",
    pale: "#EEF0FF",
    icon: "📘",
    gradient: "linear-gradient(135deg,#3B3FC4,#6366F1)",
  },
  default: {
    color: "#3B3FC4",
    pale: "#EEF0FF",
    icon: "📝",
    gradient: "linear-gradient(135deg,#3B3FC4,#6366F1)",
  },
};
function getSubjectStyle(name) {
  const st = SUBJECT_STYLES[name] || SUBJECT_STYLES["default"];
  // Base indigo is too dim on dark surfaces → use the lighter tint
  if (
    document.documentElement.dataset.theme === "dark" &&
    st.color === "#3B3FC4"
  ) {
    return { ...st, color: "#818CF8" };
  }
  return st;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br/>");
}

// SVG icons
const icons = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  lessons: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  games: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="4"/><path d="M6 12h4m-2-2v4"/><circle cx="16" cy="11" r="1" fill="currentColor"/><circle cx="18" cy="13" r="1" fill="currentColor"/></svg>`,
  quiz: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  ai: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  research: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
  achievements: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  zap: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  flame: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 23C8.136 23 5 19.864 5 16c0-3.175 2.104-5.768 5-7.486V12c0 1.657 1.343 3 3 3s3-1.343 3-3V4.51c2.396 1.26 4 3.855 4 7.49 0 3.864-3.136 7-7 7z"/></svg>`,
  arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="9 18 15 12 9 6"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>`,
  trend: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  location: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  beaker: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M9 3h6l3 12H6L9 3z"/><path d="M5 21h14"/><path d="M9 3v4l-3 8"/></svg>`,
  history: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  mic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg>`,
  send: `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>`,
};

/* ============================================================
   SIDEBAR
   ============================================================ */
function SidebarHtml() {
  const isParent = state.user?.role === "PARENT";

  const studentNavItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "subjects", label: "Lessons", icon: "lessons" },
    { id: "games", label: "Games", icon: "games" },
    { id: "quiz", label: "Quiz", icon: "quiz" },
    { id: "ai", label: "AI Tutor", icon: "ai" },
    { id: "research", label: "Research", icon: "research" },
    { id: "achievements", label: "Achievements", icon: "achievements" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  const parentNavItems = [
    { id: "parent", label: "Dashboard", icon: "dashboard" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  const navItems = isParent ? parentNavItems : studentNavItems;

  const streak = _stats?.streak ?? "–";

  return `<nav id="sidebar">
    <div class="sidebar-logo">
      <div class="sidebar-logo-icon"><img src="images/bibo-logo.jpg" alt="BIBO" class="bibo-logo" /></div>
      <div class="sidebar-logo-text">
        <div class="sidebar-logo-title">BIBO</div>
        <div class="sidebar-logo-sub">${isParent ? "Parent Portal" : "Bacoor Learn"}</div>
      </div>
    </div>

    <div class="sidebar-nav">
      ${navItems
        .map(
          (item) => `
        <button class="nav-item" data-page="${item.id}" onclick="navigate('${item.id}')">
          ${icons[item.icon]}
          <span>${item.label}</span>
        </button>
      `,
        )
        .join("")}
    </div>

    ${
      isParent
        ? `
      <div style="margin-top:auto;padding:16px;background:linear-gradient(135deg,#1e2a78,#3b3fc4);border-radius:var(--radius-lg);color:white;">
        <div style="font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;opacity:0.7;margin-bottom:6px;">Logged in as</div>
        <div style="font-size:14px;font-weight:800;">👨‍👩‍👧 Parent</div>
        <div style="font-size:11px;opacity:0.7;margin-top:2px;">${state.user?.username || ""}</div>
      </div>
      `
        : `
      <div class="sidebar-streak pulse-glow">
        <div class="streak-label">
          <span>Current Streak</span>
          <span style="font-size:14px;">✦</span>
        </div>
        <div style="display:flex;align-items:baseline;gap:6px;margin:4px 0;">
          <span class="streak-number" id="sidebar-streak">${streak}</span>
          <span class="streak-days">Days</span>
        </div>
        <div class="streak-bar"><div class="streak-bar-fill"></div></div>
      </div>
    `
    }

    <button class="sidebar-logout" onclick="clearAuth(); render();">
      ${icons.logout}
      <span>Log Out</span>
    </button>
  </nav>`;
}

/* ============================================================
   PAGE: LOGIN
   ============================================================ */
function LoginPage() {
  return `<div class="auth-card page" id="login-card">
    <!-- Logo -->
    <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:32px;gap:10px;">
        <div style="width:56px;height:56px;border-radius:14px;overflow:hidden;">
          <img src="images/bibo-logo.jpg" alt="BIBO" class="bibo-logo" />
        </div>
      <div style="text-align:center;">
        <h1 style="font-size:24px;margin-bottom:4px;">Welcome back! 👋</h1>
        <p style="color:var(--text-400);font-size:14px;">Sign in to continue learning</p>
      </div>
    </div>

    <!-- Error -->
    <div id="login-error" style="display:none;background:#FEE2E2;border:1px solid #FECACA;color:#991B1B;font-size:13px;font-weight:700;padding:12px 16px;border-radius:var(--radius-sm);margin-bottom:16px;">
      ⚠️ <span id="login-error-msg"></span>
    </div>

    <!-- Form -->
    <div style="display:flex;flex-direction:column;gap:16px;">
      <div>
        <label style="display:block;font-size:13px;font-weight:700;color:var(--text-700);margin-bottom:6px;">Username</label>
        <div class="input-group">
          <span class="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </span>
          <input id="login-username" type="text" placeholder="Enter your username" class="bibo-input" autocomplete="username" />
        </div>
      </div>
      <div>
        <label style="display:block;font-size:13px;font-weight:700;color:var(--text-700);margin-bottom:6px;">Password</label>
        <div class="input-group">
          <span class="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </span>
          <input id="login-password" type="password" placeholder="Enter your password" class="bibo-input" autocomplete="current-password" />
        </div>
      </div>
      <button id="login-btn" class="btn btn-primary" style="width:100%;padding:14px;font-size:15px;margin-top:4px;">
        Sign In
      </button>
    </div>

    <p style="text-align:center;font-size:11px;color:var(--text-400);margin-top:28px;">🇵🇭 Made with ❤️ for Filipino learners</p>
  </div>`;
}

function bindLogin() {
  const btn = document.getElementById("login-btn");
  const errDiv = document.getElementById("login-error");
  const errMsg = document.getElementById("login-error-msg");
  const card = document.getElementById("login-card");

  async function doLogin() {
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();
    if (!username || !password) {
      showError("Please fill in all fields!");
      return;
    }

    btn.disabled = true;
    btn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:8px;"><svg class="animate-spin" style="animation:spin 0.7s linear infinite;" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle opacity=".25" cx="12" cy="12" r="10" stroke="white" stroke-width="4"/><path opacity=".75" fill="white" d="M4 12a8 8 0 018-8v8z"/></svg> Signing in...</span>`;
    errDiv.style.display = "none";

    try {
      const res = await api.login({ username, password });
      saveAuth(res.accessToken, {
        username: res.username,
        role: res.role,
      });
      navigate(res.role === "PARENT" ? "parent" : "dashboard");
    } catch (e) {
      showError(e.message || "Wrong username or password");
      btn.disabled = false;
      btn.innerHTML = "Sign In";
    }
  }

  function showError(msg) {
    errMsg.textContent = msg;
    errDiv.style.display = "block";
    card.classList.add("shake");
    setTimeout(() => card.classList.remove("shake"), 500);
  }

  btn.addEventListener("click", doLogin);
  document.getElementById("login-password").addEventListener("keydown", (e) => {
    if (e.key === "Enter") doLogin();
  });
}

/* ============================================================
   PAGE: REGISTER
   ============================================================ */
function RegisterPage() {
  return `<div class="auth-card page" id="reg-card">
    <!-- Logo -->
    <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:28px;gap:8px;">
      <div style="width:48px;height:48px;border-radius:12px;overflow:hidden;">
        <img src="images/bibo-logo.jpg" alt="BIBO" class="bibo-logo" />
      </div>
      <h1 style="font-size:22px;margin-bottom:2px;">Join BIBO! 🌟</h1>
      <p style="color:var(--text-400);font-size:13px;">Join thousands of young learners</p>
    </div>

    <!-- Step indicator -->
    <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:24px;" id="reg-steps">
      <div class="step-dot active" id="step-dot-1" data-n="1">1</div>
      <div style="height:2px;width:32px;background:var(--border);border-radius:99px;transition:background 0.3s;" id="step-line-1"></div>
      <div class="step-dot" id="step-dot-2" data-n="2">2</div>
      <div style="height:2px;width:32px;background:var(--border);border-radius:99px;transition:background 0.3s;" id="step-line-2"></div>
      <div class="step-dot" id="step-dot-3" data-n="3">3</div>
    </div>

    <!-- Error -->
    <div id="reg-error" style="display:none;background:#FEE2E2;border:1px solid #FECACA;color:#991B1B;font-size:13px;font-weight:700;padding:12px 16px;border-radius:var(--radius-sm);margin-bottom:16px;">
      ⚠️ <span id="reg-error-msg"></span>
    </div>

    <!-- Step 1 -->
    <div id="reg-step-1">
      <h2 style="font-size:20px;margin-bottom:4px;">Account Details</h2>
      <p style="color:var(--text-400);font-size:13px;margin-bottom:20px;">Step 1 of 3</p>
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div>
          <label style="display:block;font-size:13px;font-weight:700;color:var(--text-700);margin-bottom:6px;">Username</label>
          <input id="reg-username" type="text" placeholder="Choose a username" class="bibo-input" autocomplete="username" />
        </div>
        <div>
          <label style="display:block;font-size:13px;font-weight:700;color:var(--text-700);margin-bottom:6px;">Email</label>
          <input id="reg-email" type="email" placeholder="Enter your email" class="bibo-input" autocomplete="email" />
        </div>
        <div>
          <label style="display:block;font-size:13px;font-weight:700;color:var(--text-700);margin-bottom:6px;">Password</label>
          <input id="reg-password" type="password" placeholder="Create a password" class="bibo-input" autocomplete="new-password" />
          <div id="pw-strength" style="display:none;margin-top:8px;">
            <div style="display:flex;gap:4px;margin-bottom:4px;">
              <div class="pw-bar" id="pw-bar-1"></div>
              <div class="pw-bar" id="pw-bar-2"></div>
              <div class="pw-bar" id="pw-bar-3"></div>
              <div class="pw-bar" id="pw-bar-4"></div>
            </div>
            <p style="font-size:11px;font-weight:700;" id="pw-label"></p>
          </div>
        </div>
        <div>
          <label style="display:block;font-size:13px;font-weight:700;color:var(--text-700);margin-bottom:6px;">Confirm Password</label>
          <input id="reg-confirm" type="password" placeholder="Repeat your password" class="bibo-input" autocomplete="new-password" />
        </div>
        <button id="reg-next-1" class="btn btn-primary" style="width:100%;padding:14px;">Next →</button>
      </div>
    </div>

    <!-- Step 2 -->
    <div id="reg-step-2" style="display:none;">
      <h2 style="font-size:20px;margin-bottom:4px;">About You</h2>
      <p style="color:var(--text-400);font-size:13px;margin-bottom:20px;">Step 2 of 3</p>
      <div style="display:flex;flex-direction:column;gap:14px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label style="display:block;font-size:13px;font-weight:700;color:var(--text-700);margin-bottom:6px;">First Name</label>
            <input id="reg-firstname" type="text" placeholder="First name" class="bibo-input" autocomplete="given-name" />
          </div>
          <div>
            <label style="display:block;font-size:13px;font-weight:700;color:var(--text-700);margin-bottom:6px;">Last Name</label>
            <input id="reg-lastname" type="text" placeholder="Last name" class="bibo-input" autocomplete="family-name" />
          </div>
        </div>
        <div>
          <label style="display:block;font-size:13px;font-weight:700;color:var(--text-700);margin-bottom:6px;">Age</label>
          <input id="reg-age" type="number" min="7" max="18" placeholder="Your age (7–18)" class="bibo-input" />
        </div>
        <div>
          <label style="display:block;font-size:13px;font-weight:700;color:var(--text-700);margin-bottom:10px;">I am a...</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            ${[
              { val: "STUDENT", icon: "🎒", label: "Student" },
              { val: "PARENT", icon: "👨‍👩‍👧", label: "Parent" },
            ]
              .map(
                (r) => `
              <label class="role-card" data-role="${r.val}" style="cursor:pointer;">
                <input type="radio" name="reg-role" value="${r.val}" style="display:none;" />
                <div id="role-card-${r.val}" style="padding:16px;text-align:center;border-radius:var(--radius-md);border:2px solid var(--border);background:var(--card-bg);transition:all 0.18s;cursor:pointer;">
                  <div style="font-size:28px;margin-bottom:6px;">${r.icon}</div>
                  <div style="font-size:13px;font-weight:700;color:var(--text-700);">${r.label}</div>
                </div>
              </label>`,
              )
              .join("")}
          </div>
        </div>
        <div style="display:flex;gap:10px;">
          <button id="reg-back-2" class="btn btn-ghost" style="flex:1;padding:13px;">← Back</button>
          <button id="reg-next-2" class="btn btn-primary" style="flex:1;padding:13px;">Next →</button>
        </div>
      </div>
    </div>

    <!-- Step 3 -->
    <div id="reg-step-3" style="display:none;">
      <h2 style="font-size:20px;margin-bottom:4px;">Almost There! 🚀</h2>
      <p style="color:var(--text-400);font-size:13px;margin-bottom:20px;">Step 3 of 3 — Review & submit</p>
      <div style="background:var(--primary-light);border-radius:var(--radius-md);padding:16px;margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <div style="width:44px;height:44px;border-radius:12px;background:var(--primary);display:flex;align-items:center;justify-content:center;color:white;font-size:20px;flex-shrink:0;">🦁</div>
          <div>
            <div style="font-weight:800;font-size:15px;color:var(--text-900);" id="summary-name">—</div>
            <div style="font-size:12px;color:var(--text-400);" id="summary-username">—</div>
          </div>
        </div>
        <div style="border-top:1px solid rgba(59,63,196,0.15);padding-top:12px;display:flex;flex-direction:column;gap:8px;">
          ${[
            ["Email", "summary-email"],
            ["Age", "summary-age"],
            ["Role", "summary-role"],
          ]
            .map(
              ([l, id]) => `
            <div style="display:flex;justify-content:space-between;font-size:13px;">
              <span style="color:var(--text-400);">${l}</span>
              <span style="font-weight:700;color:var(--text-900);" id="${id}">—</span>
            </div>`,
            )
            .join("")}
        </div>
      </div>
      <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;margin-bottom:20px;">
        <input type="checkbox" id="reg-terms" style="margin-top:2px;width:16px;height:16px;accent-color:var(--primary);flex-shrink:0;" />
        <span style="font-size:12px;color:var(--text-400);line-height:1.5;">
          I agree to the <span style="color:var(--primary);font-weight:700;">Terms of Service</span> and understand this platform is designed for children aged 7–12.
        </span>
      </label>
      <div style="display:flex;gap:10px;">
        <button id="reg-back-3" class="btn btn-ghost" style="flex:1;padding:13px;">← Back</button>
        <button id="reg-submit" class="btn btn-primary" style="flex:1;padding:13px;">Create Account 🎉</button>
      </div>
    </div>

    <!-- Success -->
    <div id="reg-success" style="display:none;text-align:center;padding:20px 0;">
      <div style="font-size:56px;margin-bottom:16px;">🎊</div>
      <h2 style="font-size:22px;margin-bottom:8px;">You're in!</h2>
      <p style="color:var(--text-400);font-size:13px;margin-bottom:24px;">Account created successfully. Let's start learning!</p>
      <button onclick="navigate('login')" class="btn btn-primary" style="width:100%;padding:14px;">Go to Login →</button>
    </div>

    <p style="text-align:center;font-size:13px;color:var(--text-400);margin-top:24px;" id="reg-signin-link">
      Already have an account?
      <button onclick="navigate('login')" style="color:var(--primary);font-weight:700;background:none;border:none;cursor:pointer;">Sign in</button>
    </p>
  </div>`;
}

function bindRegister() {
  let currentStep = 1;
  let selectedRole = "";

  function updateStepDots(step) {
    [1, 2, 3].forEach((i) => {
      const dot = document.getElementById(`step-dot-${i}`);
      if (!dot) return;
      dot.className = `step-dot ${i < step ? "done" : i === step ? "active" : ""}`;
      dot.textContent = i < step ? "✓" : String(i);
    });
    [1, 2].forEach((i) => {
      const line = document.getElementById(`step-line-${i}`);
      if (line)
        line.style.background = i < step ? "var(--primary)" : "var(--border)";
    });
  }

  function showStep(n) {
    [1, 2, 3].forEach((i) => {
      const el = document.getElementById(`reg-step-${i}`);
      if (el) el.style.display = i === n ? "" : "none";
    });
    currentStep = n;
    updateStepDots(n);
  }

  function showError(msg) {
    const errMsg = document.getElementById("reg-error-msg");
    const errDiv = document.getElementById("reg-error");
    const card = document.getElementById("reg-card");
    errMsg.textContent = msg;
    errDiv.style.display = "block";
    card.classList.add("shake");
    setTimeout(() => card.classList.remove("shake"), 500);
  }

  function hideError() {
    document.getElementById("reg-error").style.display = "none";
  }

  // Password strength
  document
    .getElementById("reg-password")
    .addEventListener("input", function () {
      const val = this.value;
      const strengthDiv = document.getElementById("pw-strength");
      const label = document.getElementById("pw-label");
      if (!val) {
        strengthDiv.style.display = "none";
        return;
      }
      strengthDiv.style.display = "";
      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;
      const colors = ["#EF4444", "#F59E0B", "#10B981", "#3B3FC4"];
      const labels = ["Weak 😬", "Fair 😐", "Good 👍", "Strong 💪"];
      [1, 2, 3, 4].forEach((i) => {
        const bar = document.getElementById(`pw-bar-${i}`);
        bar.style.background = i <= score ? colors[score - 1] : "var(--border)";
      });
      label.textContent = labels[score - 1] || "";
      label.style.color = colors[score - 1] || "var(--text-400)";
    });

  // Role card selection
  document.querySelectorAll(".role-card").forEach((card) => {
    card.addEventListener("click", () => {
      selectedRole = card.dataset.role;
      document.querySelectorAll(".role-card > div").forEach((c) => {
        c.style.borderColor = "var(--border)";
        c.style.background = "white";
      });
      const sel = document.getElementById(`role-card-${selectedRole}`);
      sel.style.borderColor = "var(--primary)";
      sel.style.background = "var(--primary-light)";

      const ageInput = document.getElementById("reg-age");
      if (selectedRole === "PARENT") {
        ageInput.min = "18";
        ageInput.max = "120";
        ageInput.placeholder = "Your age (18+)";
      } else {
        ageInput.min = "7";
        ageInput.max = "18";
        ageInput.placeholder = "Your age (7–18)";
      }
      ageInput.value = "";
    });
  });

  document.getElementById("reg-next-1").addEventListener("click", () => {
    hideError();
    const username = document.getElementById("reg-username").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const confirm = document.getElementById("reg-confirm").value;
    if (!username || !email || !password || !confirm) {
      showError("Please fill in all fields!");
      return;
    }
    if (username.length < 3) {
      showError("Username must be at least 3 characters.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Please enter a valid email.");
      return;
    }
    if (password.length < 6) {
      showError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      showError("Passwords do not match!");
      return;
    }
    showStep(2);
  });

  document
    .getElementById("reg-back-2")
    .addEventListener("click", () => showStep(1));

  document.getElementById("reg-next-2").addEventListener("click", () => {
    hideError();
    const firstName = document.getElementById("reg-firstname").value.trim();
    const lastName = document.getElementById("reg-lastname").value.trim();
    const age = parseInt(document.getElementById("reg-age").value);
    if (!firstName || !lastName) {
      showError("Please enter your full name!");
      return;
    }

    const isParent = selectedRole === "PARENT";
    if (isParent) {
      if (!age || age < 18) {
        showError("Parents must be at least 18 years old.");
        return;
      }
    } else {
      if (!age || age < 7 || age > 18) {
        showError("Age must be between 7 and 18.");
        return;
      }
    }

    if (!selectedRole) {
      showError("Please select your role!");
      return;
    }
    document.getElementById("summary-name").textContent =
      `${firstName} ${lastName}`;
    document.getElementById("summary-username").textContent =
      "@" + document.getElementById("reg-username").value.trim();
    document.getElementById("summary-email").textContent = document
      .getElementById("reg-email")
      .value.trim();
    document.getElementById("summary-age").textContent = age + " years old";
    document.getElementById("summary-role").textContent =
      selectedRole === "STUDENT" ? "🎒 Student" : "👨‍👩‍👧 Parent";
    showStep(3);
  });

  document
    .getElementById("reg-back-3")
    .addEventListener("click", () => showStep(2));

  document.getElementById("reg-submit").addEventListener("click", async () => {
    hideError();
    if (!document.getElementById("reg-terms").checked) {
      showError("Please agree to the Terms of Service.");
      return;
    }
    const btn = document.getElementById("reg-submit");
    btn.disabled = true;
    btn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:8px;"><svg style="animation:spin 0.7s linear infinite;" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle opacity=".25" cx="12" cy="12" r="10" stroke="white" stroke-width="4"/><path opacity=".75" fill="white" d="M4 12a8 8 0 018-8v8z"/></svg> Creating...</span>`;

    const firstName = document.getElementById("reg-firstname").value.trim();
    const lastName = document.getElementById("reg-lastname").value.trim();
    const age = parseInt(document.getElementById("reg-age").value, 10);
    const payload = {
      username: document.getElementById("reg-username").value.trim(),
      email: document.getElementById("reg-email").value.trim(),
      password: document.getElementById("reg-password").value,
      fullName: `${firstName} ${lastName}`.trim(),
      age: age,
      learningLevel: "BEGINNER",
    };
    console.log("REGISTER PAYLOAD:", payload);

    try {
      let res;
      if (selectedRole === "STUDENT") {
        res = await api.registerStudent(payload);
      } else if (selectedRole === "PARENT") {
        res = await api.registerParent({
          username: payload.username,
          email: payload.email,
          password: payload.password,
        });
      } else if (selectedRole === "TEACHER") {
        res = await api.registerTeacher({
          username: payload.username,
          email: payload.email,
          password: payload.password,
        });
      } else {
        throw new Error("Invalid role selected");
      }
      document.getElementById("reg-step-3").style.display = "none";
      document.getElementById("reg-success").style.display = "";
      document.getElementById("reg-signin-link").style.display = "none";
      document.getElementById("reg-steps").style.display = "none";
    } catch (e) {
      showError(e.message || "Registration failed. Please try again.");
      btn.disabled = false;
      btn.innerHTML = "Create Account 🎉";
    }
  });
}

/* ============================================================
   PAGE: DASHBOARD
   ============================================================ */
function DashboardPage() {
  return `<div class="page">
    <div class="flex-between mb-32">
      <div>
        <h1 style="font-size:26px;margin-bottom:4px;" id="dash-greeting">Kumusta! 👋</h1>
        <p style="color:var(--text-400);font-size:14px;">Ready to learn something new today?</p>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <div class="stat-chip">
          <span style="color:var(--accent-orange);">${icons.star}</span>
          <span id="dash-xp">— XP</span>
        </div>
        <div class="stat-chip">
          <span style="color:var(--primary);">${icons.zap}</span>
          <span id="dash-streak">— Day Streak</span>
        </div>
      </div>
    </div>

    <div class="hero-banner mb-32">
      <div style="max-width:600px;position:relative;z-index:1;">
        <h2 id="dash-hero-title" style="color:white;font-size:28px;font-weight:900;margin-bottom:12px;line-height:1.25;">Loading your progress...</h2>
        <p id="dash-hero-text" style="color:rgba(255,255,255,0.75);font-size:14px;margin-bottom:24px;line-height:1.6;">&nbsp;</p>
        <button class="btn btn-orange" onclick="navigate('subjects')">Continue Learning</button>
      </div>
      <div class="hero-banner-icon">
        <svg viewBox="0 0 120 120" fill="none" width="200" height="200"><path d="M20 20h80v80H20z" stroke="white" stroke-width="3" stroke-dasharray="8 4" rx="12"/><circle cx="60" cy="60" r="30" stroke="white" stroke-width="3"/><path d="M45 60l10 10 20-20" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 340px;gap:24px;align-items:start;" id="dash-grid">
      <div>
        <div class="section-header">
          <span class="section-title">Recent Lessons</span>
          <span class="section-link" onclick="navigate('subjects')">View All</span>
        </div>
        <div id="dash-recent">${Loading("Fetching lessons...")}</div>
      </div>

      <div style="display:flex;flex-direction:column;gap:16px;">
        <div class="card" style="padding:20px;">
          <div class="section-title" style="margin-bottom:16px;">Daily Goal</div>
          <div class="flex-between mb-8">
            <span style="font-size:12px;font-weight:700;color:var(--text-400);text-transform:uppercase;letter-spacing:0.5px;">Lessons Today</span>
            <span id="dash-goal-count" style="font-size:14px;font-weight:800;color:var(--primary);">—</span>
          </div>
          <div class="progress-track" style="height:10px;margin-bottom:8px;"><div id="dash-goal-bar" class="progress-fill" style="height:10px;width:0%;"></div></div>
          <p id="dash-goal-text" style="font-size:12px;color:var(--text-400);">&nbsp;</p>
        </div>

        <div class="card" style="padding:20px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
            <span style="color:var(--accent-green);width:20px;height:20px;">${icons.check}</span>
            <span class="section-title" style="font-size:16px;">Up Next</span>
          </div>
          <p id="dash-next" style="font-size:13px;color:var(--text-500);line-height:1.5;">&nbsp;</p>
        </div>
      </div>
    </div>

    <style>
      @media(max-width:900px){#dash-grid{grid-template-columns:1fr;}}
    </style>
  </div>`;
}

/* ── Shared stats cache (sidebar, dashboard, achievements) ── */
let _stats = null;
let _statsPromise = null;

// Dedupes concurrent calls: sidebar + dashboard on first load share one request
function loadStats() {
  if (!_statsPromise) {
    _statsPromise = api
      .getStats()
      .then((st) => {
        _stats = st;
        const el = document.getElementById("sidebar-streak");
        if (el) el.textContent = st.streak;
        return st;
      })
      .finally(() => (_statsPromise = null));
  }
  return _statsPromise;
}

function fmtShortDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function renderDashboardStats(st) {
  const $ = (id) => document.getElementById(id);
  if (!$("dash-xp")) return; // user navigated away before the request finished

  $("dash-xp").textContent = `${st.xp.toLocaleString()} XP`;
  $("dash-streak").textContent = `${st.streak} Day Streak`;

  const goalMet = st.todayCompleted >= st.dailyGoal;
  $("dash-hero-title").textContent = goalMet
    ? "You hit today's goal! 🎉"
    : st.streak > 0
      ? `Keep your ${st.streak}-day streak going! 🔥`
      : "Let's start learning today! 🚀";

  const nextBadge = st.badges.find((b) => !b.earned);
  $("dash-hero-text").innerHTML =
    `You've completed <strong style="color:white;">${st.completionRate}%</strong> of your path ` +
    `(${st.lessonsCompleted} of ${st.totalLessons} lessons).` +
    (nextBadge
      ? ` Next badge: <span style="color:var(--accent-orange);font-weight:700;">${nextBadge.icon} ${escapeHtml(nextBadge.title)}</span> — ${escapeHtml(nextBadge.description.toLowerCase())}.`
      : " You've earned every badge! 🏆");

  const pct = Math.min(
    100,
    Math.round((st.todayCompleted / st.dailyGoal) * 100),
  );
  const left = Math.max(0, st.dailyGoal - st.todayCompleted);
  $("dash-goal-count").textContent = `${st.todayCompleted}/${st.dailyGoal}`;
  $("dash-goal-bar").style.width = `${pct}%`;
  $("dash-goal-text").textContent =
    (left > 0
      ? `Complete ${left} more lesson${left === 1 ? "" : "s"} to hit your daily goal!`
      : "Daily goal reached — great job!") +
    (st.dailyGoalSetByParent ? " (Goal set by your parent)" : "");

  const n = st.nextLesson;
  $("dash-next").innerHTML = n
    ? `${n.inProgress ? "Continue" : "Start"} <strong style="cursor:pointer;color:var(--primary);" onclick="navigate('lessons', { selectedSubjectId: ${n.subjectId} })">"${escapeHtml(n.subjectName)}: ${escapeHtml(n.title)}"</strong>`
    : "You've finished every lesson! 🎓 Check back for new ones.";
}

async function bindDashboard() {
  try {
    const user = await api.getMe();
    setState({ user });
    saveAuth(state.token, user);
  } catch (e) {
    // api.request already cleared auth + re-rendered on 401 — stop here
    if (!state.token) return;
  }

  const name =
    state.user?.name ||
    state.user?.firstName ||
    state.user?.username ||
    "Learner";
  const greeting = document.getElementById("dash-greeting");
  if (greeting) greeting.textContent = `Kumusta, ${name.split(" ")[0]}! 👋`;

  loadStats()
    .then(renderDashboardStats)
    .catch(() => {
      const t = document.getElementById("dash-hero-title");
      if (t) t.textContent = "Kumusta! Ready to learn? 🚀";
    });

  let subjects = [];
  try {
    subjects = await api.getSubjects();
    _allSubjects = subjects;
  } catch (e) {
    const el = document.getElementById("dash-recent");
    if (el) el.innerHTML = ErrorState("Could not load lessons");
    return;
  }

  const recent = document.getElementById("dash-recent");
  if (!recent) return;

  if (subjects.length === 0) {
    recent.innerHTML = EmptyState("📭", "No lessons yet", "Check back soon!");
    return;
  }

  recent.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:10px;">
      ${subjects
        .slice(0, 4)
        .map((s) => {
          const st = getSubjectStyle(s.name);
          const p = s.progress || 0;
          return `<div class="card card-interactive" style="padding:16px;display:flex;align-items:center;gap:14px;"
             onclick="navigate('lessons', { selectedSubjectId: ${s.id} })">
  <div style="width:40px;height:40px;border-radius:10px;background:${st.pale};display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">${st.icon}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:10px;font-weight:800;color:${st.color};text-transform:uppercase;letter-spacing:0.5px;">${s.name.toUpperCase()}</div>
            <div style="font-family:var(--font-display);font-weight:700;font-size:14px;color:var(--text-900);margin-top:1px;" class="truncate">${s.description || s.name + " Fundamentals"}</div>
          </div>
          <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
            <div style="width:80px;">
              <div class="progress-track" style="height:6px;"><div class="progress-fill" style="height:6px;width:${p}%;background:${st.color};"></div></div>
            </div>
            <span style="font-size:12px;font-weight:800;color:${st.color};width:34px;text-align:right;">${p}%</span>
          </div>
        </div>`;
        })
        .join("")}
    </div>`;
}

/* ============================================================
   PAGE: SUBJECTS (Curriculum)
   ============================================================ */
function SubjectsPage() {
  return `<div class="page">
    <!-- Header -->
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:28px;">
      <div style="width:52px;height:52px;border-radius:14px;background:var(--primary-light);display:flex;align-items:center;justify-content:center;color:var(--primary);">${icons.lessons}</div>
      <div>
        <h1 style="font-size:28px;margin-bottom:2px;">My Curriculum</h1>
        <p style="color:var(--text-400);font-size:14px;">DepEd-aligned learning path for Bacoor's future leaders</p>
      </div>
    </div>

    <!-- Overall progress -->
    <div class="card mb-24" style="padding:24px;">
      <div class="flex-between mb-16">
        <div>
          <p style="font-size:11px;font-weight:700;color:var(--text-400);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Overall Progress</p>
          <div style="font-family:var(--font-display);font-size:32px;font-weight:900;color:var(--text-900);" id="overall-pct">—%</div>
        </div>
        <div style="display:flex;gap:24px;text-align:center;">
          <div>
            <div style="font-family:var(--font-display);font-size:26px;font-weight:900;color:var(--primary);" id="overall-done">—</div>
            <div style="font-size:11px;color:var(--text-400);font-weight:600;">Lessons Done</div>
          </div>
          <div>
            <div style="font-family:var(--font-display);font-size:26px;font-weight:900;color:var(--accent-green);" id="overall-unlocked">—</div>
            <div style="font-size:11px;color:var(--text-400);font-weight:600;">Unlocked</div>
          </div>
        </div>
      </div>
      <div class="progress-track" style="height:10px;">
        <div class="progress-fill" id="overall-bar" style="height:10px;width:0%;background:linear-gradient(90deg,var(--primary),var(--primary-mid),#8B5CF6);"></div>
      </div>
    </div>

    <!-- Filter tabs -->
    <div style="display:flex;gap:8px;margin-bottom:24px;" id="subject-tabs">
      <button class="btn btn-primary btn-sm" id="tab-all" onclick="filterSubjects('all',this)">All Subjects</button>
      <button class="btn btn-ghost btn-sm" id="tab-progress" onclick="filterSubjects('progress',this)">In Progress</button>
      <button class="btn btn-ghost btn-sm" id="tab-done" onclick="filterSubjects('done',this)">Completed</button>
    </div>

    <div id="subjects-grid">${Loading("Loading curriculum...")}</div>
  </div>`;
}

let _allSubjects = [];
function filterSubjects(type, btn) {
  document.querySelectorAll("#subject-tabs .btn").forEach((b) => {
    b.className = b === btn ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm";
  });
  let subs = _allSubjects;
  if (type === "progress")
    subs = _allSubjects.filter(
      (s) => (s.progress || 0) > 0 && (s.progress || 0) < 100,
    );
  if (type === "done")
    subs = _allSubjects.filter((s) => (s.progress || 0) >= 100);
  renderSubjectCards(subs);
}

function renderSubjectCards(subjects) {
  if (!subjects.length) {
    document.getElementById("subjects-grid").innerHTML = EmptyState(
      "📭",
      "No subjects",
      "Nothing to show here.",
    );
    return;
  }
  document.getElementById("subjects-grid").innerHTML = `
    <div class="grid-2">
      ${subjects
        .map((s) => {
          const st = getSubjectStyle(s.name);
          const p = s.progress || 0;
          const completed = s.completedCount || 0;
          const total = s.lessonCount || 0;
          const timeLeft = s.estimatedTime ? `${s.estimatedTime}m left` : "—";
          return `<div class="card card-interactive" style="padding:24px;"
              onclick="navigate('lessons', { selectedSubjectId: ${s.id} })">
            <div class="flex-between mb-16">
            <div style="width:56px;height:56px;border-radius:14px;background:${st.pale};display:flex;align-items:center;justify-content:center;font-size:28px;">${st.icon}</div>
            <div style="text-align:right;">
              <p style="font-size:11px;font-weight:700;color:var(--text-400);text-transform:uppercase;letter-spacing:0.5px;">Progress</p>
              <p style="font-family:var(--font-display);font-size:24px;font-weight:900;color:${st.color};">${p}%</p>
            </div>
          </div>
          <h3 style="font-size:20px;margin-bottom:4px;">${s.name}</h3>
          <p style="font-size:13px;color:var(--text-400);margin-bottom:14px;">${s.description || ""}</p>
          <div style="display:flex;gap:14px;margin-bottom:14px;">
            <span style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--text-500);">${icons.book} ${completed}/${total}</span>
            <span style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--text-500);">${icons.clock} ${timeLeft}</span>
          </div>
          <div class="progress-track" style="height:6px;">
            <div class="progress-fill" style="height:6px;width:${p}%;background:${st.color};"></div>
          </div>
        </div>`;
        })
        .join("")}
    </div>`;
}

async function bindSubjects() {
  try {
    _allSubjects = await api.getSubjects();
    const pct = _allSubjects.length
      ? Math.round(
          _allSubjects.reduce((sum, s) => sum + (s.progress || 0), 0) /
            _allSubjects.length,
        )
      : 0;

    const done = _allSubjects.reduce(
      (sum, s) => sum + (s.completedCount || 0),
      0,
    );
    const total = _allSubjects.reduce(
      (sum, s) => sum + (s.lessonCount || 0),
      0,
    );
    document.getElementById("overall-pct").textContent = pct + "%";
    document.getElementById("overall-done").textContent = done;
    document.getElementById("overall-unlocked").textContent =
      _allSubjects.filter((s) => (s.progress || 0) > 0).length;
    document.getElementById("overall-bar").style.width = pct + "%";
    renderSubjectCards(_allSubjects);
  } catch (e) {
    document.getElementById("subjects-grid").innerHTML = ErrorState(e.message);
  }
}

/* ============================================================
   PAGE: LESSONS
   ============================================================ */
function LessonsPage() {
  const s =
    state.selectedSubject ||
    _allSubjects.find((x) => x.id === state.selectedSubjectId);

  const st = s ? getSubjectStyle(s.name) : SUBJECT_STYLES.default;

  return `<div class="page">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
      <button class="btn btn-ghost btn-sm" style="padding:8px 14px;" onclick="navigate('subjects')">← Back</button>
      <h1 style="font-size:24px;">${s ? s.name : "Lessons"}</h1>
    </div>

    ${
      s
        ? `<div style="background:${st.gradient};border-radius:var(--radius-xl);padding:28px;color:white;margin-bottom:28px;display:flex;align-items:center;gap:16px;">
      <div style="font-size:44px;">${st.icon}</div>
      <div>
        <h2 style="color:white;font-size:22px;margin-bottom:4px;">${s.name}</h2>
        <p style="opacity:0.8;font-size:13px;">${s.description || "Explore all lessons"}</p>
      </div>
    </div>`
        : ""
    }

    <div id="lessons-list">${Loading("Loading lessons...")}</div>
  </div>`;
}

function openLessonFromList(lesson) {
  setState({ selectedLesson: lesson, currentLessonId: lesson.id });
  navigate("lesson");
}

async function bindLessons() {
  const list = document.getElementById("lessons-list");
  const s =
    state.selectedSubject ||
    _allSubjects.find((x) => x.id === state.selectedSubjectId);

  if (!s) {
    if (state.selectedSubjectId != null) {
      try {
        _allSubjects = await api.getSubjects();
      } catch {}
      if (_allSubjects.some((x) => x.id === state.selectedSubjectId))
        return render();
    }
    list.innerHTML = ErrorState("No subject selected");
    return;
  }

  try {
    const lessons = await api.getLessons(s.id);

    if (!lessons || !lessons.length) {
      list.innerHTML = EmptyState("📭", "No lessons yet", "Check back soon!");
      return;
    }

    const st = getSubjectStyle(s.name);

    list.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${lessons
              .map((l, i) => {
                const status = l.status || "NOT_STARTED";

                return `
                  <div class="card card-interactive"
                      style="padding:18px;display:flex;align-items:flex-start;gap:14px;"
                      onclick='openLessonFromList(${JSON.stringify(l).replace(/'/g, "&apos;")})'>

                    <div style="
                      width:40px;
                      height:40px;
                      border-radius:10px;
                      background:${st.pale};
                      color:${st.color};
                      display:flex;
                      align-items:center;
                      justify-content:center;
                      font-family:var(--font-display);
                      font-weight:900;
                      font-size:16px;
                      flex-shrink:0;
                    ">
                      ${i + 1}
                    </div>

                    <div style="flex:1;min-width:0;">
                      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:4px;">
                        <div style="font-family:var(--font-display);font-weight:700;font-size:15px;color:var(--text-900);">
                          ${l.title}
                        </div>
                        ${statusBadge(status)}
                      </div>

                      <p style="font-size:13px;color:var(--text-400);margin-bottom:8px;">
                        ${l.description || ""}
                      </p>
                    </div>

                    <span style="color:var(--text-400);flex-shrink:0;">${icons.chevronRight}</span>
                  </div>`;
              })
              .join("")}
          </div>`;
  } catch (e) {
    list.innerHTML = ErrorState(e.message);
  }
}

/* ============================================================
   PAGE: LESSON DETAIL
   ============================================================ */
let lessonState = {
  sections: [],
  current: 0,
  progress: null,
  lesson: null,
};

function LessonDetailPage() {
  return `<div class="page">
    <div id="lesson-topbar" style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
      <button class="btn btn-ghost btn-sm" onclick="navigate('lessons')">← Back</button>
      <h2 id="lesson-title" style="font-size:18px;">Loading...</h2>
    </div>
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
      <div class="progress-track" style="height:8px;flex:1;"><div class="progress-fill" id="lesson-progress-fill" style="height:8px;width:0%;"></div></div>
      <span style="font-size:13px;font-weight:700;color:var(--primary);width:38px;text-align:right;" id="lesson-progress-txt">0%</span>
    </div>
    <div style="display:flex;gap:6px;justify-content:center;margin-bottom:24px;" id="section-dots"></div>
    <div id="lesson-body">${Loading("Loading lesson...")}</div>
    <div style="display:flex;gap:12px;margin-top:28px;">
      <button id="btn-prev" class="btn btn-ghost" style="flex:1;padding:13px;display:none;" onclick="lessonPrev()">← Back</button>
      <button id="btn-next" class="btn btn-primary" style="flex:1;padding:13px;" onclick="lessonNext()">Next →</button>
      <button id="btn-complete" class="btn" style="flex:1;padding:13px;background:var(--accent-green);color:white;display:none;" onclick="lessonComplete()">✅ Mark Complete</button>
    </div>
  </div>`;
}

let _lessonStarting = false;
async function bindLessonDetail() {
  const l = state.selectedLesson;
  if (_lessonStarting) return;
  _lessonStarting = true;
  if (!l) {
    navigate("subjects");
    return;
  }

  try {
    await api.startProgress(l.id);

    const [sections, progress] = await Promise.all([
      api.getSectionsByLesson(l.id),
      api.getProgress(l.id),
    ]);

    lessonState.lesson = l;
    lessonState.sections = sections || [];
    lessonState.progress = progress || null;

    const savedOrder = progress?.currentSectionOrder ?? 0;

    let currentIndex = 0;
    if (lessonState.sections.length > 0) {
      const foundIndex = lessonState.sections.findIndex(
        (s, i) => (s.contentOrder ?? i) === savedOrder,
      );
      currentIndex = foundIndex >= 0 ? foundIndex : 0;
    }

    lessonState.current = currentIndex;

    document.getElementById("lesson-title").textContent = l.title || "Lesson";
    renderLessonSection();
  } catch (e) {
    if (!e.message?.includes("409")) {
      document.getElementById("lesson-body").innerHTML = ErrorState(e.message);
    }
  } finally {
    _lessonStarting = false;
  }
}

function renderLessonSection() {
  const { sections, current } = lessonState;

  if (!sections.length) {
    document.getElementById("lesson-body").innerHTML = EmptyState(
      "📭",
      "No content",
      "This lesson has no sections yet.",
    );
    return;
  }

  const total = sections.length;
  const pct = Math.round(((current + 1) / total) * 100);
  const isLast = current === total - 1;
  const isFirst = current === 0;

  document.getElementById("lesson-progress-fill").style.width = pct + "%";
  document.getElementById("lesson-progress-txt").textContent = pct + "%";

  document.getElementById("section-dots").innerHTML = sections
    .map(
      (_, i) =>
        `<div class="section-dot ${i < current ? "done" : i === current ? "active" : ""}"></div>`,
    )
    .join("");

  const sec = sections[current];
  const contentHtml = sec.content
    ? `<div style="color:var(--text-700);line-height:1.8;font-size:15px;margin-top:16px;">${sec.content}</div>`
    : "";
  const imageHtml = sec.imageUrl
    ? `<img src="${sec.imageUrl}" alt="${sec.title || ""}" style="width:100%;border-radius:var(--radius-lg);margin-top:16px;max-height:280px;object-fit:cover;" />`
    : "";

  document.getElementById("lesson-body").innerHTML = `
    <div class="card" style="padding:28px;">
      <span class="badge badge-new" style="margin-bottom:12px;display:inline-flex;">Section ${current + 1} of ${total}</span>
      <h2 style="font-size:20px;margin-bottom:0;">${sec.title || "Section " + (current + 1)}</h2>
      ${imageHtml}${contentHtml}
    </div>`;

  document.getElementById("btn-prev").style.display = isFirst ? "none" : "";
  document.getElementById("btn-next").style.display = isLast ? "none" : "";
  document.getElementById("btn-complete").style.display = isLast ? "" : "none";

  api
    .updateProgress(lessonState.lesson.id, {
      progressPercent: pct,
      currentSectionOrder: sec.contentOrder ?? current,
    })
    .catch(() => {});
}

function lessonPrev() {
  if (lessonState.current > 0) {
    lessonState.current--;
    renderLessonSection();
    window.scrollTo(0, 0);
  }
}
function lessonNext() {
  if (lessonState.current < lessonState.sections.length - 1) {
    lessonState.current++;
    renderLessonSection();
    window.scrollTo(0, 0);
  }
}
async function lessonComplete() {
  const btn = document.getElementById("btn-complete");
  btn.disabled = true;
  btn.textContent = "⏳ Saving...";
  try {
    await api.completeLesson(lessonState.lesson.id);
    showToast("Lesson completed! Great job!", "🏆");
    setTimeout(() => navigate("lessons"), 1500);
  } catch (e) {
    showToast("Could not save. Try again.", "⚠️");
    btn.disabled = false;
    btn.textContent = "✅ Mark Complete";
  }
}

/* ============================================================
   PAGE: GAMES (Brain Arcade — UI showcase, navigates to lessons)
   ============================================================ */
function GamesPage() {
  const games = [
    {
      id: "word",
      subj: "English",
      title: "Word Scramble",
      desc: "Unscramble letters to find hidden vocabulary words!",
      icon: "🧠",
      diff: "Easy",
      xp: 50,
    },
    {
      id: "math",
      subj: "Mathematics",
      title: "Math Ninja",
      desc: "Slice through correct numbers and solve equations fast.",
      icon: "⚡",
      diff: "Medium",
      xp: 100,
    },
    {
      id: "logic",
      subj: "Logic",
      title: "Logic Puzzles",
      desc: "Connect the dots and solve the mystery of Zapote Bridge.",
      icon: "🧩",
      diff: "Hard",
      xp: 150,
    },
    {
      id: "eco",
      subj: "Science",
      title: "Eco-Sorter",
      desc: "Help clean up Bacoor by sorting items into the right bins!",
      icon: "🌟",
      diff: "Medium",
      xp: 80,
    },
  ];
  const diffClass = {
    Easy: "badge-easy",
    Medium: "badge-medium",
    Hard: "badge-hard",
  };
  return `<div class="page">
    <div class="flex-between mb-24">
      <div>
        <div style="display:flex;align-items:center;gap:12px;">
          <h1 style="font-size:28px;">Brain Arcade</h1>
          <span style="font-size:24px;">🎮</span>
        </div>
        <p style="color:var(--text-400);font-size:14px;">Have fun and earn XP with these mini-challenges!</p>
      </div>
      <div class="stat-chip" style="background:#FEF3C7;border-color:#FDE68A;">
        <span style="color:var(--accent-orange);">${icons.star}</span>
        <span style="color:#92400E;font-weight:700;">Top Score: 2,500</span>
      </div>
    </div>

    <!-- Featured hero -->
    <div style="background:linear-gradient(135deg,#3730A3 0%,#4F46E5 50%,#6366F1 100%);border-radius:var(--radius-xl);padding:36px;margin-bottom:28px;position:relative;overflow:hidden;cursor:pointer;" onclick="launchGame('memory')">
      <div style="position:absolute;right:-10px;top:50%;transform:translateY(-50%);opacity:0.15;">
        <svg viewBox="0 0 200 200" width="220" height="220" fill="none" stroke="white" stroke-width="6">
          <rect x="20" y="60" width="160" height="100" rx="30"/>
          <path d="M60 110h20m-10-10v20M130 105h5M145 105h5M130 115h5M145 115h5"/>
          <circle cx="100" cy="35" r="20"/>
          <path d="M80 55 Q100 45 120 55"/>
        </svg>
      </div>
      <span style="display:inline-block;background:rgba(255,255,255,0.18);color:white;font-size:11px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;padding:4px 12px;border-radius:99px;margin-bottom:16px;">Game of the Week</span>
      <h2 style="color:white;font-size:26px;font-weight:900;margin-bottom:10px;line-height:1.25;">Memory Match:<br>Philippine Flags</h2>
      <p style="color:rgba(255,255,255,0.75);font-size:14px;margin-bottom:24px;">Test your focus and learn about national symbols in this timed card challenge.</p>
      <button class="btn btn-white" style="display:inline-flex;align-items:center;gap:8px;">
        ${icons.play} Play Now
      </button>
    </div>

    <!-- Game cards -->
    <div class="grid-4">
      ${games
        .map(
          (g) => `
        <div class="card card-interactive" style="padding:20px;display:flex;flex-direction:column;" onclick="launchGame('${g.id}')">
          <div style="width:48px;height:48px;border-radius:12px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:14px;">${g.icon}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-size:10px;font-weight:700;color:var(--text-400);text-transform:uppercase;letter-spacing:0.5px;">${g.subj}</span>
            <span class="badge ${diffClass[g.diff]}">${g.diff}</span>
          </div>
          <h3 style="font-size:16px;margin-bottom:6px;">${g.title}</h3>
          <p style="font-size:13px;color:var(--text-400);flex:1;margin-bottom:16px;line-height:1.5;">${g.desc}</p>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="display:flex;align-items:center;gap:5px;font-size:12px;font-weight:700;color:var(--primary);">${icons.zap} +${g.xp} XP</span>
            <button style="width:30px;height:30px;border-radius:50%;background:var(--primary-light);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--primary);">${icons.play}</button>
          </div>
        </div>`,
        )
        .join("")}
    </div>
  </div>`;
}

/* ============================================================
   PAGE: QUIZ
   ============================================================ */
function QuizPage() {
  window._quizState = {
    quiz: null,
    questions: [],
    current: 0,
    selectedChoiceIds: [], // parallel array, one slot per question
    answered: false,
    timer: 300,
    timerInterval: null,
  };

  return `<div class="page" style="max-width:760px;margin:0 auto;" id="quiz-root">
    <div id="quiz-loading" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:320px;gap:16px;">
      <div class="spinner"></div>
      <p style="color:var(--text-400);font-weight:600;">Loading quiz...</p>
    </div>
    <div id="quiz-body" style="display:none;">
      <!-- Header -->
      <div class="flex-between mb-16">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:13px;font-weight:700;color:var(--text-900);padding:6px 14px;background:var(--card-bg);border:1px solid var(--border);border-radius:99px;" id="quiz-title">QUIZ</span>
          <span style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:var(--text-500);" id="quiz-timer">⏱ 5:00</span>
        </div>
        <div style="text-align:right;">
          <span style="font-size:10px;font-weight:700;color:var(--text-400);text-transform:uppercase;letter-spacing:0.5px;">Question</span>
          <div style="font-family:var(--font-display);font-size:22px;font-weight:900;color:var(--text-900);" id="quiz-count">1 / ?</div>
        </div>
      </div>
      <!-- Progress -->
      <div class="progress-track mb-28" style="height:8px;">
        <div class="progress-fill" id="quiz-progress" style="height:8px;width:0%;"></div>
      </div>
      <!-- Question card -->
      <div class="card mb-16" style="padding:36px 40px;">
        <h2 style="font-size:22px;line-height:1.5;color:var(--text-900);font-weight:700;" id="quiz-question"></h2>
      </div>
      <!-- Choices -->
      <div style="display:flex;flex-direction:column;gap:10px;" id="quiz-options"></div>
      <!-- Next / Submit -->
      <div style="display:flex;justify-content:flex-end;margin-top:20px;">
        <button class="btn btn-primary" id="quiz-next-btn" style="display:none;" onclick="quizNext()">Next Question →</button>
      </div>
    </div>
  </div>`;
}

async function quizSelect(idx, choiceId) {
  const qs = window._quizState;
  if (qs.checked[qs.current]) return; // one answer per question
  qs.checked[qs.current] = true;
  qs.selectedChoiceIds[qs.current] = choiceId;

  document.querySelectorAll(".quiz-option").forEach((el) => el.classList.add("locked"));
  const picked = document.getElementById(`opt-${idx}`);
  picked?.classList.add("selected");

  try {
    const q = qs.questions[qs.current];
    const res = await api.checkAnswer({ questionId: q.id, choiceId });
    picked?.classList.remove("selected");

    if (res.correct) {
      picked?.classList.add("correct");
      playSfx("correct");
    } else {
      picked?.classList.add("wrong");
      document
        .querySelector(`.quiz-option[data-choice-id="${Number(res.correctChoiceId)}"]`)
        ?.classList.add("correct");
      playSfx("wrong");
    }
  } catch (e) {
    // Feedback failed, but the answer still counts on submit
  }

  document.getElementById("quiz-next-btn").style.display = "";
}

function quizNext() {
  const qs = window._quizState;
  // if (!qs.answered) {
  //   showToast("Please select an answer first.", "⚠️");
  //   return;
  // }
  if (qs.selectedChoiceIds[qs.current] === null) {
    showToast("Please select an answer first.", "⚠️");
    return;
  }
  qs.current++;
  renderQuizQuestion();
}

async function bindQuiz() {
  const qs = window._quizState;
  const lessonId = state.currentLessonId || 1;

  try {
    const quizzes = await api.getQuizzesByLesson(lessonId);

    if (!quizzes || quizzes.length === 0) {
      document.getElementById("quiz-loading").innerHTML = `
        <div style="text-align:center;padding:48px 0;">
          <div style="font-size:48px;margin-bottom:12px;">📭</div>
          <h3 style="margin-bottom:8px;">No quiz yet</h3>
          <p style="color:var(--text-400);">This lesson doesn't have a quiz attached.</p>
        </div>`;
      return;
    }

    const quiz = quizzes[0];
    qs.quiz = quiz;
    qs.questions = quiz.questions;
    qs.selectedChoiceIds = new Array(quiz.questions.length).fill(null);
    qs.checked = new Array(quiz.questions.length).fill(false);
    qs.timer = 60 * quiz.questions.length;

    document.getElementById("quiz-loading").style.display = "none";
    document.getElementById("quiz-body").style.display = "";
    document.getElementById("quiz-title").textContent = quiz.title;

    renderQuizQuestion();
    startQuizTimer();
  } catch (e) {
    document.getElementById("quiz-loading").innerHTML = `
      <div style="text-align:center;padding:48px 0;">
        <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
        <p style="font-weight:700;color:var(--accent-red);">Failed to load quiz</p>
        <p style="font-size:13px;color:var(--text-400);margin-top:6px;">${e.message}</p>
        <button class="btn btn-ghost" style="margin-top:16px;" onclick="navigate('dashboard')">Go to Dashboard</button>
      </div>`;
  }
}

function startQuizTimer() {
  const qs = window._quizState;
  qs.timerInterval = setInterval(() => {
    qs.timer--;
    const m = Math.floor(qs.timer / 60);
    const s = String(qs.timer % 60).padStart(2, "0");
    const el = document.getElementById("quiz-timer");
    if (el) el.textContent = `⏱ ${m}:${s}`;
    if (qs.timer <= 0) {
      clearInterval(qs.timerInterval);
      showToast("Time's up! Submitting...", "⏰");
      quizSubmit();
    }
  }, 1000);
}

async function quizSubmit() {
  const qs = window._quizState;
  clearInterval(qs.timerInterval);

  // Collect only non-null picks (skipped questions won't count)
  // const selectedChoiceIds = qs.selectedChoiceIds.filter(
  //   (id) => id !== null,
  // );
  const selectedChoiceIds = [...qs.selectedChoiceIds];

  document.getElementById("quiz-root").innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:320px;gap:16px;">
      <div class="spinner"></div>
      <p style="color:var(--text-400);font-weight:600;">Submitting your answers...</p>
    </div>`;

  try {
    const result = await api.submitQuiz({
      quizId: qs.quiz.id,
      studentId: state.user?.id || null,
      selectedChoiceIds,
    });

    // result: { score, totalItems, passed, message }
    const passed = result.passed;
    const emoji = passed ? "🎊" : "💪";
    const headline = passed ? "Quiz Passed!" : "Keep Practicing!";
    const badgeColor = passed ? "var(--accent-green)" : "var(--accent-orange)";
    const correctCount = Math.round((result.score / 100) * result.totalItems);

    document.getElementById("quiz-root").innerHTML = `
      <div class="page" style="max-width:480px;margin:0 auto;text-align:center;padding-top:48px;">
        <div style="font-size:64px;margin-bottom:16px;">${emoji}</div>
        <h1 style="font-size:28px;margin-bottom:8px;">${headline}</h1>
        <p style="color:var(--text-400);margin-bottom:24px;">${result.message}</p>

        <!-- Score ring -->
        <div style="display:inline-flex;flex-direction:column;align-items:center;background:${badgeColor}18;border:2px solid ${badgeColor};border-radius:var(--radius-xl);padding:24px 48px;margin-bottom:24px;">
          <div style="font-family:var(--font-display);font-size:56px;font-weight:900;color:${badgeColor};line-height:1;">${result.score}%</div>
          <div style="font-size:13px;font-weight:700;color:var(--text-500);margin-top:4px;">
            ${correctCount} / ${result.totalItems} correct
          </div>
          <div style="font-size:12px;color:var(--text-400);margin-top:2px;">
            Passing score: ${qs.quiz.passingScore}%
          </div>
        </div>

        <div style="display:flex;gap:12px;justify-content:center;">
          <button class="btn btn-primary" onclick="navigate('quiz', { currentLessonId: ${state.currentLessonId || 1} })">Try Again</button>
          <button class="btn btn-ghost" onclick="navigate('dashboard')">Dashboard</button>
        </div>
      </div>`;
  } catch (e) {
    document.getElementById("quiz-root").innerHTML = `
      <div style="text-align:center;padding:48px 0;">
        <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
        <p style="font-weight:700;color:var(--accent-red);">Submission failed</p>
        <p style="font-size:13px;color:var(--text-400);margin-top:6px;">${e.message}</p>
        <button class="btn btn-ghost" style="margin-top:16px;" onclick="navigate('quiz')">Try Again</button>
      </div>`;
  }
}

function renderQuizQuestion() {
  const qs = window._quizState;
  const q = qs.questions[qs.current];
  const total = qs.questions.length;
  const keys = ["A", "B", "C", "D", "E"];

  qs.answered = false;

  document.getElementById("quiz-question").textContent = q.questionText;
  document.getElementById("quiz-count").innerHTML =
    `${qs.current + 1} <span style="color:var(--text-400);font-size:16px;">/ ${total}</span>`;
  document.getElementById("quiz-progress").style.width =
    Math.round(((qs.current + 1) / total) * 100) + "%";
  document.getElementById("quiz-next-btn").style.display = "none";

  document.getElementById("quiz-options").innerHTML = q.choices
    .map(
      (c, i) => `
    <div class="quiz-option" id="opt-${i}" onclick="quizSelect(${i}, ${c.id})">
      <div class="quiz-option-key" id="opt-key-${i}">${keys[i]}</div>
      <span>${c.choiceText}</span>
    </div>`,
    )
    .join("");

  const nextBtn = document.getElementById("quiz-next-btn");
  if (qs.current === total - 1) {
    nextBtn.textContent = "Submit Quiz ✓";
    nextBtn.onclick = quizSubmit;
  } else {
    nextBtn.textContent = "Next Question →";
    nextBtn.onclick = quizNext;
  }
}

/* ============================================================
      PAGE: AI TUTOR CHAT
      ============================================================ */
function AIChatPage() {
  const userName =
    state.user?.name ||
    state.user?.firstName ||
    state.user?.username ||
    "there";
  const firstName = userName.split(" ")[0];
  return `<div class="page" style="display:flex;flex-direction:column;height:calc(100vh - 72px);">
    <!-- Chat header -->
    <div class="card mb-16" style="padding:16px 20px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:44px;height:44px;border-radius:12px;background:var(--primary);display:flex;align-items:center;justify-content:center;color:white;font-size:20px;">✦</div>
        <div>
          <h3 style="font-size:16px;margin-bottom:1px;">Bibo AI Tutor</h3>
          <div style="display:flex;align-items:center;gap:6px;">
            <div style="width:7px;height:7px;background:#10B981;border-radius:50%;"></div>
            <span style="font-size:11px;font-weight:700;color:#10B981;text-transform:uppercase;letter-spacing:0.5px;">Online & Ready</span>
          </div>
        </div>
      </div>
      <button style="width:34px;height:34px;border-radius:50%;background:var(--bg);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-400);">${icons.history}</button>
    </div>

    <!-- Messages -->
    <div id="chat-messages" style="flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:16px;padding:4px 0 16px;">
      <div style="display:flex;gap:12px;align-items:flex-start;">
        <div style="width:36px;height:36px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:white;font-size:16px;flex-shrink:0;">✦</div>
        <div class="chat-bubble-ai" style="padding:14px 18px;max-width:72%;">
          <p style="font-size:14px;color:var(--text-700);line-height:1.6;">Hello ${firstName}! I'm Bibo, your AI study buddy. What are we learning today? I can help with Math, Science, or English!</p>
          <p style="font-size:11px;color:var(--text-400);margin-top:6px;">10:00 AM</p>
        </div>
      </div>
    </div>

    <!-- Suggestions -->
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;flex-shrink:0;" id="chat-suggestions">
      ${[
        "🧮 Explain Fractions",
        "✏️ Check my Grammar",
        "🌍 Science Trivia",
        "🇵🇭 Tagalog Translation",
      ]
        .map(
          (q) =>
            `<button class="btn btn-ghost btn-sm" style="border-radius:99px;font-size:12px;" onclick="sendSuggestion(this,'${q}')">${q}</button>`,
        )
        .join("")}
    </div>

    <!-- Input -->
    <div style="display:flex;gap:10px;align-items:flex-end;flex-shrink:0;" class="card" style="padding:12px 16px;">
      <textarea id="chat-input" placeholder="Ask Bibo anything..." rows="1"
        class="bibo-input" style="flex:1;resize:none;overflow:hidden;min-height:44px;max-height:120px;border-radius:99px;padding:10px 16px;line-height:1.5;"
        oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px'"
        onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChat();}"></textarea>
      <button style="color:var(--text-400);background:none;border:none;cursor:pointer;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">${icons.mic}</button>
      <button id="chat-send" onclick="sendChat()" class="btn btn-primary btn-icon" style="width:44px;height:44px;border-radius:50%;padding:0;">${icons.send}</button>
    </div>
    <p style="font-size:11px;color:var(--text-400);text-align:center;margin-top:8px;flex-shrink:0;">⚠ Bibo can make mistakes. Always check with your teacher!</p>
  </div>`;
}

function bindAIChat() {}

function sendSuggestion(btn, text) {
  const suggestionsDiv = document.getElementById("chat-suggestions");
  if (suggestionsDiv) suggestionsDiv.style.display = "none";
  const cleanText = text.replace(/^[^\w]+/, "").replace(/^\S+\s/, "");
  document.getElementById("chat-input").value = cleanText;
  sendChat();
}

async function sendChat() {
  const input = document.getElementById("chat-input");
  const msg = input.value.trim();
  if (!msg) return;
  input.value = "";
  input.style.height = "auto";

  const msgs = document.getElementById("chat-messages");
  const now = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  msgs.innerHTML += `<div style="display:flex;justify-content:flex-end;">
    <div class="chat-bubble-user" style="padding:12px 16px;max-width:72%;">
      <p style="font-size:14px;line-height:1.5;">${escapeHtml(msg)}</p>
    </div>
  </div>`;

  const typingId = "typing-" + Date.now();
  msgs.innerHTML += `<div style="display:flex;gap:12px;align-items:flex-start;" id="${typingId}">
    <div style="width:36px;height:36px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:white;font-size:16px;flex-shrink:0;">✦</div>
    <div class="chat-bubble-ai" style="padding:14px 18px;">
      <div style="display:flex;gap:5px;align-items:center;">
        <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
      </div>
    </div>
  </div>`;
  msgs.scrollTop = msgs.scrollHeight;
  document.getElementById("chat-send").disabled = true;

  state.chatHistory.push({ role: "user", content: msg });

  try {
    const res = await api.aiChat({
      message: msg,
      history: state.chatHistory,
    });
    const reply =
      res.reply || res.message || res.response || "I got your message!";
    state.chatHistory.push({ role: "assistant", content: reply });
    document.getElementById(typingId).outerHTML =
      `<div style="display:flex;gap:12px;align-items:flex-start;">
      <div style="width:36px;height:36px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:white;font-size:16px;flex-shrink:0;">✦</div>
      <div class="chat-bubble-ai" style="padding:14px 18px;max-width:72%;">
        <p style="font-size:14px;color:var(--text-700);line-height:1.6;">${escapeHtml(reply)}</p>
        <p style="font-size:11px;color:var(--text-400);margin-top:6px;">${now}</p>
      </div>
    </div>`;
  } catch (e) {
    document.getElementById(typingId).outerHTML =
      `<div style="display:flex;gap:12px;align-items:flex-start;">
      <div style="width:36px;height:36px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:white;font-size:16px;flex-shrink:0;">✦</div>
      <div class="chat-bubble-ai" style="padding:14px 18px;max-width:72%;">
        <p style="font-size:14px;color:var(--accent-red);">Sorry, I couldn't connect. Please try again! 😅</p>
      </div>
    </div>`;
  }
  document.getElementById("chat-send").disabled = false;
  msgs.scrollTop = msgs.scrollHeight;
}

/* ============================================================
   PAGE: RESEARCH / DISCOVER
   ============================================================ */
function ResearchPage() {
  const topics = [
    {
      icon: icons.location,
      title: "Bacoor History",
      desc: "Discover the 'City of Strike' and the history of Zapote Bridge.",
      color: "#F59E0B",
      pale: "#FEF3C7",
    },
    {
      icon: icons.globe,
      title: "Space & Stars",
      desc: "How far is the moon? Learn about our amazing solar system.",
      color: "#3B3FC4",
      pale: "#EEF0FF",
    },
    {
      icon: icons.beaker,
      title: "Ocean Life",
      desc: "Meet the creatures living in the deep blue sea.",
      color: "#10B981",
      pale: "#D1FAE5",
    },
    {
      icon: icons.book,
      title: "Ancient Giants",
      desc: "Explore the era of Dinosaurs and how they lived.",
      color: "#8B5CF6",
      pale: "#EDE9FE",
    },
  ];
  return `<div class="page">
    <div style="text-align:center;margin-bottom:36px;">
      <p style="font-size:11px;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:10px;">✦ Powered by BIBO AI</p>
      <h1 style="font-size:40px;line-height:1.15;max-width:560px;margin:0 auto 28px;">What do you want to discover today?</h1>
      <div style="position:relative;max-width:640px;margin:0 auto;">
        <span style="position:absolute;left:18px;top:50%;transform:translateY(-50%);color:var(--text-400);">${icons.research}</span>
        <input type="text" id="research-input" placeholder="Search for history, science, or local facts..." 
          class="bibo-input" style="padding:16px 20px 16px 50px;border-radius:var(--radius-xl);font-size:15px;box-shadow:var(--shadow-md);"
          onkeydown="if(event.key==='Enter')doResearch()" />
      </div>
      <div id="research-results" style="max-width:640px;margin:16px auto 0;"></div> 
    </div>

    <!-- Trending topics -->
    <div class="section-header">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="color:var(--primary);">${icons.trend}</span>
        <span class="section-title">Trending Topics</span>
      </div>
    </div>
    <div class="grid-4 mb-32">
      ${topics
        .map(
          (t) => `
        <div class="card card-interactive" style="padding:22px;">
          <div style="width:44px;height:44px;border-radius:12px;background:${t.pale};display:flex;align-items:center;justify-content:center;color:${t.color};margin-bottom:14px;">${t.icon}</div>
          <h3 style="font-size:16px;margin-bottom:8px;">${t.title}</h3>
          <p style="font-size:13px;color:var(--text-400);line-height:1.5;margin-bottom:14px;">${t.desc}</p>
          <span style="font-size:13px;font-weight:700;color:${t.color};cursor:pointer;">Explore →</span>
        </div>`,
        )
        .join("")}
    </div>

    <!-- Local spotlight -->
    <div style="display:grid;grid-template-columns:1fr 1.5fr;gap:24px;align-items:center;">
      <div style="height:200px;background:linear-gradient(135deg,#1E2A78,#3B3FC4);border-radius:var(--radius-xl);display:flex;align-items:center;justify-content:center;font-size:60px;">🏙</div>
      <div class="card" style="padding:28px;">
        <span style="display:inline-block;background:#FEF3C7;color:#92400E;font-size:11px;font-weight:700;letter-spacing:0.5px;padding:4px 12px;border-radius:99px;margin-bottom:12px;">Local Spotlight: Bacoor</span>
        <h2 style="font-size:20px;margin-bottom:8px;">The Battle of Zapote Bridge</h2>
        <p style="font-size:13px;color:var(--text-400);line-height:1.6;margin-bottom:16px;">Learn about the pivotal battle that took place right here in Bacoor during the Philippine-American War in 1897.</p>
        <button class="btn btn-primary btn-sm">Read More →</button>
      </div>
    </div>

    <style>@media(max-width:700px){.research-local-grid{grid-template-columns:1fr !important;}}</style>
  </div>`;
}

/* ============================================================
   PAGE: ACHIEVEMENTS / HALL OF FAME
   ============================================================ */
function AchievementsPage() {
  const statCard = (id, icon, label, color) => `
        <div class="card" style="padding:20px;">
          <p style="font-size:10px;font-weight:700;color:var(--text-400);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">${label}</p>
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:22px;">${icon}</span>
            <span id="${id}" style="font-family:var(--font-display);font-size:22px;font-weight:900;color:${color};">—</span>
          </div>
        </div>`;

  return `<div class="page">
    <div class="flex-between mb-28">
      <div>
        <h1 style="font-size:28px;margin-bottom:4px;">Hall of Fame</h1>
        <p style="color:var(--text-400);font-size:14px;">Every lesson is a step toward greatness!</p>
      </div>
      <div class="card" style="padding:16px 24px;text-align:center;">
        <div style="display:flex;gap:32px;">
          <div><p style="font-size:10px;font-weight:700;color:var(--text-400);text-transform:uppercase;margin-bottom:2px;">Total XP</p><p id="ach-xp" style="font-family:var(--font-display);font-size:22px;font-weight:900;color:var(--primary);">—</p></div>
          <div><p style="font-size:10px;font-weight:700;color:var(--text-400);text-transform:uppercase;margin-bottom:2px;">Rank</p><p id="ach-rank" style="font-family:var(--font-display);font-size:22px;font-weight:900;color:var(--accent-orange);">—</p></div>
        </div>
      </div>
    </div>

    <div class="grid-4 mb-32">
      ${statCard("ach-streak", "🔥", "Current Streak", "#F59E0B")}
      ${statCard("ach-lessons", "✅", "Lessons Finished", "#10B981")}
      ${statCard("ach-perfect", "⭐", "Perfect Quizzes", "#F59E0B")}
      ${statCard("ach-passed", "📈", "Quizzes Passed", "var(--primary)")}
    </div>

    <div class="ach-grid" style="display:grid;grid-template-columns:1.4fr 1fr;gap:24px;align-items:start;">
      <div>
        <div class="section-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="color:var(--primary);font-size:20px;">🏅</span>
            <span class="section-title">My Badges</span>
          </div>
        </div>
        <div id="ach-badges" class="grid-2">${Loading()}</div>
      </div>

      <div class="card" style="padding:20px;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <span style="font-size:18px;">👥</span>
          <span class="section-title">Top Learners</span>
        </div>
        <div id="ach-leaderboard">${Loading()}</div>
        <div style="text-align:center;margin-top:16px;">
          <span id="ach-toggle" style="font-size:13px;font-weight:700;color:var(--primary);cursor:pointer;display:none;" onclick="toggleFullRankings()">View Full Rankings →</span>
        </div>
      </div>
    </div>

    <style>@media(max-width:768px){.ach-grid{grid-template-columns:1fr !important;}}</style>
  </div>`;
}

let _showFullRankings = false;

async function bindAchievements() {
  const $ = (id) => document.getElementById(id);
  _showFullRankings = false;

  try {
    const [st, lb] = await Promise.all([loadStats(), api.getLeaderboard(5)]);
    if (!$("ach-xp")) return; // navigated away

    $("ach-xp").textContent = st.xp.toLocaleString();
    $("ach-rank").textContent = lb.myRank ? `#${lb.myRank}` : "—";
    $("ach-streak").textContent =
      `${st.streak} ${st.streak === 1 ? "Day" : "Days"}`;
    $("ach-lessons").textContent = st.lessonsCompleted;
    $("ach-perfect").textContent = st.perfectQuizzes;
    $("ach-passed").textContent = st.quizzesPassed;

    $("ach-badges").innerHTML = st.badges
      .map(
        (b) => `
      <div class="card" style="padding:20px;${b.earned ? "" : "opacity:0.45;"}">
        <div style="width:44px;height:44px;border-radius:12px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:12px;">${b.earned ? b.icon : "🔒"}</div>
        <h3 style="font-size:14px;margin-bottom:4px;">${escapeHtml(b.title)}</h3>
        <p style="font-size:12px;color:var(--text-400);margin-bottom:8px;">${escapeHtml(b.description)}</p>
        ${
          b.earned
            ? `<p style="font-size:11px;font-weight:700;color:var(--accent-green);text-transform:uppercase;letter-spacing:0.5px;">Earned ${fmtShortDate(b.earnedAt)}</p>`
            : `<p style="font-size:11px;color:var(--text-400);">🔒 Locked</p>`
        }
      </div>`,
      )
      .join("");

    renderLeaderboard(lb);
  } catch (e) {
    if (!state.token) return;
    if ($("ach-badges"))
      $("ach-badges").innerHTML = ErrorState("Could not load achievements");
    if ($("ach-leaderboard")) $("ach-leaderboard").innerHTML = "";
  }
}

function renderLeaderboard(lb) {
  const box = document.getElementById("ach-leaderboard");
  if (!box) return;

  box.innerHTML = lb.entries.length
    ? lb.entries
        .map(
          (r) => `
      <div class="leaderboard-row ${r.me ? "me" : ""}">
        <span style="font-size:13px;font-weight:800;color:${r.rank <= 3 ? "var(--accent-orange)" : "var(--text-400)"};width:24px;">#${r.rank}</span>
        <div style="width:34px;height:34px;border-radius:50%;background:${r.me ? "var(--primary)" : "var(--bg)"};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:${r.me ? "white" : "var(--text-500)"};">${escapeHtml(r.initials)}</div>
        <span style="flex:1;font-size:13px;font-weight:${r.me ? "800" : "600"};color:var(--text-900);">${escapeHtml(r.displayName)}${r.me ? " (You)" : ""}</span>
        <span style="font-size:13px;font-weight:700;color:${r.me ? "var(--primary)" : "var(--text-500)"};">${r.xp.toLocaleString()} XP</span>
      </div>`,
        )
        .join("")
    : EmptyState(
        "👥",
        "No learners yet",
        "Complete a lesson to get on the board!",
      );

  // Caller is outside the visible list → show their own row at the bottom
  if (lb.myRank && !lb.entries.some((r) => r.me)) {
    box.innerHTML += `
      <div class="leaderboard-row me" style="margin-top:8px;">
        <span style="font-size:13px;font-weight:800;color:var(--text-400);width:24px;">#${lb.myRank}</span>
        <span style="flex:1;font-size:13px;font-weight:800;color:var(--text-900);">You</span>
        <span style="font-size:13px;font-weight:700;color:var(--primary);">${lb.myXp.toLocaleString()} XP</span>
      </div>`;
  }

  const toggle = document.getElementById("ach-toggle");
  if (toggle) {
    toggle.style.display = lb.totalStudents > 5 ? "" : "none";
    toggle.textContent = _showFullRankings
      ? "Show Top 5 ↑"
      : "View Full Rankings →";
  }
}

async function toggleFullRankings() {
  _showFullRankings = !_showFullRankings;
  try {
    renderLeaderboard(await api.getLeaderboard(_showFullRankings ? 50 : 5));
  } catch (e) {
    showToast("Could not load rankings", "⚠️");
  }
}

/* ============================================================
   PAGE: SETTINGS
   ============================================================ */
function SettingsPage() {
  const name =
    state.user?.name ||
    state.user?.firstName ||
    state.user?.username ||
    "Learner";
  const username = state.user?.username || "";
  return `<div class="page" style="max-width:680px;">
    <h1 style="font-size:26px;margin-bottom:4px;">Settings</h1>
    <p style="color:var(--text-400);font-size:14px;margin-bottom:28px;">Manage your account and preferences</p>

    <!-- Profile -->
    <div class="card mb-16" style="padding:24px;">
      <h3 style="font-size:16px;margin-bottom:16px;">Profile</h3>
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
        <div style="width:56px;height:56px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:white;font-family:var(--font-display);font-weight:900;font-size:20px;">${name[0].toUpperCase()}</div>
        <div>
          <p style="font-weight:700;font-size:15px;color:var(--text-900);">${name}</p>
          <p style="font-size:13px;color:var(--text-400);">@${username}</p>
        </div>
        <button class="btn btn-ghost btn-sm" style="margin-left:auto;">Edit Profile</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:14px;">
        ${[
          ["Display Name", name, "text"],
          ["Email", state.user?.email || "—", "email"],
        ]
          .map(
            ([l, v]) => `
          <div>
            <label style="display:block;font-size:12px;font-weight:700;color:var(--text-400);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">${l}</label>
            <input type="text" value="${v}" class="bibo-input" readonly style="background:var(--bg);cursor:default;" />
          </div>`,
          )
          .join("")}
      </div>
    </div>

    <!-- Preferences -->
    <div class="card mb-16" style="padding:24px;">
      <h3 style="font-size:16px;margin-bottom:16px;">Preferences</h3>
      ${[
        [
          "🔔",
          "Push Notifications",
          "Get reminders for daily learning goals",
          "pref-notif",
          false,
          "",
        ],
        [
          "🔊",
          "Sound Effects",
          "Enable sounds for correct/wrong answers",
          "pref-sound",
          getSoundEnabled(),
          "setSoundEnabled(this.checked)",
        ],
        [
          "🌙",
          "Dark Mode",
          "Switch to a darker interface",
          "pref-dark",
          getTheme() === "dark",
          "toggleTheme(this.checked)",
        ],
      ]
        .map(
          ([icon, label, desc, id, checked, onchange]) => `
        <label for="${id}" class="pref-row">
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:20px;">${icon}</span>
            <div>
              <p style="font-size:14px;font-weight:600;color:var(--text-900);">${label}</p>
              <p style="font-size:12px;color:var(--text-400);">${desc}</p>
            </div>
          </div>
          <span class="switch">
            <input type="checkbox" id="${id}" ${checked ? "checked" : ""} ${onchange ? `onchange="${onchange}"` : ""} />
            <span class="switch-track"></span>
          </span>
        </label>`,
        )
        .join("")}
    </div>

    <!-- Account -->
    <div class="card mb-16" style="padding:24px;">
      <h3 style="font-size:16px;margin-bottom:16px;">Account</h3>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <button class="btn btn-ghost" style="justify-content:flex-start;border-radius:var(--radius-sm);">🔑 Change Password</button>
        <button class="btn btn-ghost" style="justify-content:flex-start;border-radius:var(--radius-sm);">📋 Download My Data</button>
        <button style="display:flex;align-items:center;gap:10px;padding:10px 20px;border-radius:var(--radius-sm);background:none;border:1.5px solid #FECACA;color:var(--accent-red);font-size:14px;font-weight:700;cursor:pointer;transition:all 0.18s;" onclick="clearAuth();render();">
          ${icons.logout} Sign Out
        </button>
      </div>
    </div>
  </div>`;
}

/* ============================================================
   PAGE: PARENT VIEW
   ============================================================ */
function ParentViewPage() {
  const tips = [
    "Set a fixed study schedule every day, even 20 minutes helps.",
    "Celebrate small wins — praise boosts motivation for young learners.",
    "Review quiz results together and ask your child to explain their answers.",
  ];

  const cardHead = (title, sub = "") => `
    <div class="pd-card-head">
      <h3>${title}</h3>
      ${sub ? `<p>${sub}</p>` : ""}
    </div>`;

  return `<div class="page pd">

    <!-- ── Header ── -->
    <header class="pd-header">
      <div>
        <h1>Parent Dashboard 👨‍👩‍👧</h1>
        <p class="pd-sub">Monitor your child's learning journey</p>
      </div>

      <div class="pd-bell">
        <button class="pd-bell-btn" onclick="toggleParentNotifs()" aria-label="Notifications">🔔</button>
        <span id="notif-badge" class="pd-bell-badge" style="display:none;">0</span>
        <div id="notif-dropdown" class="pd-notif" style="display:none;">
          <div class="pd-notif-head">
            <span>Notifications</span>
            <button onclick="clearNotifs(event)">Mark all read</button>
          </div>
          <div id="notif-list"><p class="pd-empty">No notifications yet.</p></div>
        </div>
      </div>
    </header>

    <!-- ── Child profile ── -->
    <section class="card pd-child">
      <div class="pd-child-info">
        <div class="pd-avatar">🦁</div>
        <div>
          <p class="pd-child-name" id="parent-child-name">Loading...</p>
          <p class="pd-sub" id="parent-child-grade">Student</p>
        </div>
      </div>
      <div class="pd-child-switch">
        <span>Linked Children</span>
        <button class="pd-chip pd-chip-active" onclick="showLinkedChildrenModal()" title="View linked children">🦁</button>
        <button class="pd-chip" onclick="showLinkChildModal()" title="Link new child">➕</button>
      </div>
    </section>

    <!-- ── Stats ── -->
    <section id="parent-stats" class="grid-4 pd-section">${Loading()}</section>

    <!-- ── Main grid ── -->
    <div class="pd-layout">

      <!-- Left: progress & activity -->
      <div class="pd-col">
        <section class="pd-banner">
          <div class="pd-banner-icon">📋</div>
          <div style="flex:1;min-width:0;">
            <p class="pd-banner-title">DepEd ARAL Program Alignment</p>
            <p class="pd-banner-text">Lessons follow the DepEd ARAL small-group tutorial structure for foundational learning recovery.</p>
          </div>
          <div class="pd-banner-phase">
            <strong id="parent-learning-week">Week —</strong>
            <span>Learning Phase</span>
          </div>
        </section>

        <section class="card pd-card">
          ${cardHead("Subject Progress", "Completion per subject")}
          <div id="parent-subjects" class="pd-list">${Loading()}</div>
        </section>

        <section class="card pd-card">
          ${cardHead("Recent Quiz Results 📝", "Latest attempts and scores")}
          <div id="parent-quizzes" class="pd-list">${Loading()}</div>
        </section>

        <section class="card pd-card">
          ${cardHead("Weekly Activity 📅", "Lessons completed per day this week")}
          <div class="pd-chart" id="parent-week">${Loading()}</div>
        </section>
      </div>

      <!-- Right: insights & actions -->
      <aside class="pd-col">
        <section class="card pd-card pd-streak">
          <span class="pd-streak-icon">🔥</span>
          <div>
            <p class="pd-row-title">Learning Streak</p>
            <p class="pd-row-sub" id="parent-streak-sub">Consecutive days of activity</p>
          </div>
          <div class="pd-streak-num"><strong id="parent-streak">—</strong><span id="parent-streak-unit">days</span></div>
        </section>

        <section class="card pd-card">
          ${cardHead("Areas to Improve 💪", "Subjects below 50%")}
          <div id="parent-weak" class="pd-list">${Loading()}</div>
        </section>

        <section class="card pd-card">
          ${cardHead("Intervention Tools 🛠️", "Support your child directly")}

          <div class="pd-tool">
            <p class="pd-tool-title">💬 Send Encouragement</p>
            <div class="pd-btn-row">
              ${ENCOURAGEMENTS.map(
                (m, i) =>
                  `<button onclick="parentAction('message-child', { message: ENCOURAGEMENTS[${i}] }, 'Message sent!')" class="btn btn-ghost btn-sm">${m}</button>`,
              ).join("")}
            </div>
          </div>

          <div class="pd-tool">
            <p class="pd-tool-title">🎯 Daily Goal <span class="pd-row-sub">— lessons per day</span></p>
            <p class="pd-row-sub" id="parent-goal-today" style="margin-bottom:8px;">&nbsp;</p>
            <div class="pd-goal">
              <input type="range" min="1" max="10" value="3" id="daily-goal-slider"
                oninput="document.getElementById('goal-val').textContent=this.value" />
              <div class="pd-goal-val" id="goal-val">3</div>
            </div>
            <button onclick="saveDailyGoal()"
              class="btn btn-primary btn-sm pd-full">Save Goal</button>
          </div>

          <div class="pd-tool">
            <p class="pd-tool-title">👩‍🏫 Teacher Review</p>
            <p class="pd-row-sub" style="margin-bottom:10px;">Ask a teacher to check your child's progress</p>
            <button onclick="parentAction('request-teacher-review', {}, 'Review request sent to teacher!')"
              class="btn btn-ghost btn-sm pd-full">Send Request</button>
          </div>
        </section>

        <section class="card pd-card">
          ${cardHead("💡 Parent Tips")}
          <ol class="pd-tips">
            ${tips.map((t) => `<li>${t}</li>`).join("")}
          </ol>
        </section>
      </aside>
    </div>

    <!-- ── Link Child Modal ── -->
    <div id="link-child-modal" class="pd-modal" style="display:none;">
      <div class="card pd-modal-box">
        <h3 style="margin-bottom:6px;">🔗 Link a Child</h3>
        <p class="pd-sub" style="margin-bottom:20px;">Enter your child's username</p>
        <input id="modal-child-username" type="text" placeholder="Child username (e.g. juandelacruz123)" class="bibo-input" style="margin-bottom:20px;" />
        <div style="display:flex;gap:12px;">
          <button onclick="closeLinkChildModal()" class="btn btn-ghost" style="flex:1;">Cancel</button>
          <button onclick="linkChildFromModal()" id="link-child-confirm-btn" class="btn btn-primary" style="flex:1;">Link Child</button>
        </div>
      </div>
    </div>

    <!-- ── Linked Children Modal ── -->
    <div id="linked-children-modal" class="pd-modal" style="display:none;">
      <div class="card pd-modal-box" style="max-width:500px;max-height:80vh;overflow-y:auto;">
        <div class="flex-between" style="margin-bottom:20px;">
          <h3>👨‍👩‍👧 Linked Children</h3>
          <button onclick="closeLinkedChildrenModal()" class="btn btn-ghost btn-sm">Close</button>
        </div>
        <div id="linked-children-list" style="display:flex;flex-direction:column;gap:12px;"></div>
        <button onclick="showLinkChildModal();closeLinkedChildrenModal()" class="btn btn-primary pd-full" style="margin-top:20px;">+ Link Another Child</button>
      </div>
    </div>

  </div>`;
}

async function linkChild() {
  const input = document.getElementById("child-username-input");
  const username = input.value.trim();

  if (!username) {
    showToast("Please enter child username", "⚠️");
    return;
  }

  const btn = event.currentTarget; // or find button another way
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Linking...";

  try {
    await api.request(
      "POST",
      "/parent/link-child",
      {
        childUsername: username,
      },
      state.token,
    );

    showToast("Child linked successfully! 🎉", "✅");
    input.value = ""; // clear input

    // Refresh parent dashboard
    setTimeout(() => {
      bindParent();
    }, 800);
  } catch (err) {
    showToast(err.message || "Failed to link child", "❌");
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

function showLinkedChildrenModal() {
  const modal = document.getElementById("linked-children-modal");
  if (!modal) return;

  modal.style.display = "flex";
  loadLinkedChildren();
}

function closeLinkedChildrenModal() {
  const modal = document.getElementById("linked-children-modal");
  if (modal) modal.style.display = "none";
}

async function loadLinkedChildren() {
  const container = document.getElementById("linked-children-list");
  const titleEl = document.querySelector("#linked-children-modal h3");

  container.innerHTML = Loading("Loading children...");

  try {
    const children = await api.request(
      "GET",
      "/parent/children",
      null,
      state.token,
    );

    if (titleEl) {
      titleEl.textContent = `👨‍👩‍👧 Linked Children (${children.length || 0})`;
    }

    if (!children || children.length === 0) {
      container.innerHTML = `<p style="text-align:center;padding:40px;color:var(--text-400);">No children linked yet.</p>`;
      return;
    }

    container.innerHTML = children
      .map((child) => {
        const fullName =
          `${child.firstName || ""} ${child.lastName || ""}`.trim() ||
          child.username ||
          "Unknown Child";

        return `
                  <div class="card" onclick="selectChild(${child.childId})" style="cursor:pointer;padding:16px;display:flex;align-items:center;gap:14px;">
                      <div style="width:48px;height:48px;border-radius:12px;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-size:24px;">🦁</div>
                      <div style="flex:1;min-width:0;">
                          <p style="font-weight:700;font-size:15px;">${fullName}</p>
                          <p style="font-size:13px;color:var(--text-400);">@${child.username || "unknown"}</p>
                      </div>
                      <div style="text-align:right;">
                          <span style="font-size:13px;font-weight:700;color:var(--accent-green);">Linked</span>
                      </div>
                  </div>`;
      })
      .join("");
  } catch (e) {
    console.error(e);
    container.innerHTML = `<p style="color:var(--accent-red);text-align:center;padding:40px;">Failed to load linked children</p>`;
  }
}

function selectChild(id) {
  state.selectedChildId = id;
  closeLinkedChildrenModal();
  bindParent();
}

function showLinkChildModal() {
  const modal = document.getElementById("link-child-modal");
  if (!modal) {
    showToast("Modal not ready. Please refresh the page.", "⚠️");
    return;
  }
  modal.style.display = "flex";
  setTimeout(() => {
    const input = document.getElementById("modal-child-username");
    if (input) input.focus();
  }, 50);
}

function closeLinkChildModal() {
  const modal = document.getElementById("link-child-modal");
  if (modal) modal.style.display = "none";

  const input = document.getElementById("modal-child-username");
  if (input) input.value = "";
}

async function linkChildFromModal() {
  const input = document.getElementById("modal-child-username");
  if (!input) return;

  const childUsername = input.value.trim();
  if (!childUsername) {
    showToast("Please enter child username", "⚠️");
    return;
  }

  const btn = document.getElementById("link-child-confirm-btn");
  const originalText = btn ? btn.textContent : "Link Child";

  if (btn) {
    btn.disabled = true;
    btn.textContent = "Linking...";
  }

  try {
    await api.request(
      "POST",
      "/parent/link-child",
      {
        childUsername: childUsername,
      },
      state.token,
    );

    showToast("Child linked successfully! 🎉", "✅");
    closeLinkChildModal();
    setTimeout(() => bindParent(), 800); // refresh dashboard
  } catch (error) {
    console.error(error);

    if (error.message.includes("already linked")) {
      showToast("This child is already linked to your account!", "ℹ️");
    } else if (error.message.includes("not found")) {
      showToast("Child username not found. Please check spelling.", "❌");
    } else {
      showToast(error.message || "Failed to link child", "❌");
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }
}

function toggleParentNotifs() {
  const d = document.getElementById("notif-dropdown");
  if (d) d.style.display = d.style.display === "none" ? "block" : "none";
}
/* ── Parent notifications: "read" = older than the last time the parent
   cleared them for this child (kept per browser, no server state needed) ── */
const NOTIF_STYLE = {
  QUIZ_PASSED: { icon: "🏆", bg: "#d1fae5" },
  QUIZ_FAILED: { icon: "⚠️", bg: "#fef3c7" },
  LESSON_COMPLETED: { icon: "📘", bg: "#eef0ff" },
  GOAL_REACHED: { icon: "🎯", bg: "#fce7f3" },
  NEW_LESSON: { icon: "📚", bg: "#eef0ff" },
};
let _parentNotifs = [];

function notifSeenKey() {
  return `bibo_notif_seen_${state.selectedChildId}`;
}
function getNotifSeen() {
  try {
    return Number(localStorage.getItem(notifSeenKey())) || 0;
  } catch {
    return 0;
  }
}

function timeAgo(iso) {
  const t = new Date(iso).getTime();
  if (!t) return "";
  const mins = Math.floor((Date.now() - t) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

function renderParentNotifs() {
  const list = document.getElementById("notif-list");
  const badge = document.getElementById("notif-badge");
  if (!list || !badge) return;

  const seen = getNotifSeen();
  const unread = _parentNotifs.filter((n) => new Date(n.at).getTime() > seen).length;
  badge.textContent = unread;
  badge.style.display = unread ? "" : "none";

  list.innerHTML = _parentNotifs.length
    ? _parentNotifs
        .map((n) => {
          const st = NOTIF_STYLE[n.type] || { icon: "🔔", bg: "#eef0ff" };
          const isUnread = new Date(n.at).getTime() > seen;
          return `<div class="pd-notif-item">
            <div class="pd-icon" style="background:${st.bg};">${st.icon}</div>
            <div style="flex:1;min-width:0;">
              <p class="pd-row-title">${escapeHtml(n.title)}</p>
              <p class="pd-row-sub">${escapeHtml(n.description)}</p>
              <p class="pd-row-meta">${timeAgo(n.at)}</p>
            </div>
            ${isUnread ? '<span class="pd-dot"></span>' : ""}
          </div>`;
        })
        .join("")
    : `<p class="pd-empty">No activity in the last 7 days.</p>`;
}

function clearNotifs(e) {
  e.stopPropagation();
  const newest = Math.max(0, ..._parentNotifs.map((n) => new Date(n.at).getTime() || 0));
  try {
    localStorage.setItem(notifSeenKey(), String(Math.max(newest, Date.now())));
  } catch {}
  renderParentNotifs();
  document.getElementById("notif-dropdown").style.display = "none";
  showToast("All notifications marked as read");
}

function renderParentOverview(o) {
  const $ = (id) => document.getElementById(id);
  if (!$("parent-week")) return; // navigated away

  // Streak
  $("parent-streak").textContent = o.streak;
  $("parent-streak-unit").textContent = o.streak === 1 ? "day" : "days";
  $("parent-streak-sub").textContent =
    o.longestStreak > 0 ? `Best: ${o.longestStreak} day${o.longestStreak === 1 ? "" : "s"}` : "No activity yet";

  // Learning week (weeks since first activity)
  $("parent-learning-week").textContent = `Week ${o.learningWeek}`;

  // Daily goal: slider shows the saved goal
  const slider = $("daily-goal-slider");
  if (slider) {
    slider.value = o.dailyGoal;
    $("goal-val").textContent = o.dailyGoal;
  }
  $("parent-goal-today").textContent =
    `Today: ${o.todayCompleted} of ${o.dailyGoal} lesson${o.dailyGoal === 1 ? "" : "s"}` +
    (o.dailyGoalSetByParent ? "" : " (default goal)");

  // Weekly activity
  const max = Math.max(1, ...o.weeklyActivity.map((d) => d.lessonsCompleted));
  const todayIso = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD, local time
  $("parent-week").innerHTML = o.weeklyActivity
    .map((d) => {
      const v = d.lessonsCompleted;
      const h = Math.round((v / max) * 100);
      const isToday = d.date === todayIso;
      return `<div class="pd-bar-col">
        <span class="pd-bar-val">${v}</span>
        <div class="pd-bar-track">
          <div class="pd-bar ${isToday ? "today" : ""} ${v === 0 ? "empty" : ""}" style="height:${Math.max(h, 6)}%;"></div>
        </div>
        <span class="pd-bar-day ${isToday ? "today" : ""}">${d.day}</span>
      </div>`;
    })
    .join("");

  _parentNotifs = o.notifications || [];
  renderParentNotifs();
}

function renderParentOverviewError() {
  const $ = (id) => document.getElementById(id);
  if (!$("parent-week")) return;
  $("parent-week").innerHTML = `<p class="pd-empty">Could not load activity.</p>`;
  $("parent-streak").textContent = "—";
  $("parent-learning-week").textContent = "Week —";
  _parentNotifs = [];
  renderParentNotifs();
}

async function saveDailyGoal() {
  const goal = +document.getElementById("daily-goal-slider").value;
  await parentAction("set-daily-goal", { goal }, "Daily goal saved!");
  try {
    renderParentOverview(await api.getChildOverview(state.selectedChildId));
  } catch {}
}
// Close dropdown on any click outside the bell wrapper
document.addEventListener("click", (e) => {
  const dd = document.getElementById("notif-dropdown");
  if (dd && !e.target.closest(".pd-bell")) dd.style.display = "none";
});

async function bindParent() {
  const $ = (id) => document.getElementById(id);
  try {
    const children = await api.getChildren();
    if (!$("parent-stats")) return; // navigated away

    if (!children.length) {
      $("parent-child-name").textContent = "No child linked";
      $("parent-child-grade").textContent = "Tap ➕ to link your child";
      const empty = `<p class="pd-empty">Link a child to see data.</p>`;
      $("parent-stats").innerHTML = "";
      $("parent-subjects").innerHTML =
        $("parent-quizzes").innerHTML =
        $("parent-weak").innerHTML =
        $("parent-week").innerHTML =
          empty;
      $("parent-streak").textContent = "—";
      $("parent-learning-week").textContent = "Week —";
      $("parent-goal-today").innerHTML = "&nbsp;";
      _parentNotifs = [];
      renderParentNotifs();
      return;
    }

    const child =
      children.find((c) => c.childId === state.selectedChildId) || children[0];
    state.selectedChildId = child.childId;

    $("parent-child-name").textContent =
      `${child.firstName || ""} ${child.lastName || ""}`.trim() ||
      child.username;
    $("parent-child-grade").textContent =
      [child.grade, child.school].filter(Boolean).join(" · ") || "Student";

    // Fetch in parallel; a quiz failure must not block progress (and vice versa)
    const [progress, quizzes, overview] = await Promise.allSettled([
      api.getChildProgress(child.childId),
      api.getChildQuizResults(child.childId),
      api.getChildOverview(child.childId),
    ]);
    if (!$("parent-stats")) return; // navigated away while loading

    if (overview.status === "fulfilled") {
      renderParentOverview(overview.value);
    } else {
      renderParentOverviewError();
    }

    if (progress.status === "fulfilled") {
      renderParentProgress(progress.value?.subjectProgress || []);
    } else {
      $("parent-stats").innerHTML = ErrorState(progress.reason.message);
      $("parent-subjects").innerHTML = $("parent-weak").innerHTML = "";
    }

    if (quizzes.status === "fulfilled") {
      renderParentQuizzes(quizzes.value || []);
    } else {
      $("parent-quizzes").innerHTML =
        `<p class="pd-empty">Could not load quiz results.</p>`;
    }
  } catch (e) {
    console.error(e);
    if ($("parent-stats")) $("parent-stats").innerHTML = ErrorState(e.message);
  }
}

function renderParentProgress(subjects) {
  const done = subjects.reduce((a, s) => a + s.completed, 0);
  const total = subjects.reduce((a, s) => a + s.total, 0);
  const pct = total ? Math.round((done / total) * 100) : 0;

  document.getElementById("parent-stats").innerHTML = [
    ["✅", "Lessons Done", done, "var(--accent-green)", "#d1fae5"],
    ["📚", "Remaining", total - done, "var(--primary)", "var(--primary-light)"],
    ["📈", "Progress", pct + "%", "var(--primary-mid)", "#eef0ff"],
    ["🗂️", "Subjects", subjects.length, "var(--accent-orange)", "#fef3c7"],
  ]
    .map(
      ([icon, label, val, color, bg]) => `
      <div class="card pd-stat">
        <div class="pd-icon" style="background:${bg};">${icon}</div>
        <div>
          <div class="pd-stat-val" style="color:${color};">${val}</div>
          <div class="pd-stat-label">${label}</div>
        </div>
      </div>`,
    )
    .join("");

  document.getElementById("parent-subjects").innerHTML = subjects.length
    ? subjects
        .map((s) => {
          const st = getSubjectStyle(s.subjectName);
          return `<div class="pd-row">
            <div class="pd-icon" style="background:${st.pale};">${st.icon}</div>
            <div style="flex:1;min-width:0;">
              <div class="flex-between" style="margin-bottom:6px;">
                <span class="pd-row-title">${escapeHtml(s.subjectName)}</span>
                <span class="pd-row-pct" style="color:${st.color};">${s.progressPercent}%</span>
              </div>
              <div class="progress-track" style="height:6px;">
                <div class="progress-fill" style="width:${s.progressPercent}%;background:${st.color};"></div>
              </div>
              <p class="pd-row-meta" style="margin-top:4px;">${s.completed} of ${s.total} lessons</p>
            </div>
          </div>`;
        })
        .join("")
    : `<p class="pd-empty">No lessons started yet.</p>`;

  const weak = subjects.filter((s) => s.progressPercent < 50);
  document.getElementById("parent-weak").innerHTML = weak.length
    ? weak
        .map((s) => {
          const st = getSubjectStyle(s.subjectName);
          return `<div class="pd-row">
            <div class="pd-icon" style="background:${st.pale};">${st.icon}</div>
            <div style="flex:1;min-width:0;">
              <p class="pd-row-title">${escapeHtml(s.subjectName)}</p>
              <p class="pd-row-sub">Needs practice</p>
            </div>
            <span class="pd-pill pd-pill-warn">${s.progressPercent}%</span>
          </div>`;
        })
        .join("")
    : `<p class="pd-empty">🌟 No weak areas!</p>`;
}

function renderParentQuizzes(quizzes) {
  const el = document.getElementById("parent-quizzes");
  if (!el) return;
  if (!quizzes.length) {
    el.innerHTML = `<p class="pd-empty">No quizzes taken yet.</p>`;
    return;
  }
  el.innerHTML = quizzes
    .map((q) => {
      const st = getSubjectStyle(q.subjectName);
      const pct = q.percent;
      const grade =
        pct >= 85
          ? { label: "Excellent", cls: "pd-pill-good" }
          : pct >= 70
            ? { label: "Good", cls: "pd-pill-warn" }
            : { label: "Needs Work", cls: "pd-pill-bad" };
      const date = q.attemptedAt
        ? new Date(q.attemptedAt).toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
          })
        : "";
      return `<div class="pd-row">
        <div class="pd-icon" style="background:${st.pale};">${st.icon}</div>
        <div style="flex:1;min-width:0;">
          <p class="pd-row-title truncate">${escapeHtml(q.quizTitle || "Quiz")}</p>
          <p class="pd-row-meta">${escapeHtml(q.subjectName || "—")}${date ? " · " + date : ""}</p>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <p class="pd-row-pct" style="color:${st.color};font-size:15px;">${pct}%</p>
          <span class="pd-pill ${grade.cls}">${grade.label}</span>
        </div>
      </div>`;
    })
    .join("");
}

async function parentAction(path, body, okMsg) {
  if (!state.selectedChildId) return showToast("Link a child first", "⚠️");
  try {
    await api.request(
      "POST",
      `/parent/${path}`,
      { childId: state.selectedChildId, ...body },
      state.token,
    );
    showToast(okMsg);
  } catch (e) {
    showToast(e.message, "❌");
  }
}

const ENCOURAGEMENTS = [
  "⭐ Great job!",
  "💪 Keep going!",
  "🎉 I'm proud of you!",
];

/* ============================================================
   PLACEHOLDER PAGES (navigated from sidebar)
   ============================================================ */
function GamesPageWrapper() {
  document.getElementById("page-container").innerHTML = GamesPage();
}

function launchGame(id) {
  if (id === "word") {
    document.getElementById("page-container").innerHTML = WordScramblePage();
    bindWordScramble();
  } else if (id === "math") {
    document.getElementById("page-container").innerHTML = MathNinjaPage();
    bindMathNinja();
  } else if (id === "logic") {
    document.getElementById("page-container").innerHTML = LogicPuzzlesPage();
    bindLogicPuzzles();
  } else if (id === "eco") {
    document.getElementById("page-container").innerHTML = EcoSorterPage();
    bindEcoSorter();
  } else if (id === "memory") {
    document.getElementById("page-container").innerHTML = MemoryMatchPage();
  } else {
    showToast("Coming soon! 🚧", "🎮");
  }
}

/* ============================================================
        GAME: WORD SCRAMBLE
        ============================================================ */
const WORD_SCRAMBLE_WORDS = [
  { word: "BAHAY", hint: "Where you live", category: "Filipino" },
  {
    word: "TUBIG",
    hint: "You drink this every day",
    category: "Filipino",
  },
  { word: "ARAW", hint: "Shines in the sky", category: "Filipino" },
  { word: "PUSO", hint: "Beats inside your chest", category: "Filipino" },
  { word: "IBON", hint: "Animal that can fly", category: "Filipino" },
  { word: "LAPIS", hint: "You write with this", category: "Filipino" },
  { word: "APPLE", hint: "A red or green fruit", category: "English" },
  { word: "CLOUD", hint: "Floats in the sky", category: "English" },
  { word: "PLANT", hint: "Grows from a seed", category: "English" },
  { word: "RIVER", hint: "Flowing body of water", category: "English" },
  { word: "LIGHT", hint: "Makes things visible", category: "English" },
  {
    word: "BREAD",
    hint: "Made from flour and baked",
    category: "English",
  },
  { word: "SEVEN", hint: "A lucky number", category: "Math" },
  { word: "MINUS", hint: "Subtraction operation", category: "Math" },
  { word: "EQUAL", hint: "Both sides are the same", category: "Math" },
  { word: "CIRCLE", hint: "A perfectly round shape", category: "Math" },
  { word: "SQUARE", hint: "Four equal sides", category: "Math" },
];

function scramble(word) {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("") === word ? scramble(word) : arr.join("");
}

function WordScramblePage() {
  return `<div class="page" id="word-scramble-root">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
            <button class="btn btn-ghost btn-sm" onclick="GamesPageWrapper()">← Back</button>
            <div>
              <h1 style="font-size:24px;margin-bottom:2px;">🧠 Word Scramble</h1>
              <p style="font-size:13px;color:var(--text-400);">Unscramble the letters to find the hidden word!</p>
            </div>
          </div>

          <!-- Stats -->
          <div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;">
            ${[
              ["⭐", "Score", "ws-score", "var(--primary)"],
              ["📝", "Word", "ws-word-num", "var(--text-900)"],
              ["⏱", "Time", "ws-timer", "var(--accent-orange)"],
              ["🔥", "Streak", "ws-streak", "var(--accent-red)"],
            ]
              .map(
                ([icon, label, id, color]) => `
              <div class="card" style="padding:14px 20px;display:flex;align-items:center;gap:10px;flex:1;min-width:110px;">
                <span style="font-size:20px;">${icon}</span>
                <div>
                  <div style="font-size:10px;font-weight:700;color:var(--text-400);text-transform:uppercase;letter-spacing:0.5px;">${label}</div>
                  <div style="font-family:var(--font-display);font-size:22px;font-weight:900;color:${color};" id="${id}">${id === "ws-word-num" ? "1 / 10" : "0"}</div>
                </div>
              </div>`,
              )
              .join("")}
          </div>

          <!-- Game card -->
          <div class="card" style="padding:36px;text-align:center;margin-bottom:20px;">
            <div style="font-size:11px;font-weight:700;color:var(--text-400);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:8px;" id="ws-category">—</div>

            <!-- Timer ring -->
            <div style="position:relative;width:80px;height:80px;margin:0 auto 20px;">
              <svg viewBox="0 0 80 80" width="80" height="80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" stroke-width="6"/>
                <circle cx="40" cy="40" r="34" fill="none" stroke="var(--primary)" stroke-width="6"
                  stroke-dasharray="213.6" stroke-dashoffset="0" id="ws-timer-ring"
                  stroke-linecap="round" transform="rotate(-90 40 40)" style="transition:stroke-dashoffset 1s linear;"/>
              </svg>
              <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:22px;font-weight:900;color:var(--primary);" id="ws-timer-center">30</div>
            </div>

            <!-- Scrambled letters -->
            <div style="display:flex;gap:8px;justify-content:center;margin-bottom:16px;flex-wrap:wrap;" id="ws-letters"></div>

            <!-- Hint -->
            <div style="display:inline-flex;align-items:center;gap:6px;background:var(--primary-light);color:var(--primary);padding:6px 14px;border-radius:99px;font-size:12px;font-weight:700;margin-bottom:24px;">
              💡 <span id="ws-hint">—</span>
            </div>

            <!-- Input -->
            <div style="display:flex;gap:10px;max-width:360px;margin:0 auto;">
              <input id="ws-input" type="text" placeholder="Type your answer..." class="bibo-input"
                style="text-align:center;font-size:18px;font-weight:800;text-transform:uppercase;letter-spacing:4px;"
                oninput="this.value=this.value.toUpperCase()"
                onkeydown="if(event.key==='Enter')wsCheckAnswer()" />
              <button onclick="wsCheckAnswer()" class="btn btn-primary" style="padding:12px 20px;flex-shrink:0;">Check</button>
            </div>

            <div id="ws-feedback" style="margin-top:16px;min-height:28px;font-size:15px;font-weight:700;"></div>
          </div>

          <div style="display:flex;gap:10px;justify-content:center;">
            <button onclick="wsSkip()" class="btn btn-ghost btn-sm">Skip →</button>
            <button onclick="wsReveal()" class="btn btn-sm" style="background:var(--bg);color:var(--text-500);">Reveal (-5 pts)</button>
          </div>
        </div>`;
}

let _ws = {};

function bindWordScramble() {
  const pool = [...WORD_SCRAMBLE_WORDS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 10);
  _ws = {
    pool,
    current: 0,
    score: 0,
    streak: 0,
    timer: 30,
    interval: null,
    answered: false,
  };
  wsLoadWord();
}

function wsLoadWord() {
  if (_ws.current >= _ws.pool.length) {
    wsGameOver();
    return;
  }
  const item = _ws.pool[_ws.current];
  _ws.scrambled = scramble(item.word);
  _ws.answered = false;
  _ws.timer = 30;

  document.getElementById("ws-word-num").textContent =
    `${_ws.current + 1} / ${_ws.pool.length}`;
  document.getElementById("ws-category").textContent =
    item.category.toUpperCase();
  document.getElementById("ws-hint").textContent = item.hint;
  document.getElementById("ws-feedback").textContent = "";
  document.getElementById("ws-input").value = "";
  document.getElementById("ws-input").disabled = false;
  document.getElementById("ws-timer-center").style.color = "var(--primary)";
  document.getElementById("ws-timer-ring").style.stroke = "var(--primary)";
  document.getElementById("ws-input").focus();

  document.getElementById("ws-letters").innerHTML = _ws.scrambled
    .split("")
    .map(
      (l) =>
        `<div style="width:44px;height:54px;border-radius:10px;background:var(--primary);color:white;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:22px;font-weight:900;box-shadow:0 4px 0 var(--primary-dark);">${l}</div>`,
    )
    .join("");

  wsUpdateTimerRing(30);
  if (_ws.interval) clearInterval(_ws.interval);
  _ws.interval = setInterval(() => {
    _ws.timer--;
    wsUpdateTimerRing(_ws.timer);
    document.getElementById("ws-timer").textContent = _ws.timer;
    document.getElementById("ws-timer-center").textContent = _ws.timer;
    if (_ws.timer <= 10) {
      document.getElementById("ws-timer-center").style.color =
        "var(--accent-red)";
      document.getElementById("ws-timer-ring").style.stroke =
        "var(--accent-red)";
    }
    if (_ws.timer <= 0) {
      clearInterval(_ws.interval);
      wsTimeUp();
    }
  }, 1000);
}

function wsUpdateTimerRing(t) {
  const ring = document.getElementById("ws-timer-ring");
  if (ring) ring.style.strokeDashoffset = 213.6 - (t / 30) * 213.6;
}

function wsCheckAnswer() {
  if (_ws.answered) return;
  const val = document.getElementById("ws-input").value.trim().toUpperCase();
  if (!val) return;
  clearInterval(_ws.interval);
  _ws.answered = true;
  document.getElementById("ws-input").disabled = true;
  const correct = _ws.pool[_ws.current].word.toUpperCase();
  if (val === correct) {
    const pts = Math.max(10, _ws.timer * 2);
    _ws.score += pts;
    _ws.streak++;
    document.getElementById("ws-feedback").innerHTML =
      `<span style="color:var(--accent-green);">✅ Correct! +${pts} pts ${_ws.streak >= 3 ? "🔥 " + _ws.streak + " streak!" : ""}</span>`;
  } else {
    _ws.streak = 0;
    document.getElementById("ws-feedback").innerHTML =
      `<span style="color:var(--accent-red);">❌ Wrong! The answer was <strong>${correct}</strong></span>`;
  }
  document.getElementById("ws-score").textContent = _ws.score;
  document.getElementById("ws-streak").textContent = _ws.streak;
  setTimeout(() => {
    _ws.current++;
    wsLoadWord();
  }, 1600);
}

function wsTimeUp() {
  if (_ws.answered) return;
  _ws.answered = true;
  _ws.streak = 0;
  document.getElementById("ws-streak").textContent = 0;
  document.getElementById("ws-feedback").innerHTML =
    `<span style="color:var(--accent-orange);">⏰ Time's up! The answer was <strong>${_ws.pool[_ws.current].word}</strong></span>`;
  document.getElementById("ws-input").disabled = true;
  setTimeout(() => {
    _ws.current++;
    wsLoadWord();
  }, 1800);
}

function wsSkip() {
  clearInterval(_ws.interval);
  _ws.streak = 0;
  document.getElementById("ws-streak").textContent = 0;
  _ws.current++;
  wsLoadWord();
}

function wsReveal() {
  if (_ws.answered) return;
  _ws.score = Math.max(0, _ws.score - 5);
  document.getElementById("ws-score").textContent = _ws.score;
  document.getElementById("ws-feedback").innerHTML =
    `<span style="color:var(--primary);">💡 The answer is: <strong>${_ws.pool[_ws.current].word}</strong></span>`;
  clearInterval(_ws.interval);
  _ws.answered = true;
  _ws.streak = 0;
  document.getElementById("ws-streak").textContent = 0;
  document.getElementById("ws-input").disabled = true;
  setTimeout(() => {
    _ws.current++;
    wsLoadWord();
  }, 1800);
}

function wsGameOver() {
  clearInterval(_ws.interval);
  const grade =
    _ws.score >= 400
      ? { e: "🏆", t: "Amazing!", c: "var(--accent-green)" }
      : _ws.score >= 250
        ? { e: "🎉", t: "Great job!", c: "var(--primary)" }
        : _ws.score >= 100
          ? { e: "👍", t: "Good try!", c: "var(--accent-orange)" }
          : { e: "💪", t: "Keep practicing!", c: "var(--accent-red)" };
  document.getElementById("word-scramble-root").innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:40px 20px;">
            <div style="font-size:72px;margin-bottom:16px;">${grade.e}</div>
            <h1 style="font-size:32px;margin-bottom:8px;color:${grade.c};">${grade.t}</h1>
            <p style="color:var(--text-400);margin-bottom:28px;">You completed all ${_ws.pool.length} words!</p>
            <div style="background:${grade.c}18;border:2px solid ${grade.c};border-radius:var(--radius-xl);padding:24px 48px;margin-bottom:28px;">
              <div style="font-family:var(--font-display);font-size:56px;font-weight:900;color:${grade.c};line-height:1;">${_ws.score}</div>
              <div style="font-size:13px;font-weight:700;color:var(--text-500);margin-top:4px;">Total Points</div>
              <div style="font-size:12px;color:var(--text-400);margin-top:2px;">Best Streak: ${_ws.streak} 🔥</div>
            </div>
            <div style="display:flex;gap:12px;">
              <button class="btn btn-primary" onclick="document.getElementById('page-container').innerHTML=WordScramblePage();bindWordScramble();">Play Again</button>
              <button class="btn btn-ghost" onclick="GamesPageWrapper()">Back to Games</button>
            </div>
          </div>`;
}

/* ============================================================
   GAME: MATH NINJA
   ============================================================ */
function generateMathQ(level) {
  const ops =
    level <= 2
      ? ["+", "-"]
      : level <= 4
        ? ["+", "-", "×"]
        : ["+", "-", "×", "÷"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  const max = level <= 2 ? 20 : level <= 4 ? 50 : 100;
  let a, b, answer, question;
  if (op === "+") {
    a = Math.floor(Math.random() * max) + 1;
    b = Math.floor(Math.random() * max) + 1;
    answer = a + b;
    question = `${a} + ${b}`;
  } else if (op === "-") {
    a = Math.floor(Math.random() * max) + 1;
    b = Math.floor(Math.random() * max) + 1;
    if (b > a) [a, b] = [b, a];
    answer = a - b;
    question = `${a} − ${b}`;
  } else if (op === "×") {
    a = Math.floor(Math.random() * 12) + 1;
    b = Math.floor(Math.random() * 12) + 1;
    answer = a * b;
    question = `${a} × ${b}`;
  } else {
    b = Math.floor(Math.random() * 10) + 1;
    answer = Math.floor(Math.random() * 10) + 1;
    a = answer * b;
    question = `${a} ÷ ${b}`;
  }
  const wrongs = new Set();
  while (wrongs.size < 3) {
    const w = answer + (Math.floor(Math.random() * 10) - 5);
    if (w !== answer && w >= 0) wrongs.add(w);
  }
  return {
    question,
    answer,
    choices: [answer, ...wrongs].sort(() => Math.random() - 0.5),
  };
}

function MathNinjaPage() {
  return `<div class="page" id="math-ninja-root">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
      <button class="btn btn-ghost btn-sm" onclick="GamesPageWrapper()">← Back</button>
      <div>
        <h1 style="font-size:24px;margin-bottom:2px;">⚡ Math Ninja</h1>
        <p style="font-size:13px;color:var(--text-400);">Answer fast — the quicker you are, the more points you earn!</p>
      </div>
    </div>

    <!-- Stats -->
    <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
      <div class="card" style="padding:14px 20px;flex:1;min-width:100px;text-align:center;">
        <div style="font-size:10px;font-weight:700;color:var(--text-400);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">Score</div>
        <div style="font-family:var(--font-display);font-size:24px;font-weight:900;color:var(--primary);" id="mn-score">0</div>
      </div>
      <div class="card" style="padding:14px 20px;flex:1;min-width:100px;text-align:center;">
        <div style="font-size:10px;font-weight:700;color:var(--text-400);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">Level</div>
        <div style="font-family:var(--font-display);font-size:24px;font-weight:900;color:var(--accent-green);" id="mn-level">1</div>
      </div>
      <div class="card" style="padding:14px 20px;flex:1;min-width:100px;text-align:center;">
        <div style="font-size:10px;font-weight:700;color:var(--text-400);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">Lives</div>
        <div style="font-size:20px;letter-spacing:2px;" id="mn-lives">❤️❤️❤️</div>
      </div>
      <div class="card" style="padding:14px 20px;flex:1;min-width:100px;text-align:center;">
        <div style="font-size:10px;font-weight:700;color:var(--text-400);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">Combo</div>
        <div style="font-family:var(--font-display);font-size:24px;font-weight:900;color:var(--accent-orange);" id="mn-combo">x1</div>
      </div>
    </div>

    <!-- Level progress -->
    <div style="margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="font-size:12px;font-weight:700;color:var(--text-400);">Progress to Level <span id="mn-next-level">2</span></span>
        <span style="font-size:12px;font-weight:700;color:var(--primary);" id="mn-progress-txt">0 / 5</span>
      </div>
      <div class="progress-track" style="height:8px;">
        <div class="progress-fill" id="mn-progress-bar" style="height:8px;width:0%;background:var(--accent-green);transition:width 0.4s ease;"></div>
      </div>
    </div>

    <!-- Question card -->
    <div class="card" style="padding:40px;text-align:center;margin-bottom:20px;" id="mn-question-card">
      <!-- Time bar at top -->
      <div style="position:absolute;top:0;left:0;right:0;height:5px;background:var(--border);border-radius:var(--radius-lg) var(--radius-lg) 0 0;overflow:hidden;">
        <div id="mn-time-bar" style="height:5px;background:var(--accent-green);width:100%;transition:width 0.1s linear;"></div>
      </div>

      <div style="font-size:11px;font-weight:700;color:var(--text-400);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px;">What is...</div>
      <div style="font-family:var(--font-display);font-size:52px;font-weight:900;color:var(--text-900);margin-bottom:32px;line-height:1;" id="mn-question">?</div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:400px;margin:0 auto;" id="mn-choices"></div>

      <div id="mn-feedback" style="margin-top:20px;min-height:28px;font-size:15px;font-weight:700;"></div>
    </div>
  </div>`;
}

let _mn = {};

function bindMathNinja() {
  _mn = {
    score: 0,
    level: 1,
    lives: 3,
    combo: 1,
    correct: 0,
    perLevel: 5,
    timeLimit: 10,
    timer: 10,
    interval: null,
    answered: false,
  };
  mnLoadQuestion();
}

function mnLoadQuestion() {
  const q = generateMathQ(_mn.level);
  _mn.currentQ = q;
  _mn.answered = false;
  _mn.timer = Math.max(5, _mn.timeLimit - (_mn.level - 1));

  document.getElementById("mn-question").textContent = q.question + " =";
  document.getElementById("mn-feedback").textContent = "";

  document.getElementById("mn-choices").innerHTML = q.choices
    .map(
      (c, i) =>
        `<button onclick="mnAnswer(${c})" id="mn-opt-${i}"
      style="padding:18px;font-family:var(--font-display);font-size:24px;font-weight:900;border-radius:var(--radius-md);border:2px solid var(--border);background:var(--card-bg);cursor:pointer;transition:all 0.18s;color:var(--text-900);"
      onmouseover="if(!this.disabled)this.style.borderColor='var(--primary)';this.style.background='var(--primary-light)';"
      onmouseout="if(!this.disabled&&!this.dataset.chosen)this.style.borderColor='var(--border)';this.style.background='white';">
      ${c}
    </button>`,
    )
    .join("");

  mnStartTimer();
}

function mnStartTimer() {
  const bar = document.getElementById("mn-time-bar");
  if (_mn.interval) clearInterval(_mn.interval);
  const total = _mn.timer * 10;
  let ticks = total;
  _mn.interval = setInterval(() => {
    ticks--;
    if (bar) {
      const pct = (ticks / total) * 100;
      bar.style.width = pct + "%";
      bar.style.background =
        pct > 50
          ? "var(--accent-green)"
          : pct > 25
            ? "var(--accent-orange)"
            : "var(--accent-red)";
    }
    if (ticks <= 0) {
      clearInterval(_mn.interval);
      mnTimeUp();
    }
  }, 100);
}

function mnAnswer(val) {
  if (_mn.answered) return;
  clearInterval(_mn.interval);
  _mn.answered = true;

  const correct = _mn.currentQ.answer;
  const isCorrect = val === correct;

  // Highlight chosen button
  document.querySelectorAll("#mn-choices button").forEach((btn) => {
    btn.disabled = true;
    const bVal = parseInt(btn.textContent.trim());
    if (bVal === correct) {
      btn.style.background = "#d1fae5";
      btn.style.borderColor = "var(--accent-green)";
      btn.style.color = "#065f46";
    } else if (bVal === val && !isCorrect) {
      btn.style.background = "#fee2e2";
      btn.style.borderColor = "var(--accent-red)";
      btn.style.color = "#991b1b";
    }
  });

  if (isCorrect) {
    const pts = Math.ceil(_mn.timer * 10 * _mn.combo);
    _mn.score += pts;
    _mn.combo = Math.min(5, _mn.combo + 0.5);
    _mn.correct++;
    document.getElementById("mn-feedback").innerHTML =
      `<span style="color:var(--accent-green);">✅ Correct! +${pts} pts ${_mn.combo > 1 ? "🔥 x" + _mn.combo + " combo!" : ""}</span>`;

    // Level up
    if (_mn.correct % _mn.perLevel === 0) {
      _mn.level++;
      document.getElementById("mn-level").textContent = _mn.level;
      showToast(`Level ${_mn.level}! 🎉`, "⚡");
    }
  } else {
    _mn.lives--;
    _mn.combo = 1;
    document.getElementById("mn-feedback").innerHTML =
      `<span style="color:var(--accent-red);">❌ Wrong! Answer was <strong>${correct}</strong></span>`;
  }

  document.getElementById("mn-score").textContent = _mn.score;
  document.getElementById("mn-combo").textContent = "x" + _mn.combo;
  document.getElementById("mn-lives").textContent =
    "❤️".repeat(Math.max(0, _mn.lives)) +
    "🖤".repeat(Math.max(0, 3 - _mn.lives));

  const inLevel = _mn.correct % _mn.perLevel;
  document.getElementById("mn-progress-bar").style.width =
    (inLevel / _mn.perLevel) * 100 + "%";
  document.getElementById("mn-progress-txt").textContent =
    `${inLevel} / ${_mn.perLevel}`;
  document.getElementById("mn-next-level").textContent = _mn.level + 1;

  if (_mn.lives <= 0) {
    setTimeout(mnGameOver, 1200);
    return;
  }
  setTimeout(mnLoadQuestion, 1400);
}

function mnTimeUp() {
  if (_mn.answered) return;
  _mn.answered = true;
  _mn.lives--;
  _mn.combo = 1;
  document.getElementById("mn-combo").textContent = "x1";
  document.getElementById("mn-lives").textContent =
    "❤️".repeat(Math.max(0, _mn.lives)) +
    "🖤".repeat(Math.max(0, 3 - _mn.lives));
  document.getElementById("mn-feedback").innerHTML =
    `<span style="color:var(--accent-orange);">⏰ Too slow! Answer was <strong>${_mn.currentQ.answer}</strong></span>`;
  document
    .querySelectorAll("#mn-choices button")
    .forEach((btn) => (btn.disabled = true));
  if (_mn.lives <= 0) {
    setTimeout(mnGameOver, 1200);
    return;
  }
  setTimeout(mnLoadQuestion, 1600);
}

function mnGameOver() {
  clearInterval(_mn.interval);
  const grade =
    _mn.score >= 500
      ? { e: "🥷", t: "Math Ninja Master!", c: "var(--accent-green)" }
      : _mn.score >= 250
        ? { e: "⚡", t: "Ninja in Training!", c: "var(--primary)" }
        : _mn.score >= 100
          ? { e: "👍", t: "Good Effort!", c: "var(--accent-orange)" }
          : { e: "💪", t: "Keep Practicing!", c: "var(--accent-red)" };
  document.getElementById("math-ninja-root").innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;text-align:center;padding:40px 20px;">
      <div style="font-size:72px;margin-bottom:16px;">${grade.e}</div>
      <h1 style="font-size:32px;margin-bottom:8px;color:${grade.c};">${grade.t}</h1>
      <p style="color:var(--text-400);margin-bottom:28px;">You reached Level ${_mn.level}!</p>
      <div style="background:${grade.c}18;border:2px solid ${grade.c};border-radius:var(--radius-xl);padding:24px 48px;margin-bottom:28px;">
        <div style="font-family:var(--font-display);font-size:56px;font-weight:900;color:${grade.c};line-height:1;">${_mn.score}</div>
        <div style="font-size:13px;font-weight:700;color:var(--text-500);margin-top:4px;">Total Points</div>
        <div style="font-size:12px;color:var(--text-400);margin-top:2px;">${_mn.correct} correct answers · Level ${_mn.level}</div>
      </div>
      <div style="display:flex;gap:12px;">
        <button class="btn btn-primary" onclick="document.getElementById('page-container').innerHTML=MathNinjaPage();bindMathNinja();">Play Again</button>
        <button class="btn btn-ghost" onclick="GamesPageWrapper()">Back to Games</button>
      </div>
    </div>`;
}

/* ============================================================
   SHARED GAME HELPERS
   ============================================================ */
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function GameHeader(icon, title, sub) {
  return `<div class="game-head">
    <button class="btn btn-ghost btn-sm" onclick="GamesPageWrapper()">← Back</button>
    <div>
      <h1>${icon} ${title}</h1>
      <p>${sub}</p>
    </div>
  </div>`;
}

function GameStat(label, id, value, color) {
  return `<div class="card game-stat">
    <div class="game-stat-label">${label}</div>
    <div class="game-stat-val" id="${id}" style="color:${color};">${value}</div>
  </div>`;
}

function GameOverScreen({ emoji, title, color, sub, score, detail, replay }) {
  return `<div class="game-over">
    <div class="game-over-emoji">${emoji}</div>
    <h1 style="color:${color};">${title}</h1>
    <p class="game-over-sub">${sub}</p>
    <div class="game-over-score" style="border-color:${color};background:color-mix(in srgb, ${color} 10%, transparent);">
      <div class="game-over-num" style="color:${color};">${score}</div>
      <div class="game-over-label">Total Points</div>
      <div class="game-over-detail">${detail}</div>
    </div>
    <div style="display:flex;gap:12px;">
      <button class="btn btn-primary" onclick="${replay}">Play Again</button>
      <button class="btn btn-ghost" onclick="GamesPageWrapper()">Back to Games</button>
    </div>
  </div>`;
}

/* ============================================================
   GAME: LOGIC PUZZLES
   ============================================================ */
const LP_ODD_ONE_OUT = [
  {
    items: ["🍎", "🍌", "🥕", "🍇"],
    answer: 2,
    why: "🥕 is a vegetable. The others are fruits.",
  },
  {
    items: ["🚗", "🚌", "✈️", "🚲"],
    answer: 2,
    why: "✈️ flies in the sky. The others travel on roads.",
  },
  {
    items: ["2", "4", "7", "8"],
    answer: 2,
    why: "7 is odd. The others are even numbers.",
  },
  {
    items: ["Lunes", "Martes", "Enero", "Biyernes"],
    answer: 2,
    why: "Enero is a month. The others are days of the week.",
  },
  {
    items: ["🐶", "🐱", "🐟", "🐰"],
    answer: 2,
    why: "🐟 lives in water. The others live on land.",
  },
  {
    items: ["🔺", "🟥", "🔵", "🔷"],
    answer: 2,
    why: "🔵 has no corners. The others do.",
  },
  {
    items: ["Pula", "Asul", "Aso", "Dilaw"],
    answer: 2,
    why: "Aso means dog. The others are colors.",
  },
  {
    items: ["3", "6", "9", "10"],
    answer: 3,
    why: "10 is not in the 3-times table.",
  },
];

const LP_MYSTERY = [
  {
    q: "Ana, Ben, and Carlo crossed Zapote Bridge one at a time. Ben was not first. Carlo crossed right after Ana. Who crossed last?",
    choices: ["Ana", "Ben", "Carlo"],
    answer: "Ben",
    why: "Carlo is right after Ana, and Ben isn't first → Ana, Carlo, Ben.",
  },
  {
    q: "A jeepney leaves Bacoor at 7:00 AM. It reaches Zapote Bridge in 15 minutes, waits 5 minutes, then drives 10 more minutes to school. When does it arrive?",
    choices: ["7:20 AM", "7:25 AM", "7:30 AM", "7:35 AM"],
    answer: "7:30 AM",
    why: "15 + 5 + 10 = 30 minutes after 7:00.",
  },
  {
    q: "At Bacoor Bay, Mang Jun caught more fish than Lito but fewer than Rosa. Who caught the most fish?",
    choices: ["Mang Jun", "Lito", "Rosa"],
    answer: "Rosa",
    why: "Lito < Mang Jun < Rosa.",
  },
  {
    q: "Every guard at the old bridge carried a lantern. Mateo was a guard at the old bridge. What can we be sure of?",
    choices: ["Mateo carried a lantern", "Mateo was tall", "Mateo was sleepy"],
    answer: "Mateo carried a lantern",
    why: "If ALL guards carried lanterns, Mateo did too.",
  },
  {
    q: "A flagpole's shadow is 6 m at 9 AM and 4 m at 10 AM. If it keeps shrinking the same way, how long is it at 11 AM?",
    choices: ["1 m", "2 m", "3 m", "4 m"],
    answer: "2 m",
    why: "It shrinks by 2 m every hour: 6 → 4 → 2.",
  },
  {
    q: "Three boats are tied at the bridge: red, blue, and green. The red boat is left of the blue one. The green boat is right of the blue one. Which boat is in the middle?",
    choices: ["Red", "Blue", "Green"],
    answer: "Blue",
    why: "Red – Blue – Green.",
  },
];

// Number sequences: each rule builds 4 visible terms and the next answer
const LP_SEQ_RULES = [
  () => {
    const s = randInt(1, 20),
      k = randInt(2, 9);
    return {
      terms: [0, 1, 2, 3].map((i) => s + i * k),
      next: s + 4 * k,
      why: `Add ${k} each time.`,
    };
  },
  () => {
    const s = randInt(1, 5);
    return {
      terms: [0, 1, 2, 3].map((i) => s * 2 ** i),
      next: s * 16,
      why: "Double the number each time.",
    };
  },
  () => {
    const s = randInt(1, 10);
    const t = [s];
    for (let i = 1; i < 5; i++) t.push(t[i - 1] + i);
    return {
      terms: t.slice(0, 4),
      next: t[4],
      why: "Add 1, then 2, then 3, then 4…",
    };
  },
  () => {
    const o = randInt(1, 3);
    return {
      terms: [0, 1, 2, 3].map((i) => (i + o) ** 2),
      next: (4 + o) ** 2,
      why: "These are square numbers (n × n).",
    };
  },
  () => {
    const k = randInt(3, 9),
      s = k * 5 + randInt(5, 20);
    return {
      terms: [0, 1, 2, 3].map((i) => s - i * k),
      next: s - 4 * k,
      why: `Subtract ${k} each time.`,
    };
  },
];

const LP_PATTERN_SETS = [
  ["🔴", "🔵", "🟡"],
  ["🌞", "🌙", "⭐"],
  ["🐸", "🐢", "🦀"],
  ["🍎", "🍌", "🍇"],
  ["🔺", "🟩", "🔷"],
];
const LP_PATTERN_SHAPES = ["AB", "ABC", "AAB", "ABB", "AABB"];

function lpMakeNumberPuzzle() {
  const { terms, next, why } =
    LP_SEQ_RULES[randInt(0, LP_SEQ_RULES.length - 1)]();
  const wrongs = new Set();
  for (const d of shuffle([-3, -2, -1, 1, 2, 3, 4, 5, 10])) {
    if (wrongs.size === 3) break;
    if (next + d >= 0) wrongs.add(next + d);
  }
  return {
    type: "Number Sequence",
    prompt: "What number comes next?",
    tokens: [...terms, "?"],
    choices: shuffle([next, ...wrongs]).map(String),
    answer: String(next),
    why,
  };
}

function lpMakePatternPuzzle() {
  const set = LP_PATTERN_SETS[randInt(0, LP_PATTERN_SETS.length - 1)];
  const shape = LP_PATTERN_SHAPES[randInt(0, LP_PATTERN_SHAPES.length - 1)];
  const map = { A: set[0], B: set[1], C: set[2] };
  const seq = Array.from({ length: 8 }, (_, i) => map[shape[i % shape.length]]);
  const answer = seq[7];
  const extra = LP_PATTERN_SETS.flat().find((e) => !set.includes(e));
  return {
    type: "Pattern",
    prompt: "Which one completes the pattern?",
    tokens: [...seq.slice(0, 7), "?"],
    choices: shuffle([...new Set([...set, extra])]),
    answer,
    why: `The pattern repeats: ${shape
      .split("")
      .map((c) => map[c])
      .join(" ")}`,
  };
}

function lpMakeOddPuzzle(used) {
  const pool = LP_ODD_ONE_OUT.filter((_, i) => !used.has(i));
  const idx = LP_ODD_ONE_OUT.indexOf(pool[randInt(0, pool.length - 1)]);
  used.add(idx);
  const p = LP_ODD_ONE_OUT[idx];
  return {
    type: "Odd One Out",
    prompt: "Which one does NOT belong?",
    tokens: [],
    choices: p.items,
    answer: p.items[p.answer],
    why: p.why,
  };
}

function lpMakeMysteryPuzzle(used) {
  const pool = LP_MYSTERY.filter((_, i) => !used.has(i));
  const idx = LP_MYSTERY.indexOf(pool[randInt(0, pool.length - 1)]);
  used.add(idx);
  const p = LP_MYSTERY[idx];
  return {
    type: "Zapote Mystery 🌉",
    prompt: p.q,
    tokens: [],
    choices: shuffle(p.choices),
    answer: p.answer,
    why: p.why,
  };
}

function LogicPuzzlesPage() {
  return `<div class="page" id="logic-root">
    ${GameHeader("🧩", "Logic Puzzles", "Spot the pattern, find the odd one out, and solve the mystery of Zapote Bridge!")}

    <div class="game-stats">
      ${GameStat("Score", "lp-score", "0", "var(--primary)")}
      ${GameStat("Puzzle", "lp-num", "1 / 8", "var(--text-900)")}
      ${GameStat("Hints", "lp-hints", "💡💡💡", "var(--accent-orange)")}
      ${GameStat("Streak", "lp-streak", "0", "var(--accent-red)")}
    </div>

    <div class="progress-track" style="height:8px;margin-bottom:20px;">
      <div class="progress-fill" id="lp-progress" style="width:0%;"></div>
    </div>

    <div class="card lp-card">
      <span class="badge badge-new" id="lp-type">—</span>
      <h2 class="lp-prompt" id="lp-prompt"></h2>
      <div class="lp-tokens" id="lp-tokens"></div>
      <div class="lp-choices" id="lp-choices"></div>
      <div class="lp-feedback" id="lp-feedback"></div>
      <div class="lp-actions">
        <button class="btn btn-ghost btn-sm" id="lp-hint-btn" onclick="lpUseHint()">💡 Use Hint</button>
        <button class="btn btn-primary btn-sm" id="lp-next-btn" style="display:none;" onclick="lpNext()">Next Puzzle →</button>
      </div>
    </div>
  </div>`;
}

let _lp = {};

function bindLogicPuzzles() {
  const usedOdd = new Set();
  const usedMystery = new Set();
  const makers = shuffle([
    lpMakeNumberPuzzle,
    lpMakeNumberPuzzle,
    lpMakePatternPuzzle,
    lpMakePatternPuzzle,
    () => lpMakeOddPuzzle(usedOdd),
    () => lpMakeOddPuzzle(usedOdd),
    () => lpMakeMysteryPuzzle(usedMystery),
    () => lpMakeMysteryPuzzle(usedMystery),
  ]);
  _lp = {
    puzzles: makers.map((make) => make()),
    current: 0,
    score: 0,
    correct: 0,
    streak: 0,
    bestStreak: 0,
    hints: 3,
    hintUsedHere: false,
    answered: false,
  };
  lpRender();
}

function lpRender() {
  const p = _lp.puzzles[_lp.current];
  const total = _lp.puzzles.length;
  _lp.answered = false;
  _lp.hintUsedHere = false;

  document.getElementById("lp-type").textContent = p.type;
  document.getElementById("lp-prompt").textContent = p.prompt;
  document.getElementById("lp-num").textContent =
    `${_lp.current + 1} / ${total}`;
  document.getElementById("lp-progress").style.width =
    `${(_lp.current / total) * 100}%`;
  document.getElementById("lp-feedback").innerHTML = "";
  document.getElementById("lp-next-btn").style.display = "none";
  lpUpdateHintUi();

  document.getElementById("lp-tokens").innerHTML = p.tokens
    .map(
      (t) =>
        `<div class="lp-token ${t === "?" ? "lp-token-q" : ""}">${escapeHtml(t)}</div>`,
    )
    .join("");

  document.getElementById("lp-choices").innerHTML = p.choices
    .map(
      (c, i) =>
        `<button class="lp-choice" id="lp-opt-${i}" onclick="lpAnswer(${i})">${escapeHtml(c)}</button>`,
    )
    .join("");
}

function lpUpdateHintUi() {
  document.getElementById("lp-hints").textContent = _lp.hints
    ? "💡".repeat(_lp.hints)
    : "—";
  document.getElementById("lp-hint-btn").disabled =
    _lp.hints === 0 || _lp.hintUsedHere || _lp.answered;
}

// Hint = remove one wrong choice (works for every puzzle type)
function lpUseHint() {
  if (_lp.hints === 0 || _lp.hintUsedHere || _lp.answered) return;
  const p = _lp.puzzles[_lp.current];
  const wrong = p.choices
    .map((c, i) => ({ c, i }))
    .filter(
      ({ c, i }) =>
        c !== p.answer && !document.getElementById(`lp-opt-${i}`).disabled,
    );
  if (!wrong.length) return;
  const pick = wrong[randInt(0, wrong.length - 1)];
  const btn = document.getElementById(`lp-opt-${pick.i}`);
  btn.disabled = true;
  btn.classList.add("lp-choice-out");
  _lp.hints--;
  _lp.hintUsedHere = true;
  lpUpdateHintUi();
}

function lpAnswer(i) {
  if (_lp.answered) return;
  _lp.answered = true;
  const p = _lp.puzzles[_lp.current];
  const picked = p.choices[i];
  const isCorrect = picked === p.answer;

  p.choices.forEach((c, j) => {
    const btn = document.getElementById(`lp-opt-${j}`);
    btn.disabled = true;
    if (c === p.answer) btn.classList.add("lp-choice-correct");
    else if (j === i) btn.classList.add("lp-choice-wrong");
  });

  if (isCorrect) {
    const pts = _lp.hintUsedHere ? 10 : 20;
    const bonus = _lp.streak >= 2 ? 5 : 0;
    _lp.score += pts + bonus;
    _lp.correct++;
    _lp.streak++;
    _lp.bestStreak = Math.max(_lp.bestStreak, _lp.streak);
    document.getElementById("lp-feedback").innerHTML =
      `<p class="lp-fb-ok">✅ Correct! +${pts + bonus} pts${bonus ? " 🔥 streak bonus" : ""}</p><p class="lp-why">${escapeHtml(p.why)}</p>`;
  } else {
    _lp.streak = 0;
    document.getElementById("lp-feedback").innerHTML =
      `<p class="lp-fb-bad">❌ Not quite! Answer: <strong>${escapeHtml(p.answer)}</strong></p><p class="lp-why">${escapeHtml(p.why)}</p>`;
  }

  document.getElementById("lp-score").textContent = _lp.score;
  document.getElementById("lp-streak").textContent = _lp.streak;
  lpUpdateHintUi();

  const next = document.getElementById("lp-next-btn");
  next.textContent =
    _lp.current === _lp.puzzles.length - 1 ? "See Results 🏁" : "Next Puzzle →";
  next.style.display = "";
}

function lpNext() {
  _lp.current++;
  if (_lp.current >= _lp.puzzles.length) return lpGameOver();
  lpRender();
}

function lpGameOver() {
  const total = _lp.puzzles.length;
  const g =
    _lp.correct === total
      ? { e: "🧠", t: "Master Detective!", c: "var(--accent-green)" }
      : _lp.correct >= 6
        ? { e: "🕵️", t: "Great Thinking!", c: "var(--primary)" }
        : _lp.correct >= 4
          ? { e: "👍", t: "Good Effort!", c: "var(--accent-orange)" }
          : { e: "💪", t: "Keep Practicing!", c: "var(--accent-red)" };
  document.getElementById("logic-root").innerHTML = GameOverScreen({
    emoji: g.e,
    title: g.t,
    color: g.c,
    sub: `You solved ${_lp.correct} of ${total} puzzles!`,
    score: _lp.score,
    detail: `Best streak: ${_lp.bestStreak} 🔥 · Hints left: ${_lp.hints}`,
    replay: "launchGame('logic')",
  });
}

/* ============================================================
   GAME: ECO-SORTER
   ============================================================ */
const ECO_BINS = [
  {
    id: "bio",
    label: "Nabubulok",
    sub: "Biodegradable",
    icon: "🌱",
    color: "#10b981",
  },
  {
    id: "rec",
    label: "Recyclable",
    sub: "Puwedeng i-recycle",
    icon: "♻️",
    color: "#3b82f6",
  },
  {
    id: "res",
    label: "Residual",
    sub: "Di-nabubulok",
    icon: "🗑️",
    color: "#6b7280",
  },
  {
    id: "spe",
    label: "Special",
    sub: "Hazardous waste",
    icon: "⚠️",
    color: "#ef4444",
  },
];

const ECO_ITEMS = [
  {
    name: "Banana Peel",
    icon: "🍌",
    bin: "bio",
    fact: "Fruit peels rot naturally and can become compost.",
  },
  {
    name: "Leftover Rice",
    icon: "🍚",
    bin: "bio",
    fact: "Food scraps are biodegradable.",
  },
  {
    name: "Dried Leaves",
    icon: "🍂",
    bin: "bio",
    fact: "Leaves break down and feed the soil.",
  },
  {
    name: "Fish Bones",
    icon: "🐟",
    bin: "bio",
    fact: "Fish scraps are biodegradable kitchen waste.",
  },
  {
    name: "Eggshells",
    icon: "🥚",
    bin: "bio",
    fact: "Eggshells add calcium to compost.",
  },
  {
    name: "Mango Peel",
    icon: "🥭",
    bin: "bio",
    fact: "Fruit peels are biodegradable.",
  },
  {
    name: "Vegetable Scraps",
    icon: "🥬",
    bin: "bio",
    fact: "Vegetable scraps make great compost.",
  },
  {
    name: "Coconut Husk",
    icon: "🥥",
    bin: "bio",
    fact: "Coconut husks are natural and break down over time.",
  },
  {
    name: "Plastic Bottle",
    icon: "🧴",
    bin: "rec",
    fact: "PET bottles can be recycled into new items.",
  },
  {
    name: "Soda Can",
    icon: "🥫",
    bin: "rec",
    fact: "Aluminum cans can be recycled again and again.",
  },
  {
    name: "Newspaper",
    icon: "📰",
    bin: "rec",
    fact: "Clean paper can be recycled.",
  },
  {
    name: "Cardboard Box",
    icon: "📦",
    bin: "rec",
    fact: "Flattened cardboard is recyclable.",
  },
  {
    name: "Glass Bottle",
    icon: "🍾",
    bin: "rec",
    fact: "Glass can be melted and made into new bottles.",
  },
  {
    name: "Old Notebook",
    icon: "📓",
    bin: "rec",
    fact: "Paper notebooks are recyclable.",
  },
  {
    name: "Candy Wrapper",
    icon: "🍬",
    bin: "res",
    fact: "Wrappers are mixed materials — they can't be recycled easily.",
  },
  {
    name: "Shampoo Sachet",
    icon: "🧃",
    bin: "res",
    fact: "Sachets are layered plastic and go to residual waste.",
  },
  {
    name: "Used Tissue",
    icon: "🧻",
    bin: "res",
    fact: "Dirty tissue can't be recycled.",
  },
  {
    name: "Styrofoam Cup",
    icon: "🥤",
    bin: "res",
    fact: "Styrofoam is hard to recycle and doesn't rot.",
  },
  {
    name: "Used Diaper",
    icon: "🧷",
    bin: "res",
    fact: "Diapers go to residual waste.",
  },
  {
    name: "Old Battery",
    icon: "🔋",
    bin: "spe",
    fact: "Batteries have chemicals — they need special disposal.",
  },
  {
    name: "Light Bulb",
    icon: "💡",
    bin: "spe",
    fact: "Some bulbs contain mercury, so they're special waste.",
  },
  {
    name: "Old Phone",
    icon: "📱",
    bin: "spe",
    fact: "Electronics are e-waste and need special handling.",
  },
  {
    name: "Expired Medicine",
    icon: "💊",
    bin: "spe",
    fact: "Old medicine is hazardous — never throw it in regular trash.",
  },
];

const ECO_TIME = 60;

function EcoSorterPage() {
  return `<div class="page" id="eco-root">
    ${GameHeader("🌍", "Eco-Sorter", "Help clean up Bacoor! Drag or tap each item into the right bin.")}

    <div class="game-stats">
      ${GameStat("Score", "eco-score", "0", "var(--primary)")}
      ${GameStat("Sorted", "eco-sorted", "0", "var(--accent-green)")}
      ${GameStat("Lives", "eco-lives", "❤️❤️❤️", "var(--accent-red)")}
      ${GameStat("Time", "eco-time", ECO_TIME, "var(--accent-orange)")}
    </div>

    <div class="progress-track" style="height:8px;margin-bottom:20px;">
      <div class="progress-fill" id="eco-time-bar" style="width:100%;background:var(--accent-green);transition:width 1s linear;"></div>
    </div>

    <div class="card eco-stage">
      <p class="eco-label">Where does this go?</p>
      <div class="eco-item" id="eco-item" draggable="true">
        <div class="eco-item-icon" id="eco-item-icon">—</div>
        <div class="eco-item-name" id="eco-item-name">—</div>
      </div>
      <div class="eco-feedback" id="eco-feedback"></div>
    </div>

    <div class="eco-bins">
      ${ECO_BINS.map(
        (b, i) => `
        <button class="eco-bin" data-bin="${b.id}" style="--bin:${b.color};" onclick="ecoSort('${b.id}')">
          <span class="eco-bin-key">${i + 1}</span>
          <span class="eco-bin-icon">${b.icon}</span>
          <span class="eco-bin-label">${b.label}</span>
          <span class="eco-bin-sub">${b.sub}</span>
        </button>`,
      ).join("")}
    </div>
    <p class="eco-tip">💡 Tip: press keys 1–4 to sort faster</p>
  </div>`;
}

let _eco = {};

function bindEcoSorter() {
  ecoStop();
  _eco = {
    deck: shuffle(ECO_ITEMS),
    idx: 0,
    item: null,
    score: 0,
    sorted: 0,
    correct: 0,
    combo: 1,
    lives: 3,
    time: ECO_TIME,
    interval: null,
    locked: false,
    mistakes: [],
  };

  // Drag & drop (desktop); tap/click and keys 1–4 also work
  const item = document.getElementById("eco-item");
  item.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", "eco");
    item.classList.add("dragging");
  });
  item.addEventListener("dragend", () => item.classList.remove("dragging"));
  document.querySelectorAll(".eco-bin").forEach((bin) => {
    bin.addEventListener("dragover", (e) => {
      e.preventDefault();
      bin.classList.add("over");
    });
    bin.addEventListener("dragleave", () => bin.classList.remove("over"));
    bin.addEventListener("drop", (e) => {
      e.preventDefault();
      bin.classList.remove("over");
      ecoSort(bin.dataset.bin);
    });
  });
  document.addEventListener("keydown", ecoKeyHandler);

  ecoNextItem();
  _eco.interval = setInterval(ecoTick, 1000);
}

function ecoStop() {
  if (_eco.interval) clearInterval(_eco.interval);
  document.removeEventListener("keydown", ecoKeyHandler);
}

function ecoKeyHandler(e) {
  if (!document.getElementById("eco-root")) return ecoStop(); // navigated away
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= ECO_BINS.length) ecoSort(ECO_BINS[n - 1].id);
}

function ecoTick() {
  if (!document.getElementById("eco-root")) return ecoStop(); // navigated away
  _eco.time--;
  document.getElementById("eco-time").textContent = _eco.time;
  const pct = (_eco.time / ECO_TIME) * 100;
  const bar = document.getElementById("eco-time-bar");
  bar.style.width = pct + "%";
  bar.style.background =
    pct > 50
      ? "var(--accent-green)"
      : pct > 25
        ? "var(--accent-orange)"
        : "var(--accent-red)";
  if (_eco.time <= 0) ecoGameOver();
}

function ecoNextItem() {
  if (_eco.idx >= _eco.deck.length) {
    _eco.deck = shuffle(ECO_ITEMS);
    _eco.idx = 0;
  }
  _eco.item = _eco.deck[_eco.idx++];
  _eco.locked = false;
  const card = document.getElementById("eco-item");
  card.classList.remove("eco-pop");
  void card.offsetWidth; // restart animation
  card.classList.add("eco-pop");
  document.getElementById("eco-item-icon").textContent = _eco.item.icon;
  document.getElementById("eco-item-name").textContent = _eco.item.name;
}

function ecoSort(binId) {
  if (_eco.locked || !_eco.item) return;
  _eco.locked = true;

  const item = _eco.item;
  const correctBin = ECO_BINS.find((b) => b.id === item.bin);
  const binEl = document.querySelector(`.eco-bin[data-bin="${binId}"]`);
  const fb = document.getElementById("eco-feedback");
  _eco.sorted++;

  if (binId === item.bin) {
    const pts = Math.round(10 * _eco.combo);
    _eco.score += pts;
    _eco.correct++;
    _eco.combo = Math.min(3, _eco.combo + 0.5);
    binEl.classList.add("flash-ok");
    fb.innerHTML = `<span class="lp-fb-ok">✅ +${pts} pts${_eco.combo > 1.5 ? ` 🔥 x${_eco.combo}` : ""}</span>`;
  } else {
    _eco.lives--;
    _eco.combo = 1;
    _eco.mistakes.push(item);
    binEl.classList.add("flash-bad");
    fb.innerHTML = `<span class="lp-fb-bad">❌ ${item.icon} goes in <strong>${correctBin.label}</strong></span><span class="lp-why">${item.fact}</span>`;
  }

  document.getElementById("eco-score").textContent = _eco.score;
  document.getElementById("eco-sorted").textContent = _eco.correct;
  document.getElementById("eco-lives").textContent =
    "❤️".repeat(Math.max(0, _eco.lives)) +
    "🖤".repeat(Math.max(0, 3 - _eco.lives));

  setTimeout(() => binEl?.classList.remove("flash-ok", "flash-bad"), 450);

  if (_eco.lives <= 0) {
    ecoStop(); // freeze timer so it can't also end the game
    return setTimeout(ecoGameOver, 1200);
  }
  // Give extra reading time after a mistake so kids can learn from the fact
  setTimeout(
    () => {
      if (!document.getElementById("eco-root")) return;
      fb.innerHTML = "";
      ecoNextItem();
    },
    binId === item.bin ? 450 : 1600,
  );
}

function ecoGameOver() {
  ecoStop();
  if (_eco.over || !document.getElementById("eco-root")) return;
  _eco.over = true;
  const acc = _eco.sorted ? Math.round((_eco.correct / _eco.sorted) * 100) : 0;
  const g =
    _eco.score >= 250
      ? { e: "🌍", t: "Eco Hero!", c: "var(--accent-green)" }
      : _eco.score >= 150
        ? { e: "♻️", t: "Great Sorting!", c: "var(--primary)" }
        : _eco.score >= 60
          ? { e: "👍", t: "Good Job!", c: "var(--accent-orange)" }
          : { e: "💪", t: "Keep Practicing!", c: "var(--accent-red)" };

  const learn = [
    ...new Map(_eco.mistakes.map((m) => [m.name, m])).values(),
  ].slice(0, 4);
  document.getElementById("eco-root").innerHTML =
    GameOverScreen({
      emoji: g.e,
      title: g.t,
      color: g.c,
      sub: _eco.lives <= 0 ? "Out of lives!" : "Time's up!",
      score: _eco.score,
      detail: `${_eco.correct} sorted correctly · ${acc}% accuracy`,
      replay: "launchGame('eco')",
    }) +
    (learn.length
      ? `<div class="card eco-learn">
          <h3>📚 Remember these</h3>
          ${learn
            .map((m) => {
              const b = ECO_BINS.find((x) => x.id === m.bin);
              return `<div class="pd-row">
              <div class="pd-icon" style="background:var(--bg);">${m.icon}</div>
              <div style="flex:1;min-width:0;">
                <p class="pd-row-title">${m.name} → ${b.icon} ${b.label}</p>
                <p class="pd-row-sub">${m.fact}</p>
              </div>
            </div>`;
            })
            .join("")}
        </div>`
      : "");
}

/* ============================================================
   GAME: MEMORY MATCH — PHILIPPINE NATIONAL SYMBOLS
   Match each symbol card to its meaning card.
   ============================================================ */
const MM_SYMBOLS = [
  {
    id: "flower",
    icon: "🌼",
    name: "Sampaguita",
    role: "National Flower",
    fact: "Sampaguita's small white flowers stand for purity and simplicity.",
  },
  {
    id: "tree",
    icon: "🌳",
    name: "Narra",
    role: "National Tree",
    fact: "Narra wood is strong and is used for fine furniture.",
  },
  {
    id: "bird",
    icon: "🦅",
    name: "Philippine Eagle",
    role: "National Bird",
    fact: "The Philippine Eagle is one of the biggest eagles in the world.",
  },
  {
    id: "animal",
    icon: "🐃",
    name: "Carabao",
    role: "National Animal",
    fact: "The carabao is called the farmer's best friend for helping in the rice fields.",
  },
  {
    id: "fish",
    icon: "🐟",
    name: "Bangus",
    role: "National Fish",
    fact: "Bangus (milkfish) is a favorite at Filipino breakfast tables.",
  },
  {
    id: "fruit",
    icon: "🥭",
    name: "Mango",
    role: "National Fruit",
    fact: "Philippine mangoes are known worldwide for their sweetness.",
  },
  {
    id: "leaf",
    icon: "🌿",
    name: "Anahaw",
    role: "National Leaf",
    fact: "Anahaw leaves are used for roofs, fans, and decorations.",
  },
  {
    id: "sport",
    icon: "🥢",
    name: "Arnis",
    role: "National Sport",
    fact: "Arnis is a Filipino martial art that uses sticks.",
  },
  {
    id: "gem",
    icon: "🦪",
    name: "South Sea Pearl",
    role: "National Gem",
    fact: "South Sea pearls are among the largest pearls in the world.",
  },
  {
    id: "house",
    icon: "🛖",
    name: "Bahay Kubo",
    role: "National House",
    fact: "Bahay kubo is made of bamboo and nipa, keeping it cool in hot weather.",
  },
  {
    id: "anthem",
    icon: "🎵",
    name: "Lupang Hinirang",
    role: "National Anthem",
    fact: "We sing Lupang Hinirang with our right hand over our heart.",
  },
  {
    id: "rays",
    icon: "☀️",
    name: "8 Sun Rays",
    role: "First 8 provinces that revolted against Spain",
    fact: "The 8 rays on the flag honor the first provinces to fight for freedom.",
  },
  {
    id: "stars",
    icon: "⭐",
    name: "3 Stars",
    role: "Luzon, Visayas & Mindanao",
    fact: "The 3 stars on the flag stand for our 3 main island groups.",
  },
  {
    id: "lang",
    icon: "🗣️",
    name: "Filipino",
    role: "National Language",
    fact: "Filipino is our national language, used across the islands.",
  },
];

const MM_LEVELS = {
  easy: { label: "Easy", pairs: 6, time: 75, cols: 4, emoji: "🌱" },
  medium: { label: "Medium", pairs: 8, time: 100, cols: 4, emoji: "🔥" },
  hard: { label: "Hard", pairs: 10, time: 120, cols: 5, emoji: "🏆" },
};

const MM_PEEK_MS = 2500;

// Card back: simplified Philippine flag (emoji flags don't render on Windows)
const PH_FLAG_SVG = `<svg viewBox="0 0 60 30" class="mm-flag" aria-hidden="true">
  <rect width="60" height="15" fill="#0038a8"/>
  <rect y="15" width="60" height="15" fill="#ce1126"/>
  <polygon points="0,0 26,15 0,30" fill="#fff"/>
  <g fill="#fcd116">
    <circle cx="8.7" cy="15" r="3"/>
    ${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<rect x="8.2" y="9.2" width="1" height="2.6" transform="rotate(${a} 8.7 15)"/>`).join("")}
    <circle cx="2.6" cy="3.3" r="1.1"/><circle cx="2.6" cy="26.7" r="1.1"/><circle cx="22.4" cy="15" r="1.1"/>
  </g>
</svg>`;

function MemoryMatchPage() {
  return `<div class="page" id="mm-root">
    ${GameHeader(`<span class="mm-flag-inline">${PH_FLAG_SVG}</span>`, "Memory Match", "Match each Philippine national symbol to what it stands for!")}

    <div class="card mm-start" id="mm-start">
      <div class="mm-start-flag">${PH_FLAG_SVG}</div>
      <h2>Choose your level</h2>
      <p class="pd-sub">Cards are shown for a few seconds — memorize them, then find the pairs!</p>
      <div class="mm-levels">
        ${Object.entries(MM_LEVELS)
          .map(
            ([key, l]) => `
          <button class="mm-level" onclick="mmStart('${key}')">
            <span class="mm-level-emoji">${l.emoji}</span>
            <strong>${l.label}</strong>
            <span>${l.pairs} pairs · ${l.time}s</span>
          </button>`,
          )
          .join("")}
      </div>
    </div>

    <div id="mm-game" style="display:none;">
      <div class="game-stats">
        ${GameStat("Score", "mm-score", "0", "var(--primary)")}
        ${GameStat("Pairs", "mm-pairs", "0 / 0", "var(--accent-green)")}
        ${GameStat("Moves", "mm-moves", "0", "var(--text-900)")}
        ${GameStat("Time", "mm-time", "0", "var(--accent-orange)")}
      </div>
      <div class="progress-track" style="height:8px;margin-bottom:16px;">
        <div class="progress-fill" id="mm-time-bar" style="width:100%;background:var(--accent-green);transition:width 1s linear;"></div>
      </div>
      <p class="mm-status" id="mm-status">👀 Memorize the cards!</p>
      <div class="mm-grid" id="mm-grid"></div>
      <div class="card mm-fact" id="mm-fact">
        <span class="mm-fact-label"><span class="mm-flag-inline">${PH_FLAG_SVG}</span> Did you know?</span>
        <p id="mm-fact-text">Match a pair to learn a fun fact!</p>
      </div>
    </div>
  </div>`;
}

let _mm = {};

function mmStart(levelKey) {
  mmStop();
  const level = MM_LEVELS[levelKey];
  const chosen = shuffle(MM_SYMBOLS).slice(0, level.pairs);
  const cards = shuffle(
    chosen.flatMap((s) => [
      { pairId: s.id, kind: "symbol", s },
      { pairId: s.id, kind: "role", s },
    ]),
  );

  _mm = {
    levelKey,
    level,
    cards,
    first: null,
    lock: true,
    moves: 0,
    matches: 0,
    score: 0,
    combo: 0,
    time: level.time,
    interval: null,
    over: false,
  };

  document.getElementById("mm-start").style.display = "none";
  document.getElementById("mm-game").style.display = "";
  document.getElementById("mm-pairs").textContent = `0 / ${level.pairs}`;
  document.getElementById("mm-time").textContent = level.time;

  const grid = document.getElementById("mm-grid");
  grid.style.setProperty("--cols", level.cols);
  grid.innerHTML = cards
    .map(
      (c, i) => `
      <button class="mm-card flipped" id="mm-card-${i}" onclick="mmFlip(${i})" aria-label="Card ${i + 1}">
        <span class="mm-inner">
          <span class="mm-face mm-back">${PH_FLAG_SVG}</span>
          <span class="mm-face mm-front ${c.kind === "role" ? "mm-front-role" : ""}">
            ${
              c.kind === "symbol"
                ? `<span class="mm-icon">${c.s.icon}</span><span class="mm-name">${c.s.name}</span>`
                : `<span class="mm-role-tag">Stands for</span><span class="mm-role">${c.s.role}</span>`
            }
          </span>
        </span>
      </button>`,
    )
    .join("");

  // Peek phase: show everything, then hide and start the clock
  setTimeout(() => {
    if (!document.getElementById("mm-root") || _mm.over) return;
    document
      .querySelectorAll(".mm-card")
      .forEach((el) => el.classList.remove("flipped"));
    document.getElementById("mm-status").textContent =
      "🔍 Find the matching pairs!";
    _mm.lock = false;
    _mm.interval = setInterval(mmTick, 1000);
  }, MM_PEEK_MS);
}

function mmStop() {
  if (_mm.interval) clearInterval(_mm.interval);
  _mm.interval = null;
}

function mmTick() {
  if (!document.getElementById("mm-root")) return mmStop(); // navigated away
  _mm.time--;
  document.getElementById("mm-time").textContent = _mm.time;
  const pct = (_mm.time / _mm.level.time) * 100;
  const bar = document.getElementById("mm-time-bar");
  bar.style.width = pct + "%";
  bar.style.background =
    pct > 50
      ? "var(--accent-green)"
      : pct > 25
        ? "var(--accent-orange)"
        : "var(--accent-red)";
  if (_mm.time <= 0) mmGameOver(false);
}

function mmFlip(i) {
  const card = _mm.cards[i];
  const el = document.getElementById(`mm-card-${i}`);
  if (_mm.lock || _mm.over || card.matched || i === _mm.first) return;

  el.classList.add("flipped");

  if (_mm.first === null) {
    _mm.first = i;
    return;
  }

  const a = _mm.first;
  _mm.first = null;
  _mm.moves++;
  document.getElementById("mm-moves").textContent = _mm.moves;

  const elA = document.getElementById(`mm-card-${a}`);
  if (_mm.cards[a].pairId === card.pairId) {
    _mm.cards[a].matched = card.matched = true;
    _mm.matches++;
    _mm.combo++;
    const pts = 50 + (_mm.combo - 1) * 10;
    _mm.score += pts;
    [elA, el].forEach((x) => x.classList.add("matched"));
    document.getElementById("mm-score").textContent = _mm.score;
    document.getElementById("mm-pairs").textContent =
      `${_mm.matches} / ${_mm.level.pairs}`;
    document.getElementById("mm-status").textContent =
      `✅ ${card.s.name} — ${card.s.role}! +${pts}${_mm.combo > 1 ? ` 🔥 x${_mm.combo}` : ""}`;
    document.getElementById("mm-fact-text").textContent = card.s.fact;

    if (_mm.matches === _mm.level.pairs)
      setTimeout(() => mmGameOver(true), 700);
  } else {
    _mm.combo = 0;
    _mm.lock = true;
    [elA, el].forEach((x) => x.classList.add("miss"));
    document.getElementById("mm-status").textContent =
      "❌ Not a match — try again!";
    setTimeout(() => {
      [elA, el].forEach((x) => x.classList.remove("flipped", "miss"));
      _mm.lock = false;
    }, 900);
  }
}

function mmGameOver(won) {
  mmStop();
  if (_mm.over || !document.getElementById("mm-root")) return;
  _mm.over = true;

  const timeBonus = won ? _mm.time * 2 : 0;
  _mm.score += timeBonus;
  // Perfect game = one move per pair; accuracy rewards remembering, not guessing
  const accuracy = _mm.moves ? Math.round((_mm.matches / _mm.moves) * 100) : 0;

  const g = !won
    ? { e: "⏰", t: "Time's Up!", c: "var(--accent-red)" }
    : accuracy >= 75
      ? { e: "🏆", t: "Super Memory!", c: "var(--accent-green)" }
      : accuracy >= 50
        ? { e: "🎉", t: "Great Job!", c: "var(--primary)" }
        : { e: "👍", t: "You Did It!", c: "var(--accent-orange)" };

  const learned = _mm.cards
    .filter((c) => c.kind === "symbol")
    .map(
      (c) =>
        `<span class="mm-chip">${c.s.icon} ${c.s.name} <em>${c.s.role}</em></span>`,
    )
    .join("");

  document.getElementById("mm-root").innerHTML =
    GameOverScreen({
      emoji: g.e,
      title: g.t,
      color: g.c,
      sub: won
        ? `You matched all ${_mm.level.pairs} pairs in ${_mm.moves} moves (${_mm.level.label})!`
        : `You matched ${_mm.matches} of ${_mm.level.pairs} pairs.`,
      score: _mm.score,
      detail: `${accuracy}% accuracy${timeBonus ? ` · +${timeBonus} time bonus` : ""}`,
      replay: `launchGame('memory');mmStart('${_mm.levelKey}')`,
    }) +
    `<div class="card mm-learned">
      <h3><span class="mm-flag-inline">${PH_FLAG_SVG}</span> Symbols in this round</h3>
      <div class="mm-chips">${learned}</div>
    </div>`;
}

function QuizPageWrapper() {
  if (window._quizState?.timerInterval) {
    clearInterval(window._quizState.timerInterval);
  }
  document.getElementById("page-container").innerHTML = QuizPage();
  bindQuiz();
}
function ResearchPageWrapper() {
  document.getElementById("page-container").innerHTML = ResearchPage();
}
function AchievementsPageWrapper() {
  document.getElementById("page-container").innerHTML = AchievementsPage();
  bindAchievements();
}
function SettingsPageWrapper() {
  document.getElementById("page-container").innerHTML = SettingsPage();
}

async function doResearch() {
  const input = document.getElementById("research-input");
  const query = input?.value.trim();
  if (!query) return;

  const results = document.getElementById("research-results");
  results.innerHTML = `<div style="display:flex;align-items:center;gap:10px;padding:16px;background:var(--card-bg);border-radius:var(--radius-lg);border:1px solid var(--border);">
          <div class="spinner" style="width:20px;height:20px;border-width:2px;"></div>
          <span style="font-size:14px;color:var(--text-400);">Searching...</span>
        </div>`;

  try {
    const res = await api.aiChat({
      message: `Answer this research question clearly and simply for a young Filipino student aged 7-12: "${query}"`,
      history: [],
    });
    const reply =
      res.reply || res.message || res.response || "No answer found.";
    results.innerHTML = `
            <div style="background:var(--card-bg);border-radius:var(--radius-lg);border:1px solid var(--border);padding:24px;box-shadow:var(--shadow-sm);">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
                <div style="width:28px;height:28px;border-radius:8px;background:var(--primary);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;">✦</div>
                <span style="font-size:13px;font-weight:700;color:var(--primary);">BIBO AI Answer</span>
              </div>
              <p style="font-size:14px;color:var(--text-700);line-height:1.8;">${escapeHtml(reply)}</p>
              <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:11px;color:var(--text-400);">⚠ Always verify with your teacher</span>
                <button onclick="document.getElementById('research-results').innerHTML='';document.getElementById('research-input').value='';" 
                  class="btn btn-ghost btn-sm">Clear</button>
              </div>
            </div>`;
  } catch (e) {
    results.innerHTML = `<div style="background:#FEE2E2;border-radius:var(--radius-lg);padding:16px;font-size:13px;color:#991B1B;">⚠️ ${e.message}</div>`;
  }
}

/* ============================================================
   EXTENDED ROUTER (override to add new pages)
   ============================================================ */
const _originalRender = render;
function render() {
  const app = document.getElementById("app");

  if (!state.token) {
    app.innerHTML = "";
    app.innerHTML = `<div id="app-auth">${LoginPage()}</div>`;
    bindLogin();
    return;
  }

  app.innerHTML = `
    <div id="app-layout">
      ${SidebarHtml()}
      <div id="main-content">
        <div id="page-container"></div>
      </div>
    </div>`;

  updateSidebarActive();

  const pageMap = {
    dashboard: () => {
      document.getElementById("page-container").innerHTML = DashboardPage();
      bindDashboard();
    },
    subjects: () => {
      document.getElementById("page-container").innerHTML = SubjectsPage();
      bindSubjects();
    },
    lessons: () => {
      document.getElementById("page-container").innerHTML = LessonsPage();
      bindLessons();
    },
    lesson: () => {
      document.getElementById("page-container").innerHTML = LessonDetailPage();
      bindLessonDetail();
    },
    ai: () => {
      document.getElementById("page-container").innerHTML = AIChatPage();
      bindAIChat();
    },
    parent: () => {
      document.getElementById("page-container").innerHTML = ParentViewPage();
      bindParent();
    },
    games: GamesPageWrapper,
    quiz: QuizPageWrapper,
    research: ResearchPageWrapper,
    achievements: AchievementsPageWrapper,
    settings: SettingsPageWrapper,
  };
  const isParent = state.user?.role === "PARENT";
  if (!isParent && !_stats) loadStats().catch(() => {});
  const parentOnlyPages = ["parent", "settings"];
  if (isParent && !parentOnlyPages.includes(state.currentPage)) {
    (pageMap["parent"] || pageMap.dashboard)();
  } else {
    (pageMap[state.currentPage] || pageMap.dashboard)();
  }
}

render();
