const API_BASE = "http://localhost:8080/api";

async function request(method, path, body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = "Bearer " + token;

  const response = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
}

function setMessage(el, text, type = "") {
  el.className = "msg " + type;
  el.textContent = text;
}

// --- LOGIN ---
// Calls: POST /api/auth/login
// Body:  { username, password }
document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const loginBtn = document.getElementById("loginBtn");
    const msg = document.getElementById("loginMessage");

    setMessage(msg, "Signing in...", "info");
    loginBtn.disabled = true;

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    try {
      const result = await request("POST", "/auth/login", {
        username,
        password,
      });

      const token = result.token || result.accessToken;
      if (!token) throw new Error("No token received from server.");

      // Check role — only allow ADMIN
      const user = result.user || result;
      const roleName = String(
        user?.role?.name || user?.roleName || user?.role || "",
      ).toUpperCase();

      if (roleName && roleName !== "ADMIN" && roleName != "TEACHER") {
        throw new Error("This account does not have admin or teacher access.");
      }

      localStorage.setItem("bibo_admin_token", token);
      localStorage.setItem("bibo_admin_user", JSON.stringify(user || null));

      setMessage(msg, "Login successful. Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "admin_dashboard.html";
      }, 700);
    } catch (error) {
      setMessage(msg, error.message || "Login failed.", "error");
    } finally {
      loginBtn.disabled = false;
    }
  });
