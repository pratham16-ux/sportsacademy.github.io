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

  /* ---------- enquiry form ---------- */
  var form = document.getElementById("enquiryForm");
  var formBody = document.getElementById("formBody");
  var formSuccess = document.getElementById("formSuccess");

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

    var name = form.querySelector("#parentName");
    if (!name.value.trim()) { showError(name, "Please enter a name."); ok = false; }

    var phone = form.querySelector("#phone");
    var phoneVal = phone.value.replace(/\s/g, "");
    if (!phoneVal || !/^[6-9]\d{9}$/.test(phoneVal)) { showError(phone, "Enter a valid 10-digit Indian mobile number."); ok = false; }

    var sport = form.querySelector("#sport");
    if (!sport.value) { showError(sport, "Please select a sport."); ok = false; }

    var campus = form.querySelector("#campusPref");
    if (!campus.value) { showError(campus, "Please select a campus."); ok = false; }

    return ok;
  }

  if (form) {
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

    // live clear error on input
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

  /* ---------- map pin hover pulse ---------- */
  var mapPins = document.querySelectorAll(".map-pin");
  mapPins.forEach(function (pin) {
    pin.addEventListener("click", function () {
      var campus = pin.getAttribute("data-campus");
      var matching = document.querySelector(".campus-btn[data-campus='" + campus + "']");
      if (matching) matching.click();
      // scroll to form
      var formSection = document.getElementById("enquiryForm");
      if (formSection) {
        formSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });

})();