/* Stackly Sports Academy — programs.js
   Behaviour specific to programs.html: sticky sport tabs with
   scroll-spy + smooth jump, pricing monthly/quarterly toggle,
   age-ladder fill-on-scroll, and the FAQ accordion. */

(function () {
  "use strict";

  /* ---------- sport tabs: click to jump + scroll-spy ---------- */
  var tabs = document.querySelectorAll(".sport-tab");
  var sections = Array.prototype.map.call(tabs, function (t) {
    return document.getElementById(t.getAttribute("data-target"));
  });

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () {
      var target = sections[i];
      if (!target) return;
      var offset = 150;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  function setActiveTab(activeIndex) {
    tabs.forEach(function (t, i) {
      t.classList.toggle("is-active", i === activeIndex);
    });
  }

  if ("IntersectionObserver" in window) {
    var spyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var idx = sections.indexOf(entry.target);
          if (idx !== -1) setActiveTab(idx);
        }
      });
    }, { rootMargin: "-160px 0px -60% 0px", threshold: 0 });
    sections.forEach(function (s) { if (s) spyIO.observe(s); });
  }

  /* ---------- pricing toggle ---------- */
  var toggle = document.getElementById("priceToggle");
  var amounts = document.querySelectorAll(".amt");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var isQuarterly = toggle.getAttribute("aria-pressed") === "true";
      var next = !isQuarterly;
      toggle.setAttribute("aria-pressed", String(next));
      amounts.forEach(function (el) {
        var val = next ? el.getAttribute("data-quarterly") : el.getAttribute("data-monthly");
        el.textContent = Number(val).toLocaleString("en-IN");
      });
      document.querySelectorAll(".price-amount span:last-child").forEach(function (suffix) {
        suffix.textContent = next ? "/qtr" : "/mo";
      });
    });
  }

  /* ---------- age ladder fill-on-scroll ---------- */
  var ladderRows = document.querySelectorAll(".ladder-row");
  if ("IntersectionObserver" in window && ladderRows.length) {
    var ladderIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          ladderIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    ladderRows.forEach(function (r) { ladderIO.observe(r); });
  } else {
    ladderRows.forEach(function (r) { r.classList.add("is-visible"); });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    q.addEventListener("click", function () {
      var open = item.getAttribute("data-open") === "true";
      item.setAttribute("data-open", String(!open));
      q.setAttribute("aria-expanded", String(!open));
      a.style.maxHeight = open ? null : a.scrollHeight + "px";
    });
  });
})();