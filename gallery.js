/* Stackly Sports Academy — gallery.js
   Behaviour specific to gallery.html: filter chips, lightbox,
   drag-scroll highlight rail, campus photo tabs. */

(function () {
  "use strict";

  /* ---------- filter chips + masonry ---------- */
  var chips = document.querySelectorAll(".chip[data-filter]");
  var items = document.querySelectorAll(".masonry-item[data-cat]");

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      var filter = chip.getAttribute("data-filter");
      items.forEach(function (item) {
        if (filter === "all" || item.getAttribute("data-cat") === filter) {
          item.classList.remove("is-hidden");
        } else {
          item.classList.add("is-hidden");
        }
      });
    });
  });

  /* ---------- lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxCaption = document.getElementById("lightboxCaption");
  var lightboxClose = document.getElementById("lightboxClose");
  var lightboxPrev = document.getElementById("lightboxPrev");
  var lightboxNext = document.getElementById("lightboxNext");

  var visibleItems = [];
  var currentIndex = 0;

  function getVisible() {
    return Array.prototype.filter.call(items, function (item) {
      return !item.classList.contains("is-hidden");
    });
  }

  function openLightbox(index) {
    visibleItems = getVisible();
    currentIndex = index;
    var item = visibleItems[currentIndex];
    if (!item) return;
    var img = item.querySelector("img");
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = img.alt || "";
    lightbox.setAttribute("data-open", "true");
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.setAttribute("data-open", "false");
    document.body.style.overflow = "";
    lightboxImg.src = "";
  }

  function showPrev() {
    visibleItems = getVisible();
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    var img = visibleItems[currentIndex].querySelector("img");
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = img.alt || "";
  }

  function showNext() {
    visibleItems = getVisible();
    currentIndex = (currentIndex + 1) % visibleItems.length;
    var img = visibleItems[currentIndex].querySelector("img");
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = img.alt || "";
  }

  if (lightbox) {
    items.forEach(function (item, i) {
      item.addEventListener("click", function () {
        visibleItems = getVisible();
        var idx = visibleItems.indexOf(item);
        openLightbox(idx === -1 ? 0 : idx);
      });
    });
    lightboxClose.addEventListener("click", closeLightbox);
    lightboxPrev.addEventListener("click", showPrev);
    lightboxNext.addEventListener("click", showNext);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (lightbox.getAttribute("data-open") !== "true") return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    });
  }

  /* ---------- drag-scroll highlight rail ---------- */
  var rail = document.querySelector(".highlight-rail");
  if (rail) {
    var isDown = false;
    var startX = 0;
    var scrollLeft = 0;
    rail.addEventListener("mousedown", function (e) {
      isDown = true;
      startX = e.pageX - rail.offsetLeft;
      scrollLeft = rail.scrollLeft;
    });
    rail.addEventListener("mouseleave", function () { isDown = false; });
    rail.addEventListener("mouseup", function () { isDown = false; });
    rail.addEventListener("mousemove", function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - rail.offsetLeft;
      var walk = (x - startX) * 1.4;
      rail.scrollLeft = scrollLeft - walk;
    });
  }

  /* ---------- campus photo tabs ---------- */
  var campusTabs = document.querySelectorAll(".campus-tab[data-campus]");
  var campusPanels = document.querySelectorAll(".campus-panel[data-campus]");
  campusTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      campusTabs.forEach(function (t) { t.classList.remove("is-active"); });
      campusPanels.forEach(function (p) { p.classList.remove("is-active"); });
      tab.classList.add("is-active");
      var target = document.querySelector(".campus-panel[data-campus='" + tab.getAttribute("data-campus") + "']");
      if (target) target.classList.add("is-active");
    });
  });

  /* ---------- timeline reveal ---------- */
  var timelineItems = document.querySelectorAll(".timeline-item");
  if ("IntersectionObserver" in window && timelineItems.length) {
    var tlIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          tlIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    timelineItems.forEach(function (el) { tlIO.observe(el); });
  } else {
    timelineItems.forEach(function (el) { el.classList.add("is-visible"); });
  }
/* ---------- before/after drag compare ---------- */
  var compareWrap = document.getElementById("compareWrap");
  if (compareWrap) {
    var dragging = false;

    function setPos(clientX) {
      var rect = compareWrap.getBoundingClientRect();
      var pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      compareWrap.style.setProperty("--pos", pct + "%");
    }
    function pointX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }

    function startDrag(e) {
      dragging = true;
      compareWrap.classList.add("is-dragging");
      setPos(pointX(e));
    }
    function moveDrag(e) { if (dragging) setPos(pointX(e)); }
    function endDrag() {
      dragging = false;
      compareWrap.classList.remove("is-dragging");
    }

    compareWrap.addEventListener("mousedown", startDrag);
    window.addEventListener("mousemove", moveDrag);
    window.addEventListener("mouseup", endDrag);

    compareWrap.addEventListener("touchstart", startDrag, { passive: true });
    window.addEventListener("touchmove", moveDrag, { passive: true });
    window.addEventListener("touchend", endDrag);

    // tap/click anywhere on the strip jumps the handle there
    compareWrap.addEventListener("click", function (e) {
      if (!dragging) setPos(e.clientX);
    });
  }
/* ---------- stat callouts count-up ---------- */
  var statStrip = document.querySelector(".stat-strip");
  if (statStrip) {
    var counted = false;
    function runCount() {
      if (counted) return;
      counted = true;
      statStrip.querySelectorAll(".stat-strip-item strong").forEach(function (el) {
        var raw = el.textContent.trim();
        var target = parseInt(raw, 10);
        if (isNaN(target)) return;
        var suffix = raw.replace(/[0-9]/g, "");   // keeps the "+" on 40+
        var dur = 1400, start = null;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);      // ease-out
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(step);
      });
    }
    if ("IntersectionObserver" in window) {
      var statIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { runCount(); statIO.disconnect(); }
        });
      }, { threshold: 0.4 });
      statIO.observe(statStrip);
    } else {
      runCount();
    }
  }

})();