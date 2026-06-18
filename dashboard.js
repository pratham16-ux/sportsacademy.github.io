/* Stackly Sports Academy — dashboard-common.js
   Shared shell logic for both member & coach dashboards:
   session guard, signed-in email display, panel switching,
   mobile sidebar, logout, and a toast helper.
   Exposes window.StacklyDash for the page-specific scripts. */

(function () {
  "use strict";

  var SESSION_KEY = "stacklyAuth";

  /* ---------- 1. session guard ---------- */
  var session = null;
  try {
    session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  } catch (e) { session = null; }

  // Which role does THIS page expect? Inferred from the page-role attribute,
  // falling back to filename.
  var expectedRole = document.body.getAttribute("data-role")
    || (location.pathname.indexOf("coach") !== -1 ? "coach" : "member");

  if (!session || !session.email) {
    // not signed in — send back to the sign-in page
    window.location.replace("signin.html");
    return;
  }
  if (session.role && session.role !== expectedRole) {
    // signed in as the other role — route them to the right dashboard
    window.location.replace(session.role === "coach" ? "coach-dashboard.html" : "member-dashboard.html");
    return;
  }

  /* ---------- 2. fill in the signed-in identity (incl. email) ---------- */
  function initials(name) {
    var parts = (name || "").trim().split(/\s+/);
    if (!parts[0]) return expectedRole === "coach" ? "C" : "M";
    return (parts[0][0] + (parts[1] ? parts[1][0] : "")).toUpperCase();
  }

  var setText = function (id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setText("acctName", session.name || (expectedRole === "coach" ? "Coach" : "Member"));
  setText("acctEmail", session.email);
  setText("welcomeEmail", session.email);
  setText("welcomeName", "Welcome back, " + (session.name || "").split(" ")[0]);
  var avatar = document.getElementById("acctAvatar");
  if (avatar) avatar.textContent = initials(session.name);

  /* ---------- 3. panel switching ---------- */
  var navBtns = document.querySelectorAll(".dash-nav-btn[data-panel]");
  var panels  = document.querySelectorAll(".panel[data-panel]");
  var titleEl = document.getElementById("pageTitle");

  function showPanel(name) {
    navBtns.forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-panel") === name); });
    panels.forEach(function (p) { p.classList.toggle("is-active", p.getAttribute("data-panel") === name); });
    var active = document.querySelector(".dash-nav-btn[data-panel='" + name + "']");
    if (active && titleEl) {
      // use the first meaningful text line (ignore the SVG and any badge number)
      var line = active.textContent.split("\n")
        .map(function (s) { return s.trim(); })
        .filter(function (s) { return s && !/^[0-9!]+$/.test(s); })[0];
      titleEl.textContent = line || name;
    }
    document.getElementById("dashBody").scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });
    closeSide();
  }

  navBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      showPanel(btn.getAttribute("data-panel"));
    });
  });

  /* ---------- 4. mobile sidebar ---------- */
  var side   = document.getElementById("dashSide");
  var scrim  = document.getElementById("dashScrim");
  var burger = document.getElementById("dashBurger");
  function openSide() { if (side) { side.classList.add("is-open"); scrim.classList.add("is-show"); } }
  function closeSide() { if (side) { side.classList.remove("is-open"); scrim.classList.remove("is-show"); } }
  if (burger) burger.addEventListener("click", openSide);
  if (scrim) scrim.addEventListener("click", closeSide);

  /* ---------- 5. logout ---------- */
  var logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.href = "signin.html";
    });
  }

  /* ---------- 6. toast helper ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-show"); }, 2600);
  }

  /* ---------- expose for page scripts ---------- */
  window.StacklyDash = {
    session: session,
    showPanel: showPanel,
    toast: toast,
    setText: setText
  };

  /* let page scripts know the shell is ready */
  document.dispatchEvent(new CustomEvent("dash:ready"));

})();