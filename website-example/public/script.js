// ── Helpers ───────────────────────────────────────────────
function showMsg(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = "msg show " + type;
}

function clearMsg(id) {
  const el = document.getElementById(id);
  el.className = "msg";
  el.textContent = "";
}

// ── Profile dropdown ──────────────────────────────────────
function toggleMenu() {
  document.getElementById("profile-dropdown").classList.toggle("open");
}
document.addEventListener("click", function (e) {
  const wrap = document.querySelector(".profile-menu-wrap");
  if (wrap && !wrap.contains(e.target)) {
    const dd = document.getElementById("profile-dropdown");
    if (dd) dd.classList.remove("open");
  }
});

function showPage(page) {
  document.querySelectorAll(".dash-page").forEach(function (p) {
    p.classList.remove("active");
  });
  document.getElementById("page-" + page).classList.add("active");
  const dd = document.getElementById("profile-dropdown");
  if (dd) dd.classList.remove("open");
  if (page === "applications") loadApplications();
}

function switchTab(tab) {
  const views = ["login", "register", "forgot-password", "forgot-username"];
  views.forEach(function (v) {
    const el = document.getElementById("view-" + v);
    if (el) el.classList.toggle("active", v === tab);
  });

  // Only show tabs on login/register
  const tabs = document.getElementById("auth-tabs");
  if (tabs)
    tabs.style.display =
      tab === "login" || tab === "register" ? "flex" : "none";

  // Sync tab buttons
  document.querySelectorAll(".tab").forEach(function (t, i) {
    t.classList.toggle("active", (tab === "login" ? 0 : 1) === i);
  });

  ["login-msg", "register-msg", "fp-msg", "fu-msg"].forEach(clearMsg);
  document.getElementById("login-email").value = "";
  document.getElementById("login-password").value = "";
  document.getElementById("reg-username").value = "";
  document.getElementById("reg-email").value = "";
  document.getElementById("reg-password").value = "";
}

function showDashboard(username) {
  document.getElementById("auth-card").style.display = "none";
  document.getElementById("dash-username").textContent = username;
  const initial = document.getElementById("profile-initial");
  if (initial) initial.textContent = username.charAt(0).toUpperCase();
  document.getElementById("view-dashboard").classList.add("active");
  showPage("adopt");
  loadApplications();
}

function hideDashboard() {
  document.getElementById("auth-card").style.display = "block";
  document.getElementById("view-dashboard").classList.remove("active");
  switchTab("login");
}

// ── API helper ────────────────────────────────────────────
async function api(endpoint, body) {
  const res = await fetch("/api/" + endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, data: await res.json() };
}

// ── Auth handlers ─────────────────────────────────────────
async function handleLogin() {
  clearMsg("login-msg");
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const { ok, data } = await api("auth/login", { email, password });
  if (ok) {
    showDashboard(data.username);
  } else {
    showMsg("login-msg", data.message, "error");
  }
}

async function handleRegister() {
  clearMsg("register-msg");
  const username = document.getElementById("reg-username").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const { ok, data } = await api("auth/register", {
    username,
    email,
    password,
  });
  if (ok) {
    showMsg("register-msg", data.message, "success");
    setTimeout(function () {
      switchTab("login");
    }, 1500);
  } else {
    showMsg("register-msg", data.message, "error");
  }
}

async function handleChangePassword() {
  clearMsg("cp-msg");
  const currentPassword = document.getElementById("cp-current").value;
  const newPassword = document.getElementById("cp-new").value;
  const { ok, data } = await api("auth/change-password", {
    currentPassword,
    newPassword,
  });
  showMsg("cp-msg", data.message, ok ? "success" : "error");
  if (ok) {
    document.getElementById("cp-current").value = "";
    document.getElementById("cp-new").value = "";
  }
}

async function handleLogout() {
  await api("auth/logout", {});
  document.getElementById("cp-current").value = "";
  document.getElementById("cp-new").value = "";
  clearMsg("cp-msg");
  hideDashboard();
}

// ── Enter key support ─────────────────────────────────────
document.addEventListener("keydown", function (e) {
  if (e.key !== "Enter") return;
  if (document.getElementById("view-login").classList.contains("active"))
    handleLogin();
  else if (
    document.getElementById("view-register").classList.contains("active")
  )
    handleRegister();
});

// ── Check session on load ─────────────────────────────────
(async function () {
  try {
    const res = await fetch("/api/auth/me");
    if (res.ok) {
      const data = await res.json();
      if (data.loggedIn) showDashboard(data.username);
    }
  } catch (e) {
    // not logged in, do nothing
  }
})();

async function handleForgotPassword() {
  clearMsg("fp-msg");
  showMsg("fp-msg", "This feature is not available yet.", "error");
}

async function handleForgotUsername() {
  clearMsg("fu-msg");
  showMsg("fu-msg", "This feature is not available yet.", "error");
}

// ── Adoption form ─────────────────────────────────────────
async function handleAdopt() {
  clearMsg("adopt-msg");
  const fullName = document.getElementById("adopt-name").value.trim();
  const phone = document.getElementById("adopt-phone").value.trim();
  const homeEl = document.querySelector('input[name="home-type"]:checked');
  const petsEl = document.querySelector('input[name="other-pets"]:checked');
  const reason = document.getElementById("adopt-reason").value.trim();

  if (!fullName || !phone || !homeEl || !petsEl || !reason) {
    return showMsg("adopt-msg", "Please fill out all fields.", "error");
  }

  const { ok, data } = await api("adopt/submit", {
    fullName,
    phone,
    homeType: homeEl.value,
    otherPets: petsEl.value,
    reason,
  });

  showMsg("adopt-msg", data.message, ok ? "success" : "error");
  if (ok) {
    document.getElementById("adopt-name").value = "";
    document.getElementById("adopt-phone").value = "";
    document.getElementById("adopt-reason").value = "";
    document.querySelectorAll('input[name="home-type"]').forEach(function (r) {
      r.checked = false;
    });
    document.querySelectorAll('input[name="other-pets"]').forEach(function (r) {
      r.checked = false;
    });
    loadApplications();
  }
}

// ── Load applications ─────────────────────────────────────
async function loadApplications() {
  try {
    const res = await fetch("/api/adopt/mine", { method: "GET" });
    console.log("applications status:", res.status);
    if (!res.ok) return;
    const data = await res.json();
    console.log("applications data:", data);
    const list = document.getElementById("applications-list");
    if (!list) return;

    if (!data.applications || data.applications.length === 0) {
      list.innerHTML = '<p class="no-apps">No applications submitted yet.</p>';
      return;
    }

    list.innerHTML = data.applications
      .map(function (app) {
        const date = new Date(app.submitted_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
        return `
        <div class="app-card">
          <div class="app-header">
            <span class="app-name">${app.full_name}</span>
            <span class="app-date">${date}</span>
          </div>
          <div class="app-details">
            <span>${app.phone}</span>
            <span>${app.home_type}</span>
            <span>Other pets: ${app.other_pets}</span>
          </div>
          <p class="app-reason">${app.reason}</p>
        </div>
      `;
      })
      .join("");
  } catch (e) {
    console.error(e);
  }
}

// ── Change username ───────────────────────────────────────
async function handleChangeUsername() {
  clearMsg("cu-msg");
  const newUsername = document.getElementById("cu-username").value.trim();
  if (!newUsername)
    return showMsg("cu-msg", "Please enter a new username.", "error");
  const { ok, data } = await api("auth/change-username", { newUsername });
  showMsg("cu-msg", data.message, ok ? "success" : "error");
  if (ok) {
    document.getElementById("cu-username").value = "";
    document.getElementById("dash-username").textContent = data.username;
    const initial = document.getElementById("profile-initial");
    if (initial) initial.textContent = data.username.charAt(0).toUpperCase();
  }
}

// ── Change email ──────────────────────────────────────────
async function handleChangeEmail() {
  clearMsg("ce-msg");
  const newEmail = document.getElementById("ce-email").value.trim();
  if (!newEmail) return showMsg("ce-msg", "Please enter a new email.", "error");
  const { ok, data } = await api("auth/change-email", { newEmail });
  showMsg("ce-msg", data.message, ok ? "success" : "error");
  if (ok) {
    document.getElementById("ce-email").value = "";
  }
}
