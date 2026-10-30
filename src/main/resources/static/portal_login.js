const API_BASE = "/api";

const PORTALS = {
  ADMIN: { name: "Admin Portal", url: "/admin" },
  TEACHER: { name: "Teacher Portal", url: "/teacher" },
  PARENT: { name: "Parent Portal", url: "/parent" },
  STUDENT: { name: "Student App", url: "/" },
};

const cfg = document.body.dataset;
const allowedRole = (cfg.role || "").toUpperCase();

async function login(username, password) {
  const res = await fetch(API_BASE + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || data.error || "Login failed");
  return data;
}

function setMessage(el, text, type = "") {
  el.className = "msg " + type;
  el.innerHTML = "";
  el.textContent = text;
}

function wrongPortalMessage(el, role) {
  const right = PORTALS[role];
  el.className = "msg error";
  el.textContent = `This is the ${PORTALS[allowedRole].name}. `;
  if (right) {
    const a = document.createElement("a");
    a.href = right.url;
    a.textContent = `Sign in at the ${right.name} →`;
    a.style.fontWeight = "800";
    a.style.color = "inherit";
    el.appendChild(a);
  }
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = document.getElementById("loginBtn");
  const msg = document.getElementById("loginMessage");
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  setMessage(msg, "Signing in...", "info");
  btn.disabled = true;

  try {
    const result = await login(username, password);
    const token = result.accessToken || result.token;
    if (!token) throw new Error("No token received from server.");

    const role = String(result.role || "").toUpperCase();
    if (role !== allowedRole) {
      wrongPortalMessage(msg, role);
      return;
    }

    const user = { username: result.username, role };
    localStorage.setItem(cfg.tokenKey, token);
    localStorage.setItem(cfg.userKey, JSON.stringify(user));
    localStorage.setItem("bibo_login_page", PORTALS[allowedRole].url);

    setMessage(msg, "Login successful. Redirecting...", "success");
    setTimeout(() => (window.location.href = cfg.redirect), 500);
  } catch (err) {
    setMessage(msg, err.message || "Login failed.", "error");
  } finally {
    btn.disabled = false;
  }
});
