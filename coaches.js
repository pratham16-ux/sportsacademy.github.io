/* Stackly Sports Academy — coaches.js
   Behaviour specific to coaches.html: tenure bars animated
   on scroll (handled by shared data-reveal + CSS custom props),
   department bar tooltip accessibility, and criteria stagger. */

(function () {
  "use strict";

  /* ---------- criteria items — staggered delay ---------- */
  var criteriaItems = document.querySelectorAll(".criteria-item[data-reveal]");
  criteriaItems.forEach(function (el, i) {
    el.style.transitionDelay = (i * 0.12) + "s";
  });

  /* ---------- dept bar — keyboard tooltip support ---------- */
  var segments = document.querySelectorAll(".dept-seg");
  segments.forEach(function (seg) {
    seg.setAttribute("tabindex", "0");
    seg.setAttribute("role", "button");
    var tip = seg.querySelector(".tip");
    if (!tip) return;
    seg.setAttribute("aria-label", tip.textContent.trim());
    seg.addEventListener("focus", function () {
      tip.style.opacity = "1";
      tip.style.transform = "translateX(-50%) translateY(0)";
    });
    seg.addEventListener("blur", function () {
      tip.style.opacity = "";
      tip.style.transform = "";
    });
  });

  /* ---------- position rows — add keyboard activation ---------- */
  var positionRows = document.querySelectorAll(".position-row");
  positionRows.forEach(function (row) {
    if (row.tagName.toLowerCase() === "a") return; // already links
    row.setAttribute("tabindex", "0");
    row.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { row.click(); }
    });
  });

  /* ---------- staff cards — keyboard hover-reveal ---------- */
  var staffCards = document.querySelectorAll(".staff-card");
  staffCards.forEach(function (card) {
    card.addEventListener("focus", function () {
      card.classList.add("is-focused");
    });
    card.addEventListener("blur", function () {
      card.classList.remove("is-focused");
    });
  });

})();