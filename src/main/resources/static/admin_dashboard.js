const API = "/api"; // same-origin: works on localhost and on the deployed server
let token = localStorage.getItem("bibo_admin_token") || null;
let currentUser = JSON.parse(localStorage.getItem("bibo_admin_user") || "null");
let userRole = "";

// Login page this person used (set by portal_login.js); teachers go back to /teacher.
const LOGIN_PAGE = localStorage.getItem("bibo_login_page") || "/admin";

if (!token || !currentUser) {
  window.location.replace(LOGIN_PAGE);
}

// ── Determine Role ───────────────────────────────────────────
userRole = String(
  currentUser?.role?.name || currentUser?.roleName || currentUser?.role || "",
).toUpperCase();
const isAdmin = userRole === "ADMIN";
const isTeacher = userRole === "TEACHER";

if (!isAdmin && !isTeacher) {
  localStorage.removeItem("bibo_admin_token");
  localStorage.removeItem("bibo_admin_user");
  window.location.replace(LOGIN_PAGE);
}

// ── Setup Sidebar ────────────────────────────────────────────
const username = currentUser?.username || currentUser?.name || "—";
document.getElementById("sidebar-username").textContent = username;

const ADMIN_NAV = [
  {
    id: "admin-dashboard",
    label: "Dashboard",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    section: "Main",
  },
  {
    id: "manage-accounts",
    label: "Manage Accounts",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    section: "Operations",
  },
  {
    id: "reports",
    label: "Reports",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    section: "Operations",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    section: "Operations",
  },
  {
    id: "review-requests",
    label: "Review Requests",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    section: "Operations",
  },
  {
    id: "admin-settings",
    label: "Settings",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    section: "System",
  },
];

const TEACHER_NAV = [
  {
    id: "teacher-dashboard",
    label: "Dashboard",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    section: "Main",
  },
  {
    id: "subjects",
    label: "Subjects",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    section: "Content",
  },
  {
    id: "lessons",
    label: "Lessons",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    section: "Content",
  },
  {
    id: "sections",
    label: "Sections",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    section: "Content",
  },
  {
    id: "quizzes",
    label: "Quizzes",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    section: "Content",
  },
  {
    id: "students",
    label: "Students",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    section: "Users",
  },
  {
    id: "teacher-review-requests",
    label: "Review Requests",
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    section: "Users",
  },
];

const navItems = isAdmin ? ADMIN_NAV : TEACHER_NAV;

// Render sidebar
let lastSection = "";
const navEl = document.getElementById("sidebar-nav-items");
navItems.forEach((item) => {
  if (item.section !== lastSection) {
    const label = document.createElement("div");
    label.className = "sidebar-section-label";
    if (lastSection !== "") label.style.marginTop = "8px";
    label.textContent = item.section;
    navEl.appendChild(label);
    lastSection = item.section;
  }
  const btn = document.createElement("button");
  btn.className = "nav-item";
  btn.dataset.page = item.id;
  btn.innerHTML = `${item.icon}<span>${item.label}</span>`;
  btn.onclick = () => navigate(item.id);
  navEl.appendChild(btn);
});

document.getElementById("sidebar-role-label").textContent = isAdmin
  ? "Admin Portal"
  : "Teacher Portal";
document.getElementById("sidebar-role-display").textContent = isAdmin
  ? "🛡️ Administrator"
  : "👩‍🏫 Teacher";

// ── Data Maps ────────────────────────────────────────────────
window._subjectMap = {};
window._lessonMap = {};

// ── API ─────────────────────────────────────────────────────
async function apiFetch(method, path, body = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = "Bearer " + token;
  const res = await fetch(API + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
  if (res.status === 401) {
    logout();
    return;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(data.message || data.error || `HTTP ${res.status}`);
  return data;
}

// ── Router ───────────────────────────────────────────────────
const PAGE_MAP = {
  // Admin pages
  "admin-dashboard": adminDashboard,
  "manage-accounts": manageAccounts,
  reports: reports,
  analytics: analytics,
  "review-requests": reviewRequests,
  "admin-settings": adminSettings,
  // Teacher pages
  "teacher-dashboard": teacherDashboard,
  subjects: subjects,
  lessons: lessons,
  sections: sections,
  quizzes: quizzes,
  students: students,
  "teacher-review-requests": teacherReviewRequests,
};

function navigate(page) {
  document
    .querySelectorAll(".nav-item")
    .forEach((el) => el.classList.toggle("active", el.dataset.page === page));
  if (PAGE_MAP[page]) PAGE_MAP[page]();
  const s = document.getElementById("sidebar");
  if (s.classList.contains("open")) toggleSidebar();
  window.scrollTo(0, 0);
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("sidebar-overlay").classList.toggle("open");
}

function logout() {
  localStorage.removeItem("bibo_admin_token");
  localStorage.removeItem("bibo_admin_user");
  window.location.href = isTeacher ? "/teacher" : "/admin";
}

function showToast(msg, emoji = "✅") {
  const t = document.getElementById("toast");
  t.textContent = `${emoji} ${msg}`;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

function Loading() {
  return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:16px;"><div class="spinner"></div><p style="color:var(--text-400);font-size:13px;font-weight:600;">Loading...</p></div>`;
}
function Empty(emoji, title, sub) {
  return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:12px;text-align:center;"><div style="font-size:44px;">${emoji}</div><h3>${title}</h3><p style="color:var(--text-400);font-size:13px;">${sub}</p></div>`;
}
function PageHeader(title, sub, btnLabel, btnFn) {
  return `<div class="flex-between mb-32"><div><h1 style="font-size:26px;margin-bottom:4px;">${title}</h1><p style="color:var(--text-400);font-size:14px;">${sub}</p></div>${btnLabel ? `<button class="btn btn-primary" onclick="${btnFn}">${btnLabel}</button>` : ""}</div>`;
}
function openModal(html, extraClass = "") {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.id = "active-modal";
  overlay.innerHTML = `<div class="modal ${extraClass}">${html}</div>`;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  document.body.appendChild(overlay);
}
function closeModal() {
  document.getElementById("active-modal")?.remove();
}

const SUBJECT_STYLES = {
  Mathematics: { color: "#3B3FC4", pale: "#EEF0FF", icon: "🔢" },
  Science: { color: "#0D9488", pale: "#CCFBF1", icon: "🔬" },
  English: { color: "#3B3FC4", pale: "#EEF0FF", icon: "📘" },
  Filipino: {
    color: "#EF4444",
    pale: "#FEE2E2",
    icon: `<svg viewBox="0 0 30 15" width="1.25em" height="0.625em" style="vertical-align:-0.05em;border-radius:2px;"><rect width="30" height="7.5" fill="#0038A8"/><rect y="7.5" width="30" height="7.5" fill="#CE1126"/><path d="M0 0L13 7.5L0 15Z" fill="#fff"/><circle cx="4.5" cy="7.5" r="1.6" fill="#FCD116"/><circle cx="1.6" cy="2.2" r="0.6" fill="#FCD116"/><circle cx="1.6" cy="12.8" r="0.6" fill="#FCD116"/><circle cx="10.6" cy="7.5" r="0.6" fill="#FCD116"/></svg>`,
  },
  Arts: { color: "#EC4899", pale: "#FCE7F3", icon: "🎨" },
  Values: { color: "#10B981", pale: "#D1FAE5", icon: "🌟" },
  default: { color: "#3B3FC4", pale: "#EEF0FF", icon: "📚" },
};
const getSubjectStyle = (n) => SUBJECT_STYLES[n] || SUBJECT_STYLES["default"];

// ═══════════════════════════════════════════════════════════════
// ADMIN PAGES
// ═══════════════════════════════════════════════════════════════

async function adminDashboard() {
  document.getElementById("page-container").innerHTML = `<div class="page">
    <div class="hero-banner" style="background:linear-gradient(135deg,#1E2A78 0%,#3B3FC4 60%,#5B60E0 100%);">
      <div style="position:relative;z-index:1;">
        <p style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;opacity:0.7;margin-bottom:8px;">🛡️ Admin Control Panel</p>
        <h1 style="color:white;font-size:30px;font-weight:900;margin-bottom:8px;">Welcome back, ${username}!</h1>
        <p style="color:rgba(255,255,255,0.75);font-size:14px;margin-bottom:22px;">Manage BIBO accounts, monitor platform health, and review reports.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn" style="background:rgba(255,255,255,0.15);color:white;padding:10px 18px;font-size:13px;border:1px solid rgba(255,255,255,0.2);" onclick="navigate('manage-accounts')">👥 Manage Accounts</button>
          <button class="btn" style="background:rgba(255,255,255,0.15);color:white;padding:10px 18px;font-size:13px;border:1px solid rgba(255,255,255,0.2);" onclick="navigate('analytics')">📊 View Analytics</button>
          <button class="btn" style="background:rgba(255,255,255,0.15);color:white;padding:10px 18px;font-size:13px;border:1px solid rgba(255,255,255,0.2);" onclick="navigate('review-requests')">📋 Review Requests</button>
        </div>
      </div>
    </div>

    <div class="grid-4 mb-32" id="admin-stats">
      ${[1, 2, 3, 4].map(() => `<div class="card stat-card"><div class="spinner" style="margin:8px 0;"></div></div>`).join("")}
    </div>

    <div class="section-header"><span class="section-title">Quick Actions</span></div>
    <div class="grid-3 mb-32">
      ${[
        {
          icon: "👥",
          label: "Manage Accounts",
          sub: "Create, update, or deactivate user accounts",
          page: "manage-accounts",
          color: "#EEF0FF",
        },
        {
          icon: "📊",
          label: "Analytics",
          sub: "Platform-wide usage stats and learning metrics",
          page: "analytics",
          color: "#D1FAE5",
        },
        {
          icon: "📋",
          label: "Review Requests",
          sub: "Teacher review requests from parents",
          page: "review-requests",
          color: "#FEF3C7",
        },
        {
          icon: "📄",
          label: "Reports",
          sub: "Generate and export system reports",
          page: "reports",
          color: "#FCE7F3",
        },
        {
          icon: "⚙️",
          label: "Settings",
          sub: "System configuration and preferences",
          page: "admin-settings",
          color: "#CCFBF1",
        },
      ]
        .map(
          (a) => `
        <div class="card card-interactive" style="padding:24px;" onclick="navigate('${a.page}')">
          <div style="width:52px;height:52px;border-radius:14px;background:${a.color};display:flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:14px;">${a.icon}</div>
          <h3 style="font-size:16px;margin-bottom:6px;">${a.label}</h3>
          <p style="font-size:13px;color:var(--text-400);">${a.sub}</p>
        </div>`,
        )
        .join("")}
    </div>
  </div>`;

  try {
    const users = await apiFetch("GET", "/admin/users").catch(() => []);
    const students = (users || []).filter(
      (u) => String(u.role?.name || u.role || "").toUpperCase() === "STUDENT",
    );
    const teachers = (users || []).filter(
      (u) => String(u.role?.name || u.role || "").toUpperCase() === "TEACHER",
    );
    const parents = (users || []).filter(
      (u) => String(u.role?.name || u.role || "").toUpperCase() === "PARENT",
    );

    document.getElementById("admin-stats").innerHTML = [
      {
        label: "Total Users",
        value: users?.length ?? "—",
        icon: "👥",
        color: "var(--primary)",
      },
      {
        label: "Students",
        value: students.length,
        icon: "🎒",
        color: "var(--accent-green)",
      },
      {
        label: "Parents",
        value: parents.length,
        icon: "👨‍👩‍👧",
        color: "var(--accent-orange)",
      },
      {
        label: "Teachers",
        value: teachers.length,
        icon: "👩‍🏫",
        color: "var(--primary-mid)",
      },
    ]
      .map(
        (s) => `
      <div class="card stat-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <span class="stat-label">${s.label}</span><span style="font-size:22px;">${s.icon}</span>
        </div>
        <div class="stat-value" style="color:${s.color};">${s.value}</div>
      </div>`,
      )
      .join("");
  } catch (e) {
    document.getElementById("admin-stats").innerHTML =
      `<div style="color:var(--accent-red);padding:16px;grid-column:1/-1;">⚠️ Could not load stats: ${e.message}</div>`;
  }
}

// ── MANAGE ACCOUNTS ──────────────────────────────────────────
async function manageAccounts() {
  _roleFilter = "ALL";
  _searchQuery = "";

  document.getElementById("page-container").innerHTML = `<div class="page">
    ${PageHeader("Manage Accounts", "Create, update, and deactivate user accounts", "+ New Account", "openCreateAccount()")}

    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
      <!-- Role Filter -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;" id="role-filters">
        ${["All", "Student", "Parent", "Teacher", "Admin"]
          .map(
            (r, i) => `<button onclick="filterAccounts('${r.toUpperCase()}')" id="rf-${r}" class="btn btn-sm" style="background:${i === 0 ? "var(--primary)" : "var(--bg)"};color:${i === 0 ? "white" : "var(--text-500)"};">${r}</button>`,
          )
          .join("")}
      </div>

      <!-- Search -->
      <div style="position:relative;flex:1;max-width:340px;min-width:220px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"
          style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--text-400);pointer-events:none;">
          <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input id="account-search" class="bibo-input" type="search" autocomplete="off"
          placeholder="Search name, username, email, or ID…  ( / )"
          style="padding-left:40px;"
          oninput="onSearchAccounts(this.value)"
          onkeydown="if(event.key==='Escape'){this.value='';onSearchAccounts('');}" />
      </div>
    </div>

    <div id="accounts-list">${Loading()}</div>
  </div>`;

  await loadAccounts();
}

let _allAccounts = [];
let _roleFilter = "ALL";
let _searchQuery = "";

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

async function loadAccounts() {
  try {
    _allAccounts = (await apiFetch("GET", "/admin/users")) || [];
    filterAccounts(_roleFilter);
  } catch (e) {
    document.getElementById("accounts-list").innerHTML =
      `<div style="color:var(--accent-red);padding:20px;">⚠️ ${esc(e.message)}</div>`;
  }
}

function onSearchAccounts(value) {
  _searchQuery = value.trim().toLowerCase();
  filterAccounts(_roleFilter);
}

function filterAccounts(role = _roleFilter) {
  _roleFilter = role;

  // Active tab styling
  document.querySelectorAll('[id^="rf-"]').forEach((btn) => {
    const isActive = btn.id.toUpperCase() === `RF-${role}`;
    btn.style.background = isActive ? "var(--primary)" : "var(--bg)";
    btn.style.color = isActive ? "white" : "var(--text-500)";
  });

  // Role + search filter
  const q = _searchQuery;
  const filtered = _allAccounts.filter((u) => {
    const r = String(u.role?.name || u.role || "").toUpperCase();
    if (role !== "ALL" && r !== role) return false;
    if (!q) return true;
    return [u.firstName, u.lastName, `${u.firstName || ""} ${u.lastName || ""}`, u.username, u.email, String(u.id)]
      .some((v) => String(v || "").toLowerCase().includes(q));
  });

  if (!filtered.length) {
    document.getElementById("accounts-list").innerHTML = q
      ? Empty("🔍", "No matches", `No accounts match "${esc(q)}".`)
      : Empty("👥", "No accounts found", "No accounts match this filter.");
    return;
  }

  const roleBadges = {
    ADMIN: "badge-purple",
    TEACHER: "badge-blue",
    STUDENT: "badge-green",
    PARENT: "badge-orange",
  };

  document.getElementById("accounts-list").innerHTML = `
    <div class="card" style="overflow:hidden;">
      <table class="data-table">
        <thead><tr>
          <th>User</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th style="text-align:right;">Actions</th>
        </tr></thead>
        <tbody>
          ${filtered
            .map((u) => {
              const role = String(u.role?.name || u.role || "").toUpperCase();
              const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.username || "—";
              const initial = (u.firstName || u.username || "?")[0].toUpperCase();
              const isEnabled = u.enabled !== false;
              const id = Number(u.id);
              return `<tr>
                <td>
                  <div style="display:flex;align-items:center;gap:10px;">
                    <div style="width:36px;height:36px;border-radius:50%;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-weight:800;color:var(--primary);font-size:14px;">${esc(initial)}</div>
                    <div>
                      <div style="font-weight:700;color:var(--text-900);">${esc(fullName)}</div>
                      <div style="font-size:12px;color:var(--text-400);">ID: ${id}</div>
                    </div>
                  </div>
                </td>
                <td style="color:var(--text-400);">@${esc(u.username || "—")}</td>
                <td style="font-size:13px;color:var(--text-500);">${esc(u.email || "—")}</td>
                <td><span class="badge ${roleBadges[role] || "badge-gray"}">${esc(role)}</span></td>
                <td><span class="badge ${isEnabled ? "badge-green" : "badge-red"}">${isEnabled ? "Active" : "Inactive"}</span></td>
                <td style="text-align:right;">
                  <div style="display:flex;gap:6px;justify-content:flex-end;">
                    <button class="btn btn-sm btn-ghost" onclick="openEditAccount(${id})">Edit</button>
                    ${
                      isEnabled
                        ? `<button class="btn btn-sm btn-danger" onclick="deactivateAccount(${id})">Deactivate</button>`
                        : `<button class="btn btn-sm" style="background:#ECFDF5;color:#047857;" onclick="activateAccount(${id})">Activate</button>`
                    }
                  </div>
                </td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>`;
}

function openCreateAccount() {
  openModal(`
        <div class="modal-header">
          <div class="modal-title">👥 New Account</div>
          <button class="modal-close" onclick="closeModal()">✕</button>
        </div>
        <div id="acc-err" style="display:none;background:#FEE2E2;color:#991B1B;font-size:13px;font-weight:700;padding:10px 14px;border-radius:var(--radius-sm);margin-bottom:14px;"></div>

        <p style="font-size:12px;font-weight:700;color:var(--text-400);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:12px;">Parent Account</p>
        <div class="field-row">
          <div class="field"><label>First Name</label><input id="acc-fname" class="bibo-input" placeholder="Maria" /></div>
          <div class="field"><label>Last Name</label><input id="acc-lname" class="bibo-input" placeholder="Santos" /></div>
        </div>
        <div class="field"><label>Username</label><input id="acc-username" class="bibo-input" placeholder="mariasantos" /></div>
        <div class="field"><label>Email</label><input id="acc-email" class="bibo-input" type="email" placeholder="maria@email.com" /></div>
        <div class="field"><label>Password</label><input id="acc-password" class="bibo-input" type="password" placeholder="Minimum 8 characters" /></div>
        <div class="field"><label>Role</label>
          <select id="acc-role" class="bibo-input" onchange="toggleChildForm(this.value)">
            <option value="TEACHER">Teacher</option>
            <option value="PARENT">Parent</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div id="child-section" style="display:none;margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <p style="font-size:12px;font-weight:700;color:var(--text-400);text-transform:uppercase;letter-spacing:0.5px;">Children</p>
            <div style="display:flex;align-items:center;gap:8px;">
              <label style="font-size:12px;font-weight:700;color:var(--text-500);">How many?</label>
              <input id="child-count-select" class="bibo-input" type="number" min="1" max="10" value="1"
                style="width:80px;padding:6px 10px;"
                oninput="renderChildForms(this.value)" />
            </div>
          </div>
          <div id="child-forms-container"></div>
        </div>

        <div style="display:flex;gap:10px;margin-top:18px;">
          <button class="btn btn-ghost" style="flex:1;" onclick="closeModal()">Cancel</button>
          <button class="btn btn-primary" style="flex:1;" id="acc-btn" onclick="submitCreateAccount()">Create Account</button>
        </div>
      `);
}

function toggleChildForm(role) {
  const section = document.getElementById("child-section");
  if (role === "PARENT") {
    section.style.display = "";
    renderChildForms(1);
  } else {
    section.style.display = "none";
  }
}

function renderChildForms(count) {
  const container = document.getElementById("child-forms-container");
  container.innerHTML = "";
  for (let i = 1; i <= parseInt(count); i++) {
    container.innerHTML += `
          <div style="background:var(--bg);border-radius:var(--radius-md);padding:16px;margin-bottom:12px;">
            <p style="font-size:12px;font-weight:700;color:var(--text-500);margin-bottom:10px;">Child ${i}</p>
            <div class="field-row">
              <div class="field"><label>First Name</label><input id="child-fname-${i}" class="bibo-input" placeholder="Juan" /></div>
              <div class="field"><label>Last Name</label><input id="child-lname-${i}" class="bibo-input" placeholder="Santos" /></div>
            </div>
            <div class="field"><label>Username</label><input id="child-username-${i}" class="bibo-input" placeholder="juansantos${i}" /></div>
            <div class="field"><label>Email</label><input id="child-email-${i}" class="bibo-input" type="email" placeholder="juan${i}@email.com" /></div>
            <div class="field"><label>Password</label><input id="child-password-${i}" class="bibo-input" type="password" placeholder="Minimum 8 characters" /></div>
            <div class="field-row">
              <div class="field"><label>Age</label><input id="child-age-${i}" class="bibo-input" type="number" placeholder="8" /></div>
              <div class="field"><label>Grade</label><input id="child-grade-${i}" class="bibo-input" placeholder="Grade 3" /></div>
            </div>
            <div class="field"><label>School</label><input id="child-school-${i}" class="bibo-input" placeholder="BIBO Elementary" /></div>
          </div>
        `;
  }
}

async function submitCreateAccount() {
  const role = document.getElementById("acc-role").value;
  const errEl = document.getElementById("acc-err");
  const btn = document.getElementById("acc-btn");

  const body = {
    firstName: document.getElementById("acc-fname").value.trim(),
    lastName: document.getElementById("acc-lname").value.trim(),
    username: document.getElementById("acc-username").value.trim(),
    email: document.getElementById("acc-email").value.trim(),
    password: document.getElementById("acc-password").value.trim(),
    role,
  };

  if (!body.username || !body.email || !body.password) {
    errEl.textContent = "Username, email and password are required.";
    errEl.style.display = "";
    return;
  }

  if (role === "PARENT") {
    const count = parseInt(document.getElementById("child-count-select").value);
    const children = [];

    for (let i = 1; i <= count; i++) {
      const child = {
        firstName: document.getElementById(`child-fname-${i}`).value.trim(),
        lastName: document.getElementById(`child-lname-${i}`).value.trim(),
        username: document.getElementById(`child-username-${i}`).value.trim(),
        email: document.getElementById(`child-email-${i}`).value.trim(),
        password: document.getElementById(`child-password-${i}`).value.trim(),
        age: parseInt(document.getElementById(`child-age-${i}`).value) || null,
        grade: document.getElementById(`child-grade-${i}`).value.trim(),
        school: document.getElementById(`child-school-${i}`).value.trim(),
      };

      if (!child.username || !child.email || !child.password) {
        errEl.textContent = `Child ${i}: username, email and password are required.`;
        errEl.style.display = "";
        return;
      }

      children.push(child);
    }

    body.children = children;
  }

  btn.disabled = true;
  btn.textContent = "Creating...";

  try {
    await apiFetch("POST", "/admin/users", body);
    closeModal();
    showToast("Account created!", "👥");
    await loadAccounts();
  } catch (e) {
    errEl.textContent = e.message;
    errEl.style.display = "";
    btn.disabled = false;
    btn.textContent = "Create Account";
  }
}

function openEditAccount(id) {
  const u = _allAccounts.find((a) => a.id === id);
  if (!u) return;
  openModal(`
    <div class="modal-header"><div class="modal-title">✏️ Edit Account</div><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div id="eacc-err" style="display:none;background:#FEE2E2;color:#991B1B;font-size:13px;font-weight:700;padding:10px 14px;border-radius:var(--radius-sm);margin-bottom:14px;"></div>
    <div class="field-row">
      <div class="field"><label>First Name</label><input id="eacc-fname" class="bibo-input" value="${u.firstName || ""}" /></div>
      <div class="field"><label>Last Name</label><input id="eacc-lname" class="bibo-input" value="${u.lastName || ""}" /></div>
    </div>
    <div class="field"><label>Email</label><input id="eacc-email" class="bibo-input" type="email" value="${u.email || ""}" /></div>
    <div style="display:flex;gap:10px;margin-top:8px;">
      <button class="btn btn-ghost" style="flex:1;" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" style="flex:1;" id="eacc-btn" onclick="submitEditAccount(${id})">Save Changes</button>
    </div>`);
}

async function submitEditAccount(id) {
  const firstName = document.getElementById("eacc-fname").value.trim();
  const lastName = document.getElementById("eacc-lname").value.trim();
  const email = document.getElementById("eacc-email").value.trim();
  const errEl = document.getElementById("eacc-err");
  const btn = document.getElementById("eacc-btn");
  btn.disabled = true;
  btn.textContent = "Saving...";
  try {
    await apiFetch("PUT", `/admin/users/${id}`, {
      firstName,
      lastName,
      email,
    });
    closeModal();
    showToast("Account updated!", "✏️");
    await loadAccounts();
  } catch (e) {
    errEl.textContent = e.message;
    errEl.style.display = "";
    btn.disabled = false;
    btn.textContent = "Save Changes";
  }
}

async function deactivateAccount(id) {
  if (!confirm("Deactivate this account?")) return;
  try {
    await apiFetch("PATCH", `/admin/users/${id}/deactivate`);
    showToast("Account deactivated.", "🛑");
    await loadAccounts();
  } catch (e) {
    showToast(e.message, "⚠️");
  }
}
async function activateAccount(id) {
  if (!confirm("Activate this account?")) return;
  try {
    await apiFetch("PATCH", `/admin/users/${id}/activate`);
    showToast("Account activated.", "✅");
    await loadAccounts();
  } catch (e) {
    showToast(e.message, "⚠️");
  }
}

// ── REPORTS ─────────────────────────────────────────────────
const REPORTS = [
  { type: "users", icon: "👥", title: "User Report", sub: "All accounts by role and status", color: "#EEF0FF" },
  { type: "content", icon: "📚", title: "Content Report", sub: "Subjects, lessons, and section counts", color: "#D1FAE5" },
  { type: "progress", icon: "📊", title: "Progress Report", sub: "Every student's lesson progress", color: "#FEF3C7" },
  { type: "quizzes", icon: "✅", title: "Quiz Report", sub: "Quiz attempts, scores, and pass/fail", color: "#FCE7F3" },
];

async function reports() {
  document.getElementById("page-container").innerHTML = `<div class="page">
    ${PageHeader("Reports", "Preview and export live platform data as CSV", "", "")}
    <div class="grid-2 mb-24">
      ${REPORTS.map(
        (r) => `
        <div class="card" style="padding:24px;">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
            <div style="width:48px;height:48px;border-radius:14px;background:${r.color};display:flex;align-items:center;justify-content:center;font-size:24px;">${r.icon}</div>
            <div>
              <p style="font-weight:800;font-size:15px;color:var(--text-900);">${r.title}</p>
              <p style="font-size:12px;color:var(--text-400);">${r.sub}</p>
            </div>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-ghost btn-sm" style="flex:1;" onclick="previewReport('${r.type}', this)">Preview</button>
            <button class="btn btn-primary btn-sm" style="flex:1;" onclick="exportReport('${r.type}', this)">Export CSV</button>
          </div>
        </div>`,
      ).join("")}
    </div>
  </div>`;
}

// CSV endpoints return text, so they bypass apiFetch (which expects JSON).
async function fetchReport(type) {
  const res = await fetch(`${API}/admin/reports/${type}`, {
    headers: { Authorization: "Bearer " + token },
  });
  if (res.status === 401) {
    logout();
    throw new Error("Session expired");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || `HTTP ${res.status}`);
  }
  return res;
}

// Minimal RFC 4180 parser — enough for our own exports (quoted cells, "" escapes, CRLF).
function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  text = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (c !== "\r") cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

async function withBusy(btn, label, fn) {
  const original = btn.textContent;
  btn.disabled = true;
  btn.textContent = label;
  try {
    await fn();
  } catch (e) {
    showToast(e.message, "⚠️");
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

function previewReport(type, btn) {
  const meta = REPORTS.find((r) => r.type === type);
  return withBusy(btn, "Loading…", async () => {
    const rows = parseCsv(await (await fetchReport(type)).text());
    const [header = [], ...body] = rows;
    const shown = body.slice(0, 15);
    openModal(`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h3>${meta.icon} ${meta.title}</h3>
        <button class="btn btn-ghost btn-sm" onclick="closeModal()">Close</button>
      </div>
      <p style="font-size:12px;color:var(--text-400);margin-bottom:12px;">
        ${body.length} row${body.length === 1 ? "" : "s"}${body.length > shown.length ? ` · showing first ${shown.length}` : ""}
      </p>
      ${
        body.length
          ? `<div style="overflow:auto;max-height:60vh;"><table class="data-table">
              <thead><tr>${header.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead>
              <tbody>${shown.map((r) => `<tr>${r.map((c) => `<td style="white-space:nowrap;">${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody>
            </table></div>`
          : Empty("📭", "No data yet", "This report is empty.")
      }
      <button class="btn btn-primary" style="width:100%;margin-top:16px;" onclick="exportReport('${type}', this)">Export CSV</button>`);
  });
}

function exportReport(type, btn) {
  return withBusy(btn, "Exporting…", async () => {
    const res = await fetchReport(type);
    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition") || "";
    const match = disposition.match(/filename="?([^";]+)"?/);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = match ? match[1] : `bibo-${type}-report.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    showToast("Report downloaded", "📥");
  });
}

// ── ANALYTICS ────────────────────────────────────────────────
async function analytics() {
  document.getElementById("page-container").innerHTML = `<div class="page">
    ${PageHeader("Analytics", "Platform-wide learning and usage metrics", "", "")}
    <div class="grid-4 mb-24" id="analytics-stats">
      ${[1, 2, 3, 4].map(() => `<div class="card stat-card"><div class="spinner"></div></div>`).join("")}
    </div>
    <div class="grid-2 mb-24">
      <div class="card" style="padding:24px;">
        <p style="font-weight:800;font-size:15px;color:var(--text-900);margin-bottom:4px;">Lesson Completion by Subject</p>
        <p style="font-size:12px;color:var(--text-400);margin-bottom:20px;">Completed lessons ÷ (active students × published lessons)</p>
        <div id="an-subjects">${Loading()}</div>
      </div>
      <div class="card" style="padding:24px;">
        <p style="font-weight:800;font-size:15px;color:var(--text-900);margin-bottom:4px;">Daily Active Learners</p>
        <p style="font-size:12px;color:var(--text-400);margin-bottom:20px;">Students who opened a lesson or took a quiz, last 7 days</p>
        <div id="an-weekly">${Loading()}</div>
      </div>
    </div>
    <div class="card" style="padding:24px;">
      <p style="font-weight:800;font-size:15px;color:var(--text-900);margin-bottom:16px;">🏆 Top Performing Students</p>
      <div id="top-students">${Loading()}</div>
    </div>
  </div>`;

  try {
    const a = await apiFetch("GET", "/admin/analytics");

    document.getElementById("analytics-stats").innerHTML = [
      { label: "Active Students", value: a.activeStudents, icon: "🎒", color: "var(--primary)" },
      { label: "Avg. Progress", value: `${a.avgProgress}%`, icon: "📊", color: "var(--accent-green)" },
      { label: "Quizzes Taken", value: a.quizzesTaken, icon: "✅", color: "var(--accent-orange)" },
      { label: "Lessons Done", value: a.lessonsCompleted, icon: "📚", color: "var(--primary-mid)" },
    ].map((s) => `<div class="card stat-card"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;"><span class="stat-label">${s.label}</span><span style="font-size:22px;">${s.icon}</span></div><div class="stat-value" style="color:${s.color};">${s.value}</div></div>`).join("");

    document.getElementById("an-subjects").innerHTML = a.completionBySubject.length
      ? `<div style="display:flex;flex-direction:column;gap:12px;">${a.completionBySubject.map((s) => {
          const st = getSubjectStyle(s.subject);
          return `<div>
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <span style="font-size:13px;font-weight:600;">${st.icon} ${s.subject}</span>
              <span style="font-size:13px;font-weight:800;color:${st.color};">${s.pct}%</span>
            </div>
            <div class="progress-track"><div class="progress-fill" style="width:${s.pct}%;background:${st.color};"></div></div>
          </div>`;
        }).join("")}</div>`
      : Empty("📚", "No published lessons", "Publish lessons in an active subject to see completion.");

    const max = Math.max(1, ...a.weeklyActive.map((d) => d.count));
    document.getElementById("an-weekly").innerHTML = `<div style="display:flex;gap:8px;align-items:flex-end;height:100px;">${a.weeklyActive.map((d) => {
      const h = Math.round((d.count / max) * 80) + 10;
      return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
        <span style="font-size:10px;font-weight:700;color:var(--text-700);">${d.count}</span>
        <div style="width:100%;height:${h}px;background:var(--primary);border-radius:6px 6px 3px 3px;opacity:0.85;"></div>
        <span style="font-size:10px;color:var(--text-400);">${d.day}</span>
      </div>`;
    }).join("")}</div>`;

    document.getElementById("top-students").innerHTML = a.topStudents.length
      ? `<table class="data-table">
          <thead><tr><th>#</th><th>Student</th><th>Username</th><th>Progress</th></tr></thead>
          <tbody>${a.topStudents.map((s, i) => `<tr>
            <td><span style="font-weight:800;color:var(--primary);">${i + 1}</span></td>
            <td><div style="display:flex;align-items:center;gap:8px;">
              <div style="width:30px;height:30px;border-radius:50%;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-weight:800;color:var(--primary);font-size:12px;">${(s.firstName || s.username || "?")[0].toUpperCase()}</div>
              <span style="font-weight:600;">${`${s.firstName || ""} ${s.lastName || ""}`.trim() || s.username}</span>
            </div></td>
            <td style="color:var(--text-400);">@${s.username || "—"}</td>
            <td><span class="badge badge-green">${s.progress}%</span></td>
          </tr>`).join("")}</tbody>
        </table>`
      : Empty("🏆", "No completions yet", "Students appear here after completing a lesson.");
  } catch (e) {
    document.getElementById("analytics-stats").innerHTML =
      `<div style="color:var(--accent-red);padding:16px;grid-column:1/-1;">⚠️ Could not load analytics: ${e.message}</div>`;
    ["an-subjects", "an-weekly", "top-students"].forEach((id) => (document.getElementById(id).innerHTML = ""));
  }
}

// ── REVIEW REQUESTS ──────────────────────────────────────────
async function reviewRequests() {
  document.getElementById("page-container").innerHTML = `<div class="page">
    ${PageHeader("Review Requests", "Teacher review requests submitted by parents", "", "")}
    <div id="review-list">${Loading()}</div>
  </div>`;

  try {
    const data = await apiFetch("GET", "/admin/review-requests").catch(
      () => [],
    );
    if (!data?.length) {
      document.getElementById("review-list").innerHTML = Empty(
        "📋",
        "No requests yet",
        "Parent review requests will appear here.",
      );
      return;
    }
    document.getElementById("review-list").innerHTML = `
      <div class="card" style="overflow:hidden;">
        <table class="data-table">
          <thead><tr><th>Parent</th><th>Child</th><th>Requested</th><th>Status</th><th style="text-align:right;">Actions</th></tr></thead>
          <tbody>
            ${data
              .map(
                (r) => `<tr>
              <td style="font-weight:600;">@${r.parentUsername || r.parent?.username || "—"}</td>
              <td style="font-weight:600;">@${r.childUsername || r.child?.username || "—"}</td>
              <td style="font-size:13px;color:var(--text-400);">${r.requestedAt ? new Date(r.requestedAt).toLocaleDateString() : "—"}</td>
              <td><span class="badge ${{ PENDING: "badge-orange", IN_REVIEW: "badge-blue", DONE: "badge-green" }[r.status] || "badge-gray"}">${r.status || "PENDING"}</span></td>
              <td style="text-align:right;">
                <div style="display:flex;gap:6px;justify-content:flex-end;">
                  ${r.status === "PENDING" ? `<button class="btn btn-sm btn-ghost" onclick="updateReviewStatus(${r.id},'IN_REVIEW')">Start Review</button>` : ""}
                  ${r.status === "IN_REVIEW" ? `<button class="btn btn-sm" style="background:#ECFDF5;color:#047857;" onclick="updateReviewStatus(${r.id},'DONE')">Mark Done</button>` : ""}
                </div>
              </td>
            </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>`;
  } catch (e) {
    document.getElementById("review-list").innerHTML =
      `<div style="color:var(--accent-red);padding:20px;">⚠️ ${e.message}</div>`;
  }
}

async function updateReviewStatus(id, status) {
  try {
    await apiFetch("PATCH", `/admin/review-requests/${id}/status`, {
      status,
    });
    showToast(`Status updated to ${status}`, "✅");
    await reviewRequests();
  } catch (e) {
    showToast(e.message, "⚠️");
  }
}

// ── ADMIN SETTINGS ───────────────────────────────────────────
function adminSettings() {
  document.getElementById("page-container").innerHTML = `<div class="page">
    ${PageHeader("Settings", "Your admin account", "", "")}
    <div style="display:flex;flex-direction:column;gap:16px;max-width:640px;">
      <div class="card" style="padding:24px;">
        <p style="font-weight:800;font-size:15px;color:var(--text-900);margin-bottom:4px;">🔐 Change Password</p>
        <p style="font-size:13px;color:var(--text-400);margin-bottom:16px;">Signed in as <strong>@${esc(username)}</strong>. Use at least 8 characters.</p>
        <div class="field"><label>Current Password</label><input id="pw-current" class="bibo-input" type="password" autocomplete="current-password" placeholder="Enter current password" /></div>
        <div class="field"><label>New Password</label><input id="pw-new" class="bibo-input" type="password" autocomplete="new-password" placeholder="Enter new password" /></div>
        <div class="field"><label>Confirm Password</label><input id="pw-confirm" class="bibo-input" type="password" autocomplete="new-password" placeholder="Repeat new password" /></div>
        <button id="pw-submit" class="btn btn-primary" onclick="submitChangePassword()">Update Password</button>
      </div>
    </div>
  </div>`;
}

async function submitChangePassword() {
  const val = (id) => document.getElementById(id).value;
  const currentPassword = val("pw-current");
  const newPassword = val("pw-new");

  if (!currentPassword || !newPassword) return showToast("Fill in all fields", "⚠️");
  if (newPassword.length < 8) return showToast("New password must be at least 8 characters", "⚠️");
  if (newPassword !== val("pw-confirm")) return showToast("New passwords don't match", "⚠️");

  const btn = document.getElementById("pw-submit");
  btn.disabled = true;
  try {
    await apiFetch("POST", "/admin/change-password", { currentPassword, newPassword });
    ["pw-current", "pw-new", "pw-confirm"].forEach((id) => (document.getElementById(id).value = ""));
    showToast("Password updated!", "🔐");
  } catch (e) {
    showToast(e.message, "⚠️");
  } finally {
    btn.disabled = false;
  }
}

// ═══════════════════════════════════════════════════════════════
// TEACHER PAGES (moved from original admin dashboard)
// ═══════════════════════════════════════════════════════════════

// ── TEACHER DASHBOARD ───────────────────────────────────────────
async function teacherDashboard() {
  document.getElementById("page-container").innerHTML = `
          <div class="page">
            <div class="hero-banner" style="background:linear-gradient(135deg,#065f46 0%,#10b981 60%,#34d399 100%);">
              <div style="position:relative;z-index:1;">
                <p style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;opacity:0.7;margin-bottom:8px;">👩‍🏫 TEACHER PORTAL</p>
                <h1 style="color:white;font-size:30px;font-weight:900;margin-bottom:8px;">Welcome back, ${username}!</h1>
                <p style="color:rgba(255,255,255,0.85);font-size:14px;">Manage your classes and respond to parent requests.</p>
              </div>
            </div>

            <div class="grid-4 mb-32" id="teacher-stats">
              ${[1, 2, 3, 4].map(() => `<div class="card stat-card"><div class="spinner"></div></div>`).join("")}
            </div>

            <div class="section-header"><span class="section-title">Quick Actions</span></div>
            <div class="grid-3 mb-32">
              ${[
                { icon: "📚", label: "Subjects", page: "subjects" },
                { icon: "📝", label: "Lessons", page: "lessons" },
                { icon: "✅", label: "Quizzes", page: "quizzes" },
                { icon: "👥", label: "My Students", page: "students" },
                {
                  icon: "📋",
                  label: "Review Requests",
                  page: "teacher-review-requests",
                },
              ]
                .map(
                  (a) => `
                <div class="card card-interactive" style="padding:24px;" onclick="navigate('${a.page}')">
                  <div style="width:52px;height:52px;border-radius:14px;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:14px;">${a.icon}</div>
                  <h3 style="font-size:16px;margin-bottom:6px;">${a.label}</h3>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>`;

  try {
    console.log("🔄 Loading teacher dashboard stats...");

    let studentCount = 0;
    try {
      const studentsData = await apiFetch("GET", "/teacher/students");
      const reviewRequests = await apiFetch("GET", "/teacher/review-requests");
      //document.getElementById("total-students-stat").textContent = Array.isArray(studentsData) ? studentsData.length : 0;

      if (Array.isArray(studentsData)) {
        studentCount = studentsData.length;
      } else if (studentsData && typeof studentsData === "object") {
        // Check for paginated response
        if (Array.isArray(studentsData.content)) {
          studentCount = studentsData.content.length;
        } else if (Array.isArray(studentsData.students)) {
          studentCount = studentsData.students.length;
        } else if (Array.isArray(studentsData.data)) {
          studentCount = studentsData.data.length;
        } else if (studentsData.totalElements !== undefined) {
          studentCount = studentsData.totalElements;
        } else {
          // If it's a single object but not empty
          studentCount = Object.keys(studentsData).length > 0 ? 1 : 0;
        }
      }

      console.log("✅ Final student count:", studentCount);
    } catch (e) {
      console.error("❌ Students API failed:", e.message);
    }

    // Subjects
    let subjectCount = 0;
    try {
      const subjects = await apiFetch("GET", "/subjects");
      subjectCount = Array.isArray(subjects) ? subjects.length : 0;
    } catch (e) {}

    let lessonCount = 0;
    try {
      const subjects = await apiFetch("GET", "/subjects");
      if (Array.isArray(subjects) && subjects.length > 0) {
        for (const sub of subjects) {
          try {
            const lessons = await apiFetch("GET", `/lessons/subject/${sub.id}`);
            lessonCount += Array.isArray(lessons) ? lessons.length : 0;
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn("⚠️ Lessons count failed:", e.message);
    }

    let reviewCount = 0;
    try {
      const reviews = await apiFetch("GET", "/teacher/review-requests");
      reviewCount = Array.isArray(reviews) ? reviews.length : 0;
    } catch (e) {}

    document.getElementById("teacher-stats").innerHTML = `
            <div class="card stat-card">
              <div class="stat-label">MY STUDENTS</div>
              <div class="stat-value" style="color:var(--accent-green);">${studentCount}</div>
            </div>
            <div class="card stat-card">
              <div class="stat-label">REVIEW REQUESTS</div>
              <div class="stat-value" style="color:var(--accent-orange);">${reviewCount}</div>
            </div>
            <div class="card stat-card">
              <div class="stat-label">SUBJECTS</div>
              <div class="stat-value" style="color:var(--primary);">${subjectCount}</div>
            </div>
            <div class="card stat-card">
              <div class="stat-label">ACTIVE LESSONS</div>
              <div class="stat-value" style="color:var(--accent-green);">${lessonCount}</div>
            </div>
          `;
  } catch (e) {
    console.error("Dashboard error:", e);
    document.getElementById("teacher-stats").innerHTML = `
            <div style="grid-column:1/-1; padding:30px; text-align:center; color:var(--accent-red);">
              ⚠️ Could not load some statistics
            </div>`;
  }
}

// ── STUDENTS ─────────────────────────────────────────────────────
async function students() {
  document.getElementById("page-container").innerHTML = `
    <div class="page">
      ${PageHeader("My Students", "Students under your supervision", "", "")}
      <div id="students-list">${Loading()}</div>
    </div>`;

  try {
    const data = await apiFetch("GET", "/teacher/students");
    const studentsList = Array.isArray(data) ? data : [];

    if (studentsList.length === 0) {
      document.getElementById("students-list").innerHTML = Empty(
        "👥",
        "No students yet",
        "Students will appear here once their accounts are created.",
      );
      return;
    }

    document.getElementById("students-list").innerHTML = `
      <div class="card" style="overflow:hidden;">
        <table class="data-table">
          <thead>
            <tr><th>Student</th><th>Username</th><th>Level</th><th>Joined</th></tr>
          </thead>
          <tbody>
            ${studentsList
              .map((s) => {
                const name = `${s.firstName || ""} ${s.lastName || ""}`.trim() || s.username || "—";
                const level = s.learningLevel || "—";
                const joined = s.joinedAt ? new Date(s.joinedAt).toLocaleDateString() : "—";
                return `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                      <div style="width:36px;height:36px;border-radius:50%;background:var(--primary-light);display:flex;align-items:center;justify-content:center;font-weight:800;color:var(--primary);font-size:14px;">
                        ${esc((name[0] || "?").toUpperCase())}
                      </div>
                      <span style="font-weight:600;">${esc(name)}</span>
                    </div>
                  </td>
                  <td style="color:var(--text-400);">@${esc(s.username || "—")}</td>
                  <td><span class="badge badge-blue">${esc(level)}</span></td>
                  <td style="font-size:13px;color:var(--text-400);">${joined}</td>
                </tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>`;
  } catch (e) {
    document.getElementById("students-list").innerHTML =
      `<div style="color:var(--accent-red);padding:20px;">⚠️ ${esc(e.message)}</div>`;
  }
}

// ── TEACHER REVIEW REQUESTS ─────────────────────────────────────
async function teacherReviewRequests() {
  document.getElementById("page-container").innerHTML = `
    <div class="page">
      ${PageHeader("Review Requests", "Parent requests for progress review", "", "")}
      <div id="teacher-review-list">${Loading()}</div>
    </div>`;

  try {
    const data = await apiFetch("GET", "/teacher/review-requests");
    if (!data?.length) {
      document.getElementById("teacher-review-list").innerHTML = Empty(
        "📋",
        "No review requests",
        "Parent requests will appear here.",
      );
      return;
    }

    document.getElementById("teacher-review-list").innerHTML = `
      <div class="card" style="overflow:hidden;">
        <table class="data-table">
          <thead><tr><th>Parent</th><th>Child</th><th>Requested</th><th>Status</th><th style="text-align:right;">Actions</th></tr></thead>
          <tbody>
            ${data
              .map(
                (r) => `
              <tr>
                <td style="font-weight:600;">${r.parentName || "@" + (r.parentUsername || "—")}</td>
                <td style="font-weight:600;">${r.childName || "@" + (r.childUsername || "—")}</td>
                <td style="font-size:13px;color:var(--text-400);">${r.requestedAt ? new Date(r.requestedAt).toLocaleDateString() : "—"}</td>
                <td><span class="badge ${r.status === "PENDING" ? "badge-orange" : r.status === "IN_REVIEW" ? "badge-blue" : "badge-green"}">${r.status}</span></td>
                <td style="text-align:right;">
                  ${
                    r.status === "PENDING"
                      ? `<button class="btn btn-sm" style="background:#ECFDF5;color:#047857;" onclick="updateTeacherReviewStatus(${r.id}, 'IN_REVIEW')">Start Review</button>`
                      : ""
                  }
                  ${
                    r.status === "IN_REVIEW"
                      ? `<button class="btn btn-sm btn-primary" onclick="updateTeacherReviewStatus(${r.id}, 'DONE')">Mark Done</button>`
                      : ""
                  }
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>`;
  } catch (e) {
    document.getElementById("teacher-review-list").innerHTML =
      `<div style="color:var(--accent-red);padding:20px;">⚠️ ${e.message}</div>`;
  }
}

async function updateTeacherReviewStatus(id, status) {
  if (!confirm(`Mark this request as ${status}?`)) return;
  try {
    await apiFetch(
      "PATCH",
      `/teacher/review-requests/${id}/status?status=${status}`,
    );
    showToast(`Request updated to ${status}`, "✅");
    await teacherReviewRequests();
  } catch (e) {
    showToast(e.message, "⚠️");
  }
}

// ── SUBJECTS ──────────────────────────────────────────────────
async function subjects() {
  document.getElementById("page-container").innerHTML =
    `<div class="page">${PageHeader("Subjects", "Manage all curriculum subjects", "+ New Subject", "openCreateSubject()")}<div id="subjects-list">${Loading()}</div></div>`;
  await loadSubjects();
}
function openSubjectLessons(subjectId) {
  const s = window._subjectMap[subjectId];
  lessons(subjectId, s?.name || "Subject");
}

async function loadSubjects() {
  try {
    const data = await apiFetch("GET", "/subjects");
    if (!data?.length) {
      document.getElementById("subjects-list").innerHTML = Empty(
        "📚",
        "No subjects yet",
        'Click "+ New Subject" to add one.',
      );
      return;
    }
    window._subjectMap = {};
    data.forEach((s) => {
      window._subjectMap[s.id] = s;
    });
    document.getElementById("subjects-list").innerHTML =
      `<div class="card" style="overflow:hidden;"><table class="data-table"><thead><tr><th>Subject</th><th>Description</th><th>Status</th><th style="text-align:right;">Actions</th></tr></thead><tbody>
      ${data
        .map((subject) => {
          const style = getSubjectStyle(subject.name);
          const isActive = subject.active !== false;
          return `<tr><td><div style="display:flex;align-items:center;gap:10px;"><div style="width:36px;height:36px;border-radius:10px;background:${style.pale};display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">${style.icon}</div><div><div style="font-weight:700;color:var(--text-900);">${subject.name}</div><div style="font-size:12px;color:${style.color};font-weight:600;">ID: ${subject.id}</div></div></div></td>
          <td style="color:var(--text-400);max-width:260px;" class="truncate">${subject.description || "—"}</td>
          <td><span class="badge ${isActive ? "badge-green" : "badge-gray"}">${isActive ? "Active" : "Inactive"}</span></td>
          <td style="text-align:right;"><div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;">
            <button class="btn btn-ghost btn-sm" onclick="openSubjectLessons(${subject.id})">Lessons</button>
            <button class="btn btn-sm" style="background:var(--bg);color:var(--text-500);" onclick="openEditSubject(${subject.id})">Edit</button>
            ${isActive ? `<button class="btn btn-sm btn-danger" onclick="deactivateSubject(${subject.id})">Deactivate</button>` : `<button class="btn btn-sm" style="background:#ECFDF5;color:#047857;" onclick="activateSubject(${subject.id})">Activate</button>`}
          </div></td></tr>`;
        })
        .join("")}
    </tbody></table></div>`;
  } catch (e) {
    document.getElementById("subjects-list").innerHTML =
      `<div style="color:var(--accent-red);padding:20px;">⚠️ ${e.message}</div>`;
  }
}

function openCreateSubject() {
  openModal(`<div class="modal-header"><div class="modal-title">📚 New Subject</div><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div id="sub-err" style="display:none;background:#FEE2E2;color:#991B1B;font-size:13px;font-weight:700;padding:10px 14px;border-radius:var(--radius-sm);margin-bottom:14px;"></div>
    <div class="field"><label>Subject Name</label><input id="sub-name" class="bibo-input" placeholder="e.g. Mathematics" /></div>
    <div class="field"><label>Description</label><textarea id="sub-desc" class="bibo-input" placeholder="Short description"></textarea></div>
    <div style="display:flex;gap:10px;margin-top:8px;"><button class="btn btn-ghost" style="flex:1;" onclick="closeModal()">Cancel</button><button class="btn btn-primary" style="flex:1;" id="sub-btn" onclick="submitCreateSubject()">Create Subject</button></div>`);
}
async function submitCreateSubject() {
  const name = document.getElementById("sub-name").value.trim(),
    description = document.getElementById("sub-desc").value.trim(),
    errEl = document.getElementById("sub-err"),
    btn = document.getElementById("sub-btn");
  if (!name) {
    errEl.textContent = "Subject name is required.";
    errEl.style.display = "";
    return;
  }
  btn.disabled = true;
  btn.textContent = "Creating...";
  try {
    await apiFetch("POST", "/subjects", { name, description });
    closeModal();
    showToast("Subject created!", "📚");
    await loadSubjects();
  } catch (e) {
    errEl.textContent = e.message;
    errEl.style.display = "";
    btn.disabled = false;
    btn.textContent = "Create Subject";
  }
}
function openEditSubject(subjectId) {
  const subject = window._subjectMap[subjectId];
  if (!subject) {
    showToast("Subject not found.", "⚠️");
    return;
  }
  const safeName = (subject.name || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
  const safeDesc = (subject.description || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;");
  openModal(`<div class="modal-header"><div class="modal-title">✏️ Edit Subject</div><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div id="esub-err" style="display:none;background:#FEE2E2;color:#991B1B;font-size:13px;font-weight:700;padding:10px 14px;border-radius:var(--radius-sm);margin-bottom:14px;"></div>
    <div class="field"><label>Subject Name</label><input id="esub-name" class="bibo-input" value="${safeName}" /></div>
    <div class="field"><label>Description</label><textarea id="esub-desc" class="bibo-input">${safeDesc}</textarea></div>
    <div style="display:flex;gap:10px;margin-top:8px;"><button class="btn btn-ghost" style="flex:1;" onclick="closeModal()">Cancel</button><button class="btn btn-primary" style="flex:1;" id="esub-btn" onclick="submitEditSubject(${subject.id})">Save Changes</button></div>`);
}
async function submitEditSubject(id) {
  const name = document.getElementById("esub-name").value.trim(),
    description = document.getElementById("esub-desc").value.trim(),
    errEl = document.getElementById("esub-err"),
    btn = document.getElementById("esub-btn");
  if (!name) {
    errEl.textContent = "Subject name is required.";
    errEl.style.display = "";
    return;
  }
  btn.disabled = true;
  btn.textContent = "Saving...";
  try {
    await apiFetch("PUT", `/subjects/${id}`, { name, description });
    closeModal();
    showToast("Subject updated!", "✏️");
    await loadSubjects();
  } catch (e) {
    errEl.textContent = e.message;
    errEl.style.display = "";
    btn.disabled = false;
    btn.textContent = "Save Changes";
  }
}
async function deactivateSubject(id) {
  if (!confirm("Deactivate this subject?")) return;
  try {
    await apiFetch("PATCH", `/subjects/${id}/deactivate`);
    showToast("Subject deactivated.", "🛑");
    await loadSubjects();
  } catch (e) {
    showToast(e.message, "⚠️");
  }
}
async function activateSubject(id) {
  if (!confirm("Activate this subject?")) return;
  try {
    await apiFetch("PATCH", `/subjects/${id}/activate`);
    showToast("Subject activated.", "✅");
    await loadSubjects();
  } catch (e) {
    showToast(e.message, "⚠️");
  }
}

// ── LESSONS ───────────────────────────────────────────────────
async function lessons(subjectId = null, subjectName = null) {
  document.getElementById("page-container").innerHTML =
    `<div class="page">${PageHeader(subjectName ? `Lessons • ${subjectName}` : "Lessons", subjectName ? `Manage lessons for ${subjectName}` : "Create and manage all lessons", "+ New Lesson", "openCreateLesson()")}<div id="lessons-list">${Loading()}</div></div>`;
  await loadLessons(subjectId, subjectName);
}

async function loadLessons(subjectId = null, subjectName = null) {
  try {
    let all = [];
    if (subjectId) {
      const ls = await apiFetch("GET", `/lessons/subject/${subjectId}`);
      all = (ls || []).map((l) => ({
        ...l,
        subjectName: subjectName || l.subjectName || "—",
      }));
    } else {
      const subs = await apiFetch("GET", "/subjects");
      if (!subs?.length) {
        document.getElementById("lessons-list").innerHTML = Empty(
          "📝",
          "No subjects yet",
          "Create a subject first.",
        );
        return;
      }
      await Promise.all(
        subs.map(async (s) => {
          try {
            const ls = await apiFetch("GET", `/lessons/subject/${s.id}`);
            if (ls?.length)
              all.push(...ls.map((l) => ({ ...l, subjectName: s.name })));
          } catch (e) {}
        }),
      );
    }
    if (!all.length) {
      document.getElementById("lessons-list").innerHTML = Empty(
        "📝",
        "No lessons yet",
        'Click "+ New Lesson" to add one.',
      );
      return;
    }
    window._lessonMap = {};
    all.forEach((l) => {
      window._lessonMap[l.id] = l;
    });
    const diffClass = {
      EASY: "badge-green",
      MEDIUM: "badge-orange",
      HARD: "badge-red",
    };
    document.getElementById("lessons-list").innerHTML =
      `<div class="card" style="overflow:hidden;"><table class="data-table"><thead><tr><th>Lesson</th><th>Subject</th><th>Difficulty</th><th>Duration</th><th>Status</th><th style="text-align:right;">Actions</th></tr></thead><tbody>
      ${all
        .map((l) => {
          const st = getSubjectStyle(l.subjectName);
          const difficulty = l.learningLevel || l.difficultyLevel || "Beginner";
          const diffKey = difficulty.toUpperCase();
          return `<tr><td><div style="font-weight:700;color:var(--text-900);">${l.title}</div><div style="font-size:12px;color:var(--text-400);margin-top:2px;">${l.description || "—"}</div></td>
          <td><span style="display:inline-flex;align-items:center;gap:6px;"><span style="font-size:15px;">${st.icon}</span><span style="font-size:13px;font-weight:600;color:${st.color};">${l.subjectName}</span></span></td>
          <td><span class="badge ${diffClass[diffKey] || "badge-gray"}">${difficulty}</span></td>
          <td style="font-size:13px;color:var(--text-400);">${l.estimatedMinutes ? l.estimatedMinutes + " min" : "—"}</td>
          <td><span class="badge ${l.published ? "badge-green" : "badge-orange"}">${l.published ? "Published" : "Draft"}</span></td>
          <td style="text-align:right;"><div style="display:flex;gap:8px;justify-content:flex-end;">
            <button class="btn btn-sm" style="background:${l.published ? "#FEF3C7" : "#ECFDF5"};color:${l.published ? "#92400E" : "#047857"};" onclick="togglePublish(${l.id}, ${!l.published})">${l.published ? "Unpublish" : "Publish"}</button>
            <button class="btn btn-ghost btn-sm" onclick="navigate('sections')">Sections</button>
            <button class="btn btn-sm" style="background:var(--bg);color:var(--text-500);" onclick="openEditLesson(${l.id})">Edit</button>
            <button class="btn btn-sm" style="background:#FEF2F2;color:#B91C1C;" data-title="${esc(l.title)}" onclick="deleteLesson(${l.id}, this.dataset.title)">Delete</button>
          </div></td></tr>`;
        })
        .join("")}
    </tbody></table></div>`;
  } catch (e) {
    document.getElementById("lessons-list").innerHTML =
      `<div style="color:var(--accent-red);padding:20px;">⚠️ ${e.message}</div>`;
  }
}

// DELETE /lessons/{id}: 409 means students already used it → offer Unpublish (or force, admins only)
async function deleteLesson(id, title) {
  if (!confirm(`Delete "${title}"?\n\nThis also removes its sections, quizzes, and uploaded images. This cannot be undone.`)) return;

  const send = (force) =>
    fetch(`${API}/lessons/${id}${force ? "?force=true" : ""}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });

  try {
    let res = await send(false);
    if (res.status === 401) return logout();

    if (res.status === 409) {
      const { message } = await res.json().catch(() => ({}));
      if (!isAdmin) {
        showToast(message || "This lesson has student activity. Unpublish it instead.", "⚠️");
        return;
      }
      const force = confirm(
        `${message || "This lesson has student activity."}\n\n` +
          `Delete anyway? Students' progress and quiz attempts for this lesson will be permanently erased.`,
      );
      if (!force) return;
      res = await send(true);
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || `Delete failed (HTTP ${res.status})`);
    }
    showToast("Lesson deleted", "🗑️");
    await loadLessons();
  } catch (e) {
    showToast(e.message, "⚠️");
  }
}

async function togglePublish(id, publish) {
  try {
    await apiFetch("PATCH", `/lessons/${id}/${publish ? "publish" : "unpublish"}`);
    showToast(publish ? "Lesson published!" : "Lesson unpublished.", publish ? "🚀" : "📝");
    await loadLessons();
  } catch (e) {
    showToast(e.message, "⚠️");
  }
}

async function openCreateLesson() {
  let opts = '<option value="">Select subject...</option>';
  try {
    const subs = await apiFetch("GET", "/subjects");
    opts += (subs || [])
      .map((s) => `<option value="${s.id}">${s.name}</option>`)
      .join("");
  } catch (e) {}
  openModal(`<div class="modal-header"><div class="modal-title">📝 New Lesson</div><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div id="les-err" style="display:none;background:#FEE2E2;color:#991B1B;font-size:13px;font-weight:700;padding:10px 14px;border-radius:var(--radius-sm);margin-bottom:14px;"></div>
    <div class="field"><label>Subject</label><select id="les-subject" class="bibo-input">${opts}</select></div>
    <div class="field"><label>Lesson Title</label><input id="les-title" class="bibo-input" placeholder="e.g. Introduction to Fractions" /></div>
    <div class="field"><label>Description</label><textarea id="les-desc" class="bibo-input" placeholder="What will students learn?"></textarea></div>
    <div class="field-row"><div class="field" style="margin-bottom:0;"><label>Minutes</label><input id="les-minutes" class="bibo-input" type="number" placeholder="30" /></div><div class="field" style="margin-bottom:0;"><label>Difficulty</label><select id="les-diff" class="bibo-input"><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option></select></div></div>
    <div style="display:flex;gap:10px;margin-top:18px;"><button class="btn btn-ghost" style="flex:1;" onclick="closeModal()">Cancel</button><button class="btn btn-primary" style="flex:1;" id="les-btn" onclick="submitLesson()">Create Lesson</button></div>`);
}

async function submitLesson() {
  const subjectId = document.getElementById("les-subject").value,
    title = document.getElementById("les-title").value.trim(),
    desc = document.getElementById("les-desc").value.trim(),
    minutes = parseInt(document.getElementById("les-minutes").value) || null,
    diff = document.getElementById("les-diff").value,
    errEl = document.getElementById("les-err");
  if (!subjectId) {
    errEl.textContent = "Select a subject.";
    errEl.style.display = "";
    return;
  }
  if (!title) {
    errEl.textContent = "Lesson title required.";
    errEl.style.display = "";
    return;
  }
  const btn = document.getElementById("les-btn");
  btn.disabled = true;
  btn.textContent = "Creating...";
  try {
    await apiFetch("POST", "/lessons", {
      subjectId: parseInt(subjectId),
      title,
      description: desc,
      estimatedMinutes: minutes,
      learningLevel: diff,
      published: true,
    });
    closeModal();
    showToast("Lesson created!", "📝");
    await loadLessons();
  } catch (e) {
    errEl.textContent = e.message;
    errEl.style.display = "";
    btn.disabled = false;
    btn.textContent = "Create Lesson";
  }
}

function openEditLesson(lessonId) {
  const l = window._lessonMap[lessonId];
  if (!l) {
    showToast("Lesson not found.", "⚠️");
    return;
  }
  const safeTitle = (l.title || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;");
  const safeDesc = (l.description || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;");
  openModal(`<div class="modal-header"><div class="modal-title">✏️ Edit Lesson</div><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div id="eles-err" style="display:none;background:#FEE2E2;color:#991B1B;font-size:13px;font-weight:700;padding:10px 14px;border-radius:var(--radius-sm);margin-bottom:14px;"></div>
    <div class="field"><label>Lesson Title</label><input id="eles-title" class="bibo-input" value="${safeTitle}" /></div>
    <div class="field"><label>Description</label><textarea id="eles-desc" class="bibo-input">${safeDesc}</textarea></div>
    <div class="field-row"><div class="field" style="margin-bottom:0;"><label>Minutes</label><input id="eles-minutes" class="bibo-input" type="number" value="${l.estimatedMinutes || ""}" /></div><div class="field" style="margin-bottom:0;"><label>Difficulty</label><select id="eles-diff" class="bibo-input">${["EASY", "MEDIUM", "HARD"].map((d) => `<option value="${d}"${l.learningLevel === d ? " selected" : ""}>${d}</option>`).join("")}</select></div></div>
    <div style="display:flex;gap:10px;margin-top:18px;"><button class="btn btn-ghost" style="flex:1;" onclick="closeModal()">Cancel</button><button class="btn btn-primary" style="flex:1;" id="eles-btn" onclick="submitEditLesson(${l.id})">Save Changes</button></div>`);
}

async function submitEditLesson(id) {
  const title = document.getElementById("eles-title").value.trim(),
    desc = document.getElementById("eles-desc").value.trim(),
    minutes = parseInt(document.getElementById("eles-minutes").value) || null,
    diff = document.getElementById("eles-diff").value,
    errEl = document.getElementById("eles-err");
  if (!title) {
    errEl.textContent = "Title required.";
    errEl.style.display = "";
    return;
  }
  const btn = document.getElementById("eles-btn");
  btn.disabled = true;
  btn.textContent = "Saving...";
  try {
    await apiFetch("PUT", `/lessons/${id}`, {
      title,
      description: desc,
      estimatedMinutes: minutes,
      learningLevel: diff,
    });
    closeModal();
    showToast("Lesson updated!", "✏️");
    await loadLessons();
  } catch (e) {
    errEl.textContent = e.message;
    errEl.style.display = "";
    btn.disabled = false;
    btn.textContent = "Save Changes";
  }
}

// ── SECTIONS ──────────────────────────────────────────────────
async function sections() {
  document.getElementById("page-container").innerHTML =
    `<div class="page">${PageHeader("Lesson Sections", "Add content blocks to lessons", "+ New Section", "openCreateSection()")}
    <div class="card" style="padding:20px;background:var(--primary-light);border-color:#dde2ff;margin-bottom:24px;"><div style="display:flex;align-items:flex-start;gap:12px;"><span style="font-size:22px;">💡</span><div><p style="font-weight:700;color:var(--primary);margin-bottom:4px;">How Sections Work</p><p style="font-size:13px;color:var(--text-500);">Each section is a content block inside a lesson. Add sections in order — they appear sequentially to students.</p></div></div></div>
    <div class="field" style="margin-bottom:18px;"><label>Select Lesson</label><select id="sections-lesson-filter" class="bibo-input"><option value="">Select lesson</option></select></div>
    <div id="sections-content">${Empty("📄", "Select a lesson", "Choose a lesson to view its sections.")}</div>
  </div>`;
  const select = document.getElementById("sections-lesson-filter");
  let options = '<option value="">Select lesson</option>';
  try {
    const subs = await apiFetch("GET", "/subjects");
    for (const s of subs || []) {
      try {
        const ls = await apiFetch("GET", `/lessons/subject/${s.id}`);
        if (ls?.length) {
          options += `<optgroup label="${s.name}">`;
          options += ls
            .map((l) => `<option value="${l.id}">${l.title}</option>`)
            .join("");
          options += `</optgroup>`;
        }
      } catch (e) {}
    }
    select.innerHTML = options;
    select.addEventListener("change", async function () {
      const lessonId = parseInt(this.value);
      if (!lessonId) {
        document.getElementById("sections-content").innerHTML = Empty(
          "📄",
          "Select a lesson",
          "Choose a lesson to view its sections.",
        );
        return;
      }
      await loadSections(lessonId);
    });
  } catch (e) {
    document.getElementById("sections-content").innerHTML =
      `<div style="color:var(--accent-red);padding:16px;">⚠️ ${e.message}</div>`;
  }
}

async function openCreateSection() {
  let opts = '<option value="">Select lesson...</option>';
  try {
    const subs = await apiFetch("GET", "/subjects");
    for (const s of subs || []) {
      try {
        const ls = await apiFetch("GET", `/lessons/subject/${s.id}`);
        if (ls?.length) {
          opts += `<optgroup label="${s.name}">`;
          opts += ls
            .map((l) => `<option value="${l.id}">${l.title}</option>`)
            .join("");
          opts += `</optgroup>`;
        }
      } catch (e) {}
    }
  } catch (e) {}
  openModal(`<div class="modal-header"><div class="modal-title">📄 New Section</div><button class="modal-close" onclick="closeModal()">✕</button></div>
    <div id="sec-err" style="display:none;background:#FEE2E2;color:#991B1B;font-size:13px;font-weight:700;padding:10px 14px;border-radius:var(--radius-sm);margin-bottom:14px;"></div>
    <div class="field"><label>Lesson</label><select id="sec-lesson" class="bibo-input">${opts}</select></div>
    <div class="field"><label>Section Title</label><input id="sec-title" class="bibo-input" placeholder="e.g. What are Fractions?" /></div>
    <div class="field-row"><div class="field" style="margin-bottom:0;"><label>Content Type</label><select id="sec-type" class="bibo-input" onchange="onSectionTypeChange(this.value)"><option value="TEXT">Text</option><option value="IMAGE">Image</option><option value="VIDEO">Video</option><option value="ACTIVITY">Activity</option></select></div><div class="field" style="margin-bottom:0;"><label>Order</label><input id="sec-order" class="bibo-input" type="number" placeholder="Auto (last)" min="1" /></div></div>
    <div class="field" id="sec-content-field" style="margin-top:14px;"><label id="sec-content-label">Content</label><textarea id="sec-content" class="bibo-input" placeholder="Write lesson content here..." style="min-height:120px;" oninput="if (document.getElementById('sec-type').value === 'VIDEO') previewSectionVideo()"></textarea><div id="sec-video-preview"></div></div>
    <div class="field" id="sec-image-field" style="display:none;margin-top:14px;">
      <label>Image</label>
      <input id="sec-image" class="bibo-input" type="file" accept="image/png,image/jpeg,image/gif,image/webp" onchange="previewSectionImage(this)" />
      <p style="font-size:12px;color:var(--text-400);margin-top:6px;">PNG, JPG, GIF, or WEBP · max 5 MB</p>
      <img id="sec-image-preview" alt="" style="display:none;width:100%;max-height:220px;object-fit:contain;margin-top:10px;border-radius:var(--radius-sm);background:var(--bg);" />
    </div>
    <div style="display:flex;gap:10px;margin-top:18px;"><button class="btn btn-ghost" style="flex:1;" onclick="closeModal()">Cancel</button><button class="btn btn-primary" style="flex:1;" id="sec-btn" onclick="submitSection()">Add Section</button></div>`);
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// YouTube id from watch / youtu.be / shorts / embed / live links (any extra params)
function youtubeId(url) {
  const m = (url || "").match(/(?:youtube(?:-nocookie)?\.com\/(?:[^#]*[?&]v=|shorts\/|embed\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}
const isDirectVideo = (url) => /^https?:\/\/\S+\.(mp4|webm|ogg)(\?\S*)?$/i.test(url || "");

function videoEmbedHtml(url) {
  const id = youtubeId(url);
  if (id) {
    return `<div style="position:relative;padding-top:56.25%;border-radius:var(--radius-sm);overflow:hidden;background:#000;">
      <iframe src="https://www.youtube-nocookie.com/embed/${id}" style="position:absolute;inset:0;width:100%;height:100%;border:0;"
        allow="encrypted-media; picture-in-picture" allowfullscreen title="Video preview"></iframe></div>`;
  }
  if (isDirectVideo(url)) return `<video src="${esc(url)}" controls preload="metadata" style="width:100%;border-radius:var(--radius-sm);"></video>`;
  return "";
}

function previewSectionVideo() {
  const url = document.getElementById("sec-content").value.trim();
  const box = document.getElementById("sec-video-preview");
  if (!box) return;
  if (!url) {
    box.innerHTML = "";
    return;
  }
  const html = videoEmbedHtml(url);
  box.innerHTML = html
    ? `<p style="font-size:12px;color:var(--accent-green);font-weight:700;margin:8px 0 6px;">✓ Preview — this is what students will see</p>${html}`
    : `<p style="font-size:12px;color:#B45309;font-weight:700;margin-top:8px;">⚠️ Paste a YouTube link (youtube.com/watch?v=…, youtu.be/…, Shorts) or a direct .mp4 link.</p>`;
}

function onSectionTypeChange(type) {
  const isImage = type === "IMAGE";
  document.getElementById("sec-image-field").style.display = isImage ? "" : "none";
  document.getElementById("sec-content-field").style.display = isImage ? "none" : "";
  document.getElementById("sec-content-label").textContent = type === "VIDEO" ? "Video URL" : "Content";
  document.getElementById("sec-content").style.minHeight = type === "VIDEO" ? "48px" : "120px";
  if (type === "VIDEO") previewSectionVideo();
  else document.getElementById("sec-video-preview").innerHTML = "";
  document.getElementById("sec-content").placeholder =
    {
      VIDEO: "Paste a YouTube link, e.g. https://youtu.be/abc123XYZ00",
      ACTIVITY: "Describe the activity or instructions...",
    }[type] || "Write lesson content here...";
}

function previewSectionImage(input) {
  const img = document.getElementById("sec-image-preview");
  const file = input.files?.[0];
  if (!file) {
    img.style.display = "none";
    return;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    showToast("Image is too large (max 5 MB)", "⚠️");
    input.value = "";
    img.style.display = "none";
    return;
  }
  if (img.src.startsWith("blob:")) URL.revokeObjectURL(img.src);
  img.src = URL.createObjectURL(file);
  img.style.display = "";
}

// Multipart upload: let the browser set the multipart boundary (no Content-Type header).
async function uploadImage(file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API}/uploads/images`, {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
    body: form,
  });
  if (res.status === 401) {
    logout();
    throw new Error("Session expired");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || `Upload failed (HTTP ${res.status})`);
  return data.url;
}

async function submitSection() {
  const lessonId = parseInt(document.getElementById("sec-lesson").value),
    title = document.getElementById("sec-title").value.trim(),
    textContent = document.getElementById("sec-content").value.trim(),
    type = document.getElementById("sec-type").value,
    order = parseInt(document.getElementById("sec-order").value) || null, // blank → server puts it last
    imageFile = document.getElementById("sec-image")?.files?.[0],
    errEl = document.getElementById("sec-err"),
    btn = document.getElementById("sec-btn");
  errEl.style.display = "none";
  if (!lessonId) {
    errEl.textContent = "Select a lesson.";
    errEl.style.display = "";
    return;
  }
  if (!title) {
    errEl.textContent = "Section title required.";
    errEl.style.display = "";
    return;
  }
  if (type === "IMAGE" && !imageFile) {
    errEl.textContent = "Choose an image to upload.";
    errEl.style.display = "";
    return;
  }
  btn.disabled = true;
  try {
    let content = textContent;
    if (type === "VIDEO") {
      const id = youtubeId(textContent);
      if (!id && !isDirectVideo(textContent)) {
        throw new Error("Paste a YouTube link or a direct .mp4 video link.");
      }
      // store a clean canonical link (drops tracking params / timestamps)
      if (id) content = `https://www.youtube.com/watch?v=${id}`;
    }
    if (type === "IMAGE") {
      btn.textContent = "Uploading image...";
      content = await uploadImage(imageFile);
    }
    btn.textContent = "Adding...";
    await apiFetch("POST", "/lesson-sections", {
      lessonId,
      title,
      content,
      contentType: type,
      contentOrder: order,
    });
    closeModal();
    showToast("Section added!", "📄");
    await loadSections(lessonId);
  } catch (e) {
    errEl.textContent = e.message;
    errEl.style.display = "";
    btn.disabled = false;
    btn.textContent = "Add Section";
  }
}

// ── Section list: drag-and-drop or ↑/↓ to reorder, delete per row ──
let _sections = [];
let _sectionsLessonId = null;
let _dragIndex = null;

async function loadSections(lessonId) {
  const container = document.getElementById("sections-content");
  if (!container || !lessonId) return;
  container.innerHTML = Loading();
  try {
    _sections = (await apiFetch("GET", `/lesson-sections/lesson/${lessonId}`)) || [];
    _sectionsLessonId = lessonId;
    renderSectionsTable();
  } catch (e) {
    container.innerHTML = `<div style="color:var(--accent-red);padding:16px;">⚠️ ${esc(e.message)}</div>`;
  }
}

function sectionContentCell(s) {
  const vid = s.contentType === "VIDEO" ? youtubeId(s.content) : null;
  if (vid) {
    return `<a href="${esc(s.content)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:10px;text-decoration:none;color:inherit;">
      <img src="https://img.youtube.com/vi/${vid}/mqdefault.jpg" alt="" style="height:56px;width:100px;object-fit:cover;border-radius:6px;" />
      <span style="font-size:12px;font-weight:700;color:var(--primary);">▶ YouTube</span></a>`;
  }
  return s.contentType === "IMAGE" && /^(https?:\/\/|\/uploads\/)/.test(s.content || "")
    ? `<img src="${esc(s.content)}" alt="" style="height:56px;max-width:120px;object-fit:cover;border-radius:6px;" />`
    : `<div style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">${esc(s.content ?? "—")}</div>`;
}

function renderSectionsTable() {
  const container = document.getElementById("sections-content");
  if (!container) return;
  if (_sections.length === 0) {
    container.innerHTML = Empty("📄", "No sections yet", "Add the first section for this lesson.");
    return;
  }
  const last = _sections.length - 1;
  const arrowBtn = (label, i, delta, disabled) =>
    `<button class="btn btn-ghost btn-sm" style="padding:4px 9px;" aria-label="${label}" title="${label}"
       ${disabled ? "disabled" : ""} onclick="moveSection(${i}, ${delta})">${delta < 0 ? "↑" : "↓"}</button>`;

  container.innerHTML = `
    <p style="font-size:12px;color:var(--text-400);margin-bottom:10px;">Drag rows by ⠿ or use ↑ ↓ to change the order students see.</p>
    <div class="card" style="overflow:hidden;"><table class="data-table">
      <thead><tr><th style="width:40px;"></th><th>Order</th><th>Title</th><th>Type</th><th>Content</th><th style="text-align:right;">Actions</th></tr></thead>
      <tbody id="sections-tbody">
      ${_sections
        .map(
          (s, i) => `<tr draggable="true" data-index="${i}"
              ondragstart="onSectionDragStart(event, ${i})" ondragover="onSectionDragOver(event)"
              ondragleave="this.style.boxShadow=''" ondrop="onSectionDrop(event, ${i})" ondragend="onSectionDragEnd()">
            <td style="cursor:grab;color:var(--text-400);font-size:18px;user-select:none;" title="Drag to reorder">⠿</td>
            <td style="font-weight:700;">${s.contentOrder ?? i + 1}</td>
            <td>${esc(s.title ?? "—")}</td>
            <td><span class="badge badge-gray">${esc(s.contentType ?? "—")}</span></td>
            <td style="max-width:520px;">${sectionContentCell(s)}</td>
            <td style="text-align:right;white-space:nowrap;">
              ${arrowBtn("Move up", i, -1, i === 0)}
              ${arrowBtn("Move down", i, 1, i === last)}
              <button class="btn btn-sm" style="background:#FEF2F2;color:#B91C1C;margin-left:4px;"
                onclick="deleteSection(${s.id})">Delete</button>
            </td>
          </tr>`,
        )
        .join("")}
      </tbody>
    </table></div>`;
}

// Optimistic: show the new order immediately, roll back if the server rejects it.
async function saveSectionOrder(newOrder) {
  const previous = _sections;
  _sections = newOrder.map((s, i) => ({ ...s, contentOrder: i + 1 }));
  renderSectionsTable();
  try {
    _sections = await apiFetch("PUT", `/lesson-sections/lesson/${_sectionsLessonId}/order`, {
      sectionIds: newOrder.map((s) => s.id),
    });
    renderSectionsTable();
    showToast("Order saved", "↕️");
  } catch (e) {
    _sections = previous;
    renderSectionsTable();
    showToast(e.message, "⚠️");
  }
}

function moveSection(index, delta) {
  const target = index + delta;
  if (target < 0 || target >= _sections.length) return;
  const next = [..._sections];
  [next[index], next[target]] = [next[target], next[index]];
  saveSectionOrder(next);
}

function onSectionDragStart(e, index) {
  _dragIndex = index;
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", String(index)); // required by Firefox
  e.currentTarget.style.opacity = "0.4";
}
function onSectionDragOver(e) {
  e.preventDefault(); // allows dropping
  e.dataTransfer.dropEffect = "move";
  e.currentTarget.style.boxShadow = "inset 0 3px 0 var(--primary)";
}
function onSectionDrop(e, index) {
  e.preventDefault();
  e.currentTarget.style.boxShadow = "";
  if (_dragIndex === null || _dragIndex === index) return;
  const next = [..._sections];
  const [moved] = next.splice(_dragIndex, 1);
  next.splice(index, 0, moved);
  _dragIndex = null;
  saveSectionOrder(next);
}
function onSectionDragEnd() {
  _dragIndex = null;
  document.querySelectorAll("#sections-tbody tr").forEach((tr) => {
    tr.style.opacity = "";
    tr.style.boxShadow = "";
  });
}

async function deleteSection(id) {
  const s = _sections.find((x) => x.id === id);
  if (!confirm(`Delete section "${s?.title || "Untitled"}"?\n\nThe remaining sections will be renumbered. This cannot be undone.`)) return;
  try {
    await apiFetch("DELETE", `/lesson-sections/${id}`);
    showToast("Section deleted", "🗑️");
    await loadSections(_sectionsLessonId);
  } catch (e) {
    showToast(e.message, "⚠️");
  }
}

// ── QUIZZES ───────────────────────────────────────────────────
async function quizzes() {
  document.getElementById("page-container").innerHTML =
    `<div class="page">${PageHeader("Quizzes", "Create and manage lesson quizzes", "+ New Quiz", "openCreateQuiz()")}
    <div class="card" style="padding:20px;background:var(--primary-light);border-color:#dde2ff;margin-bottom:24px;"><div style="display:flex;align-items:flex-start;gap:12px;"><span style="font-size:22px;">💡</span><div><p style="font-weight:700;color:var(--primary);margin-bottom:4px;">Quiz Module</p><p style="font-size:13px;color:var(--text-500);">Quizzes are linked to lessons. Add multiple-choice questions with 4 choices each.</p></div></div></div>
    <div id="quizzes-list">${Loading()}</div>
  </div>`;
  try {
    const subs = await apiFetch("GET", "/subjects");
    let all = [];
    for (const s of subs || []) {
      try {
        const ls = await apiFetch("GET", `/lessons/subject/${s.id}`);
        for (const l of ls || []) {
          try {
            const qs = await apiFetch("GET", `/quiz/lesson/${l.id}`);
            if (qs?.length)
              all.push(
                ...qs.map((q) => ({
                  ...q,
                  lessonTitle: l.title,
                  subjectName: s.name,
                })),
              );
          } catch (e) {}
        }
      } catch (e) {}
    }
    if (!all.length) {
      document.getElementById("quizzes-list").innerHTML = Empty(
        "✅",
        "No quizzes yet",
        'Click "+ New Quiz" to create your first quiz.',
      );
      return;
    }
    document.getElementById("quizzes-list").innerHTML =
      `<div class="card" style="overflow:hidden;"><table class="data-table"><thead><tr><th>Quiz Title</th><th>Lesson</th><th>Subject</th><th>Passing Score</th><th>Questions</th><th style="text-align:right;">Actions</th></tr></thead><tbody>
      ${all
        .map((q) => {
          const st = getSubjectStyle(q.subjectName);
          return `<tr><td><div style="font-weight:700;color:var(--text-900);">${esc(q.title)}</div><div style="font-size:12px;color:var(--text-400);">${esc(q.description || "—")}</div></td><td style="font-size:13px;">${esc(q.lessonTitle)}</td><td><span style="display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:600;color:${st.color};">${st.icon} ${q.subjectName}</span></td><td><span class="badge badge-blue">${q.passingScore}%</span></td><td style="font-size:13px;color:var(--text-500);">${q.questions?.length || 0} questions</td><td style="text-align:right;white-space:nowrap;"><button class="btn btn-sm" style="background:var(--bg);color:var(--text-500);" onclick="openEditQuiz(${q.id})">Edit</button> <button class="btn btn-sm" style="background:#FEF2F2;color:#B91C1C;" data-title="${esc(q.title)}" onclick="deleteQuiz(${q.id}, this.dataset.title)">Delete</button></td></tr>`;
        })
        .join("")}
    </tbody></table></div>`;
  } catch (e) {
    document.getElementById("quizzes-list").innerHTML =
      `<div style="color:var(--accent-red);padding:20px;">⚠️ ${e.message}</div>`;
  }
}

let _qCount = 0;
let _editingQuizId = null;

async function lessonOptionsHtml(selectedId = null) {
  let opts = '<option value="">Select lesson...</option>';
  try {
    const subs = await apiFetch("GET", "/subjects");
    for (const s of subs || []) {
      try {
        const ls = await apiFetch("GET", `/lessons/subject/${s.id}`);
        if (ls?.length) {
          opts += `<optgroup label="${esc(s.name)}">`;
          opts += ls
            .map((l) => `<option value="${l.id}" ${l.id === selectedId ? "selected" : ""}>${esc(l.title)}</option>`)
            .join("");
          opts += `</optgroup>`;
        }
      } catch (e) {}
    }
  } catch (e) {}
  return opts;
}

async function openCreateQuiz() {
  await openQuizForm(null);
}

async function openEditQuiz(id) {
  try {
    const quiz = await apiFetch("GET", `/quiz/${id}/edit`);
    await openQuizForm(quiz);
  } catch (e) {
    showToast(e.message, "⚠️");
  }
}

async function openQuizForm(quiz) {
  _qCount = 0;
  _editingQuizId = quiz?.id ?? null;
  const editing = !!quiz;
  const opts = await lessonOptionsHtml(quiz?.lessonId ?? null);
  const takenNote =
    editing && quiz.attemptCount > 0
      ? `<div style="background:#FEF3C7;color:#92400E;font-size:12px;font-weight:600;padding:10px 14px;border-radius:var(--radius-sm);margin-bottom:14px;">
           ⚠️ Students have taken this quiz ${quiz.attemptCount} time${quiz.attemptCount === 1 ? "" : "s"}. Their past scores stay as recorded; changes apply to new attempts.
         </div>`
      : "";
  openModal(
    `<div class="mq-head">
      <div class="modal-title">✅ ${editing ? "Edit Quiz" : "New Quiz"}</div>
      <button class="modal-close" onclick="closeModal()" aria-label="Close">✕</button>
    </div>

    <div class="mq-body">
      ${takenNote}
      <div id="qz-err" class="mq-err" style="display:none;"></div>

      <div class="mq-details">
        <div class="field"><label>Lesson</label><select id="qz-lesson" class="bibo-input">${opts}</select></div>
        <div class="field"><label>Quiz Title</label><input id="qz-title" class="bibo-input" placeholder="e.g. Fractions Quiz" /></div>
        <div class="field"><label>Description</label><input id="qz-desc" class="bibo-input" placeholder="Optional" /></div>
        <div class="field"><label>Passing Score (%)</label><input id="qz-passing" class="bibo-input" type="number" value="75" min="0" max="100" /></div>
      </div>

      <div class="mq-qhead">
        <div>
          <span class="mq-qtitle">Questions</span>
          <span id="qz-count" class="badge badge-blue" style="margin-left:6px;">0</span>
        </div>
        <span class="mq-hint">Click a question to edit · select the radio next to the correct answer</span>
      </div>
      <div id="qz-questions"></div>
      <button class="btn btn-ghost btn-sm mq-add" onclick="addQuestion()">+ Add Question</button>
    </div>

    <div class="mq-foot">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" id="qz-btn" onclick="submitQuiz()">${editing ? "Save Changes" : "Create Quiz"}</button>
    </div>`,
    "modal-quiz",
  );

  if (editing) {
    // .value assignment (not HTML interpolation) so quotes/HTML in saved text are safe
    document.getElementById("qz-title").value = quiz.title || "";
    document.getElementById("qz-desc").value = quiz.description || "";
    document.getElementById("qz-passing").value = quiz.passingScore;
    (quiz.questions || []).forEach((q) => addQuestion(q, { open: false }));
    if (!quiz.questions?.length) addQuestion();
    else openQuestion(document.querySelector("#qz-questions .mq-q").id.replace("qb-", ""));
  } else {
    addQuestion();
  }
}
const CHOICE_KEYS = ["A", "B", "C", "D"];

function addQuestion(prefill = null, { open = true } = {}) {
  _qCount++;
  const n = _qCount;
  const el = document.createElement("div");
  el.id = `qb-${n}`;
  el.className = "mq-q";
  el.innerHTML = `
    <div class="mq-q-summary" onclick="toggleQuestion(${n})">
      <span class="mq-q-num"></span>
      <span class="mq-q-text" id="qs-text-${n}"></span>
      <span class="mq-q-answer" id="qs-ans-${n}"></span>
      <button type="button" class="mq-q-remove" title="Remove question"
        onclick="event.stopPropagation(); removeQuestion(${n})">✕</button>
      <span class="mq-q-chevron">▾</span>
    </div>
    <div class="mq-q-body">
      <input class="bibo-input" id="qt-${n}" placeholder="Enter question text..." oninput="updateQuestionSummary(${n})" />
      <div class="mq-choices">
        ${CHOICE_KEYS.map(
          (k, i) => `<label class="mq-choice" for="ch-${n}-${i}">
            <input type="radio" name="cr-${n}" value="${i}" id="r-${n}-${i}" onchange="updateQuestionSummary(${n})" />
            <span class="mq-choice-key">${k}</span>
            <input class="bibo-input" id="ch-${n}-${i}" placeholder="Choice ${k}..." oninput="updateQuestionSummary(${n})" />
          </label>`,
        ).join("")}
      </div>
    </div>`;
  document.getElementById("qz-questions").appendChild(el);

  if (prefill) {
    document.getElementById(`qt-${n}`).value = prefill.questionText || "";
    (prefill.choices || []).slice(0, 4).forEach((c, i) => {
      document.getElementById(`ch-${n}-${i}`).value = c.choiceText || "";
      if (c.correct) document.getElementById(`r-${n}-${i}`).checked = true;
    });
  }
  updateQuestionSummary(n);
  renumberQuestions();
  if (open) {
    openQuestion(n);
    if (!prefill) document.getElementById(`qt-${n}`).focus();
  }
}

// Only one question open at a time keeps the modal short.
function openQuestion(n) {
  document.querySelectorAll("#qz-questions .mq-q").forEach((q) => q.classList.toggle("open", q.id === `qb-${n}`));
  document.getElementById(`qb-${n}`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function toggleQuestion(n) {
  const el = document.getElementById(`qb-${n}`);
  if (el.classList.contains("open")) el.classList.remove("open");
  else openQuestion(n);
}

function removeQuestion(n) {
  const blocks = document.querySelectorAll("#qz-questions .mq-q");
  if (blocks.length <= 1) {
    showToast("A quiz needs at least one question", "⚠️");
    return;
  }
  document.getElementById(`qb-${n}`).remove();
  renumberQuestions();
}

function renumberQuestions() {
  const blocks = document.querySelectorAll("#qz-questions .mq-q");
  blocks.forEach((b, i) => (b.querySelector(".mq-q-num").textContent = `Q${i + 1}`));
  const count = document.getElementById("qz-count");
  if (count) count.textContent = blocks.length;
}

function updateQuestionSummary(n) {
  const text = document.getElementById(`qt-${n}`)?.value.trim();
  const checked = document.querySelector(`input[name="cr-${n}"]:checked`);
  const filled = CHOICE_KEYS.filter((_, i) => document.getElementById(`ch-${n}-${i}`)?.value.trim()).length;
  const textEl = document.getElementById(`qs-text-${n}`);
  const ansEl = document.getElementById(`qs-ans-${n}`);
  textEl.textContent = text || "New question";
  textEl.classList.toggle("muted", !text);
  if (checked && filled === 4 && text) {
    ansEl.textContent = `✓ ${CHOICE_KEYS[+checked.value]}`;
    ansEl.className = "mq-q-answer ok";
  } else {
    ansEl.textContent = !checked ? "No answer" : `${filled}/4 choices`;
    ansEl.className = "mq-q-answer warn";
  }
}
async function deleteQuiz(id, title) {
  if (!confirm(`Delete quiz "${title}"?\n\nIts questions and choices will be removed. This cannot be undone.`)) return;
  const send = (force) =>
    fetch(`${API}/quiz/${id}${force ? "?force=true" : ""}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });
  try {
    let res = await send(false);
    if (res.status === 401) return logout();
    if (res.status === 409) {
      const { message } = await res.json().catch(() => ({}));
      if (!isAdmin) {
        showToast(message || "Students already took this quiz.", "⚠️");
        return;
      }
      if (!confirm(`${message}\n\nDelete anyway? Those quiz scores will be permanently erased.`)) return;
      res = await send(true);
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || `Delete failed (HTTP ${res.status})`);
    }
    showToast("Quiz deleted", "🗑️");
    await quizzes();
  } catch (e) {
    showToast(e.message, "⚠️");
  }
}

async function submitQuiz() {
  const lessonId = document.getElementById("qz-lesson").value,
    title = document.getElementById("qz-title").value.trim(),
    desc = document.getElementById("qz-desc").value.trim(),
    passingRaw = parseInt(document.getElementById("qz-passing").value, 10),
    passingScore = Number.isNaN(passingRaw) ? 75 : passingRaw, // 0 is a valid score
    errEl = document.getElementById("qz-err");
  if (!lessonId) {
    errEl.textContent = "Select a lesson.";
    errEl.style.display = "";
    return;
  }
  if (!title) {
    errEl.textContent = "Quiz title required.";
    errEl.style.display = "";
    return;
  }
  const questions = [];
  const blocks = document.querySelectorAll("#qz-questions .mq-q");
  const fail = (msg, n) => {
    errEl.textContent = msg;
    errEl.style.display = "";
    if (n) openQuestion(n);
    errEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };
  for (const [pos, block] of [...blocks].entries()) {
    const n = block.id.replace("qb-", "");
    const label = `Question ${pos + 1}`;
    const qt = document.getElementById(`qt-${n}`)?.value.trim();
    if (!qt) return fail(`${label}: question text is required.`, n);
    const correct = block.querySelector(`input[name="cr-${n}"]:checked`);
    if (!correct) return fail(`${label}: select the correct answer.`, n);
    const correctIdx = parseInt(correct.value);
    const choices = [0, 1, 2, 3].map((i) => {
      const t = document.getElementById(`ch-${n}-${i}`)?.value.trim();
      if (!t) return null;
      return { choiceText: t, correct: i === correctIdx };
    });
    if (choices.some((c) => !c)) return fail(`${label}: all 4 choices are required.`, n);
    questions.push({ questionText: qt, choices });
  }
  if (!questions.length) {
    errEl.textContent = "Add at least one question.";
    errEl.style.display = "";
    return;
  }
  const btn = document.getElementById("qz-btn");
  const editing = _editingQuizId !== null;
  const idleLabel = editing ? "Save Changes" : "Create Quiz";
  btn.disabled = true;
  btn.textContent = editing ? "Saving..." : "Creating...";
  try {
    const body = { lessonId: parseInt(lessonId), title, description: desc, passingScore, questions };
    if (editing) await apiFetch("PUT", `/quiz/${_editingQuizId}`, body);
    else await apiFetch("POST", "/quiz/create", body);
    closeModal();
    showToast(editing ? "Quiz updated!" : "Quiz created!", "✅");
    _editingQuizId = null;
    await quizzes();
  } catch (e) {
    errEl.textContent = e.message;
    errEl.style.display = "";
    btn.disabled = false;
    btn.textContent = idleLabel;
  }
}

// ── Keyboard shortcuts ───────────────────────────────────────
document.addEventListener("keydown", (e) => {
  const input = document.getElementById("account-search");
  if (e.key === "/" && input && document.activeElement !== input && !e.target.closest("input, textarea, select")) {
    e.preventDefault();
    input.focus();
  }
});

// ── Init ─────────────────────────────────────────────────────
navigate(isAdmin ? "admin-dashboard" : "teacher-dashboard");