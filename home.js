/* Stackly Sports Academy — home.js
   Behaviour specific to index.html: animated counters, the
   scroll-traced method line, accordion schedule, magnetic
   badge hover, and the headline decode effect. */

(function () {
  "use strict";

  /* ---------- count-up stats ---------- */
  var counters = document.querySelectorAll(".stat-num[data-count]");
  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1400;
    var start = null;
    function tick(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var counterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { counterIO.observe(c); });
  }

  /* ---------- method line trace ---------- */
  var methodSection = document.querySelector(".method");
  var traceLine = document.getElementById("methodTraceLine");
  if (methodSection && traceLine) {
    var pathLength = traceLine.getTotalLength ? traceLine.getTotalLength() : 600;
    traceLine.style.strokeDasharray = pathLength;
    traceLine.style.strokeDashoffset = pathLength;

    function updateTrace() {
      var rect = methodSection.getBoundingClientRect();
      var vh = window.innerHeight;
      var total = rect.height + vh;
      var passed = vh - rect.top;
      var ratio = Math.min(Math.max(passed / total, 0), 1);
      traceLine.style.strokeDashoffset = pathLength * (1 - ratio);
    }
    document.addEventListener("scroll", updateTrace, { passive: true });
    updateTrace();
  }

  /* ---------- accordion schedule ---------- */
  var accItems = document.querySelectorAll(".acc-item");
  accItems.forEach(function (item) {
    var trigger = item.querySelector(".acc-trigger");
    var panel = item.querySelector(".acc-panel");
    trigger.addEventListener("click", function () {
      var isOpen = item.getAttribute("data-open") === "true";
      accItems.forEach(function (other) {
        other.setAttribute("data-open", "false");
        other.querySelector(".acc-trigger").setAttribute("aria-expanded", "false");
        other.querySelector(".acc-panel").style.maxHeight = null;
      });
      if (!isOpen) {
        item.setAttribute("data-open", "true");
        trigger.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  /* ---------- magnetic badges ---------- */
  var magnets = document.querySelectorAll(".js-magnet");
  magnets.forEach(function (el) {
    el.addEventListener("mousemove", function (e) {
      var rect = el.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = "translate(" + x * 0.28 + "px," + y * 0.28 + "px)";
    });
    el.addEventListener("mouseleave", function () {
      el.style.transform = "translate(0,0)";
    });
  });

  /* ---------- decode text effect ---------- */
  var decodeEl = document.querySelector("[data-decode]");
  if (decodeEl) {
    var finalText = decodeEl.getAttribute("data-decode");
    var glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*?";
    var hasRun = false;
    function decodeIn() {
      if (hasRun) return;
      hasRun = true;
      var frame = 0;
      var totalFrames = 24;
      var interval = setInterval(function () {
        frame++;
        var revealCount = Math.floor((frame / totalFrames) * finalText.length);
        var out = "";
        for (var i = 0; i < finalText.length; i++) {
          if (finalText[i] === " ") { out += " "; continue; }
          if (i < revealCount) out += finalText[i];
          else out += glyphs[Math.floor(Math.random() * glyphs.length)];
        }
        decodeEl.textContent = out;
        if (frame >= totalFrames) {
          clearInterval(interval);
          decodeEl.textContent = finalText;
        }
      }, 38);
    }
    if ("IntersectionObserver" in window) {
      var decodeIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { decodeIn(); decodeIO.unobserve(entry.target); }
        });
      }, { threshold: 0.5 });
      decodeIO.observe(decodeEl);
    } else {
      decodeEl.textContent = finalText;
    }
  }
})();