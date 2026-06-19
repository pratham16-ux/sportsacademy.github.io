/* Stackly Sports Academy — contact.js
   Behaviour specific to contact.html: campus selector bar,
   enquiry form validation + success state, FAQ accordion,
   and scroll-reveal for campus cards & trial cards. */

(function () {
  "use strict";

  /* ---------- campus selector bar ---------- */
  var campusBtns = document.querySelectorAll(".campus-btn[data-campus]");
  var campusCards = document.querySelectorAll(".campus-card[data-campus]");
  var campusSelect = document.getElementById("campusPref");

  campusBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      campusBtns.forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var target = btn.getAttribute("data-campus");

      // highlight matching campus card
      campusCards.forEach(function (card) {
        if (target === "all" || card.getAttribute("data-campus") === target) {
          card.classList.add("is-main");
        } else {
          card.classList.remove("is-main");
        }
      });

      // pre-select matching campus in form select
      if (campusSelect && target !== "all") {
        Array.prototype.forEach.call(campusSelect.options, function (opt) {
          opt.selected = opt.value === target;
        });
      }
    });
  });

  /* ---------- input restriction helpers ---------- */

  /**
   * Restrict a text input to alphabets (including common Indian-script letters)
   * and spaces only, with a maximum character length.
   */
  function restrictNameInput(inputEl, maxLen) {
    // Block non-alpha characters on keydown (allow control keys)
    inputEl.addEventListener("keydown", function (e) {
      // Always allow: Backspace, Delete, Tab, Escape, Enter, arrow keys, Home, End
      var controlKeys = [
        "Backspace", "Delete", "Tab", "Escape", "Enter",
        "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
        "Home", "End"
      ];
      if (controlKeys.indexOf(e.key) !== -1) return;
      // Allow Ctrl/Cmd shortcuts (copy, paste, select-all, etc.)
      if (e.ctrlKey || e.metaKey) return;
      // Block if already at max length
      if (inputEl.value.length >= maxLen && !e.shiftKey) {
        // allow if there's a selection (the keystroke would replace selected text)
        var sel = inputEl.selectionEnd - inputEl.selectionStart;
        if (sel === 0) { e.preventDefault(); return; }
      }
      // Only allow letters and spaces (Unicode letter category + space)
      if (!/^[a-zA-Z\u00C0-\u024F\u0900-\u097F\u0C00-\u0C7F ]$/.test(e.key)) {
        e.preventDefault();
      }
    });

    // Strip any invalid chars that arrive via paste or auto-fill
    inputEl.addEventListener("input", function () {
      var cleaned = inputEl.value
        .replace(/[^a-zA-Z\u00C0-\u024F\u0900-\u097F\u0C00-\u0C7F ]/g, "")
        .slice(0, maxLen);
      if (cleaned !== inputEl.value) {
        var cursor = inputEl.selectionStart;
        inputEl.value = cleaned;
        // Restore cursor position as best we can
        inputEl.setSelectionRange(
          Math.min(cursor, cleaned.length),
          Math.min(cursor, cleaned.length)
        );
      }
    });

    // Enforce maxlength attribute as a belt-and-suspenders measure
    inputEl.setAttribute("maxlength", String(maxLen));
  }

  /**
   * Restrict a tel input to exactly 10 digits; no other characters allowed.
   */
  function restrictPhoneInput(inputEl) {
    inputEl.addEventListener("keydown", function (e) {
      var controlKeys = [
        "Backspace", "Delete", "Tab", "Escape", "Enter",
        "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
        "Home", "End"
      ];
      if (controlKeys.indexOf(e.key) !== -1) return;
      if (e.ctrlKey || e.metaKey) return;
      // Block if already at 10 digits
      if (inputEl.value.replace(/\D/g, "").length >= 10) {
        var sel = inputEl.selectionEnd - inputEl.selectionStart;
        if (sel === 0) { e.preventDefault(); return; }
      }
      // Only allow digit keys
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    });

    // Strip non-digits and cap at 10 on paste / auto-fill
    inputEl.addEventListener("input", function () {
      var digitsOnly = inputEl.value.replace(/\D/g, "").slice(0, 10);
      if (digitsOnly !== inputEl.value) {
        var cursor = inputEl.selectionStart;
        inputEl.value = digitsOnly;
        inputEl.setSelectionRange(
          Math.min(cursor, digitsOnly.length),
          Math.min(cursor, digitsOnly.length)
        );
      }
    });

    inputEl.setAttribute("maxlength", "10");
  }

  /* ---------- enquiry form ---------- */
  var form = document.getElementById("enquiryForm");
  var formBody = document.getElementById("formBody");
  var formSuccess = document.getElementById("formSuccess");

  if (form) {
    // Apply input restrictions
    var parentNameEl = form.querySelector("#parentName");
    var childNameEl  = form.querySelector("#childName");
    var phoneEl      = form.querySelector("#phone");

    if (parentNameEl) restrictNameInput(parentNameEl, 16);
    if (childNameEl)  restrictNameInput(childNameEl,  16);
    if (phoneEl)      restrictPhoneInput(phoneEl);

    /* ---- validation ---- */
    function showError(field, msg) {
      field.style.borderColor = "#c0392b";
      var err = field.parentElement.querySelector(".field-error");
      if (!err) {
        err = document.createElement("span");
        err.className = "field-error";
        err.style.cssText = "font-family:var(--f-mono);font-size:0.68rem;color:#c0392b;margin-top:0.2em;";
        field.parentElement.appendChild(err);
      }
      err.textContent = msg;
    }

    function clearErrors() {
      form.querySelectorAll("input, select, textarea").forEach(function (el) {
        el.style.borderColor = "";
      });
      form.querySelectorAll(".field-error").forEach(function (el) { el.remove(); });
    }

    function validateForm() {
      var ok = true;
      clearErrors();

      // Parent name — required, alphabets only, 1–16 chars
      var name = form.querySelector("#parentName");
      var nameVal = name.value.trim();
      if (!nameVal) {
        showError(name, "Please enter a name.");
        ok = false;
      } else if (!/^[a-zA-Z\u00C0-\u024F\u0900-\u097F\u0C00-\u0C7F ]+$/.test(nameVal)) {
        showError(name, "Name must contain letters only.");
        ok = false;
      } else if (nameVal.length > 16) {
        showError(name, "Name must be 16 characters or fewer.");
        ok = false;
      }

      // Child name — optional, but if filled must be alphabets only, ≤16 chars
      var childName = form.querySelector("#childName");
      if (childName && childName.value.trim()) {
        var childVal = childName.value.trim();
        if (!/^[a-zA-Z\u00C0-\u024F\u0900-\u097F\u0C00-\u0C7F ]+$/.test(childVal)) {
          showError(childName, "Name must contain letters only.");
          ok = false;
        } else if (childVal.length > 16) {
          showError(childName, "Name must be 16 characters or fewer.");
          ok = false;
        }
      }

      // Phone — required, exactly 10 digits, starts with 6-9
      var phone = form.querySelector("#phone");
      var phoneVal = phone.value.replace(/\s/g, "");
      if (!phoneVal) {
        showError(phone, "Please enter a mobile number.");
        ok = false;
      } else if (!/^\d{10}$/.test(phoneVal)) {
        showError(phone, "Enter a valid 10-digit mobile number.");
        ok = false;
      } else if (!/^[6-9]/.test(phoneVal)) {
        showError(phone, "Mobile number must start with 6, 7, 8, or 9.");
        ok = false;
      }

      // Email — optional, but if filled must be a valid format
      var email = form.querySelector("#email");
      if (email && email.value.trim()) {
        // RFC-5322 simplified but catches common mistakes
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(email.value.trim())) {
          showError(email, "Enter a valid email address (e.g. hello@example.com).");
          ok = false;
        }
      }

      // Sport — required
      var sport = form.querySelector("#sport");
      if (!sport.value) {
        showError(sport, "Please select a sport.");
        ok = false;
      }

      // Campus — required
      var campus = form.querySelector("#campusPref");
      if (!campus.value) {
        showError(campus, "Please select a campus.");
        ok = false;
      }

      return ok;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateForm()) return;

      // simulate async submission
      var submitBtn = form.querySelector("[type='submit']");
      submitBtn.textContent = "Sending…";
      submitBtn.disabled = true;

      setTimeout(function () {
        formBody.style.display = "none";
        formSuccess.classList.add("is-visible");
      }, 900);
    });

    // Live-clear error on input
    form.querySelectorAll("input, select, textarea").forEach(function (el) {
      el.addEventListener("input", function () {
        el.style.borderColor = "";
        var err = el.parentElement.querySelector(".field-error");
        if (err) err.remove();
      });
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".contact-faq .faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var open = item.getAttribute("data-open") === "true";
      item.setAttribute("data-open", String(!open));
      q.setAttribute("aria-expanded", String(!open));
      a.style.maxHeight = open ? null : a.scrollHeight + "px";
    });
  });

  /* ---------- campus card scroll-reveal ---------- */
  var campusCardEls = document.querySelectorAll(".campus-card[data-reveal]");
  var trialCardEls = document.querySelectorAll(".trial-card[data-reveal]");

  if ("IntersectionObserver" in window) {
    var revIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    campusCardEls.forEach(function (el) { revIO.observe(el); });
    trialCardEls.forEach(function (el) { revIO.observe(el); });
  } else {
    campusCardEls.forEach(function (el) { el.classList.add("is-visible"); });
    trialCardEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Leaflet map ---------- */
  var CAMPUSES = [
    {
      key:     "hebbal",
      label:   "Hebbal Grounds",
      address: "Hebbal Ring Road, Bengaluru — 560024",
      sports:  "Athletics · Football · S&C",
      lat:     13.0358,
      lng:     77.5970
    },
    {
      key:     "vidyaranyapura",
      label:   "Vidyaranyapura Turf",
      address: "12th Cross, Vidyaranyapura, Bengaluru — 560097",
      sports:  "Football · Cricket · Basketball",
      lat:     13.0873,
      lng:     77.5364
    },
    {
      key:     "yelahanka",
      label:   "Yelahanka Track",
      address: "CRPF Road, Yelahanka, Bengaluru — 560064",
      sports:  "Athletics · Swimming · Cricket",
      lat:     13.1235,
      lng:     77.5742
    }
  ];

  function initLeafletMap() {
    if (typeof L === "undefined") return;  // Leaflet not loaded yet — see below
    var mapEl = document.getElementById("leafletMap");
    if (!mapEl || mapEl._leaflet_id) return; // already initialised

    var map = L.map("leafletMap", {
      center: [13.0822, 77.5560],
      zoom:   12,
      scrollWheelZoom: false   // friendlier on touch / embedded pages
    });

    // OpenStreetMap tiles (no API key needed)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Custom gold pin icon
    function makeIcon(active) {
      return L.divIcon({
        className: "",
        html: '<div style="'
          + 'width:36px;height:36px;border-radius:50%;'
          + 'background:' + (active ? "#C9A227" : "#4A6741") + ';'
          + 'border:3px solid ' + (active ? "#fff" : "#C9A227") + ';'
          + 'box-shadow:0 2px 8px rgba(0,0,0,0.35);'
          + 'display:flex;align-items:center;justify-content:center;'
          + '"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="'
          + (active ? "#2B3E2C" : "#E8C766") + '" stroke-width="2.5">'
          + '<path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z"/>'
          + '<circle cx="12" cy="9" r="2.5"/></svg></div>',
        iconSize:   [36, 36],
        iconAnchor: [18, 36],
        popupAnchor:[0, -38]
      });
    }

    var markers = {};

    CAMPUSES.forEach(function (c) {
      var marker = L.marker([c.lat, c.lng], { icon: makeIcon(false) })
        .addTo(map)
        .bindPopup(
          '<div style="font-family:sans-serif;min-width:180px;">'
          + '<strong style="font-size:0.95rem;color:#1E2D1F;">' + c.label + '</strong>'
          + '<p style="margin:4px 0 2px;font-size:0.78rem;color:#4A6741;">' + c.address + '</p>'
          + '<p style="margin:0;font-size:0.75rem;color:#888;">' + c.sports + '</p>'
          + '<a href="https://www.google.com/maps/search/?api=1&query=' + c.lat + ',' + c.lng
          + '" target="_blank" rel="noopener noreferrer" '
          + 'style="display:inline-block;margin-top:8px;font-size:0.75rem;color:#C9A227;font-weight:600;">'
          + 'Open in Google Maps ↗</a>'
          + '</div>'
        );
      markers[c.key] = marker;
    });

    // Keep map aware of active campus so selector bar can highlight a pin
    window._stacklyMap = {
      map: map,
      markers: markers,
      makeIcon: makeIcon,
      activeCampus: null,
      focus: function (key) {
        // Reset all icons
        Object.keys(markers).forEach(function (k) {
          markers[k].setIcon(makeIcon(k === key));
        });
        if (key && markers[key]) {
          map.flyTo(markers[key].getLatLng(), 14, { duration: 0.8 });
          markers[key].openPopup();
        } else {
          map.flyTo([13.0822, 77.5560], 12, { duration: 0.8 });
          map.closePopup();
        }
        this.activeCampus = key || null;
      }
    };

    // Keep pins in sync when the campus selector bar is clicked
    campusBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-campus");
        if (window._stacklyMap) {
          window._stacklyMap.focus(target === "all" ? null : target);
        }
      });
    });
  }

  // Load Leaflet CSS + JS dynamically so nothing extra is needed in <head>
  (function loadLeaflet() {
    if (!document.getElementById("leafletMap")) return; // map div not on this page

    var link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    document.head.appendChild(link);

    var script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV/XN/sp0=";
    script.crossOrigin = "";
    script.onload = initLeafletMap;
    document.head.appendChild(script);
  }());

})();