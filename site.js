/* Stackly Sports Academy — site.js
   Shared behaviour across all five pages: sticky nav state,
   mobile drawer, and the scroll-reveal observer that every
   page's sections hook into via [data-reveal]. */

(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var lastY = window.scrollY;

  function onScroll() {
    var y = window.scrollY;
    if (header) {
      if (y > 18) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    }
    lastY = y;
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- hamburger / mobile drawer ---------- */
  var burger = document.querySelector(".hamburger");
  var drawer = document.querySelector(".mobile-drawer");
  var drawerClose = drawer ? drawer.querySelector(".drawer-close") : null;
  var drawerLinks = drawer ? drawer.querySelectorAll("a") : [];

  function openDrawer() {
    if (!drawer) return;
    drawer.setAttribute("data-open", "true");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Close menu");
    document.body.classList.add("drawer-locked");
    if (drawerClose) drawerClose.focus();
  }
  function closeDrawer() {
    if (!drawer) return;
    var wasOpen = drawer.getAttribute("data-open") === "true";
    drawer.setAttribute("data-open", "false");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("drawer-locked");
    if (wasOpen) burger.focus();
  }
  if (burger && drawer) {
    burger.addEventListener("click", function () {
      var isOpen = burger.getAttribute("aria-expanded") === "true";
      if (isOpen) closeDrawer();
      else openDrawer();
    });
    drawer.querySelector(".drawer-backdrop").addEventListener("click", closeDrawer);
    if (drawerClose) drawerClose.addEventListener("click", closeDrawer);
    drawerLinks.forEach(function (a) {
      a.addEventListener("click", closeDrawer);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer();
    });
    // if the drawer is open and the viewport grows past the mobile
    // breakpoint, the hamburger disappears — close it so it can't get
    // stuck open over the desktop layout with the page scroll locked.
    window.addEventListener("resize", function () {
      if (window.innerWidth > 880 && drawer.getAttribute("data-open") === "true") {
        closeDrawer();
      }
    });
  }

  /* ---------- logo fallback ----------
     If images/logo.webp 404s (not yet supplied), swap to a
     text-mark so the header never shows a broken image icon. */
  document.querySelectorAll(".brand-mark").forEach(function (img) {
    img.addEventListener("error", function () {
      var fallback = document.createElement("span");
      fallback.className = "brand-mark brand-mark--fallback";
      fallback.textContent = "SA";
      img.replaceWith(fallback);
    }, { once: true });
  });

  /* ---------- scroll reveal ----------
     Every section opts in by adding [data-reveal] to itself
     or to children. The class swap is what each section's own
     CSS keyframe responds to — this script only toggles state. */
  var revealItems = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealItems.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -60px 0px" }
    );
    revealItems.forEach(function (el) { io.observe(el); });
  } else {
    revealItems.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- current year in footer ---------- */
  var yearEls = document.querySelectorAll("[data-year]");
  yearEls.forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();