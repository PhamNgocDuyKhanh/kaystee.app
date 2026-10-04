/**
 * script.js — KAYSTEE Landing Page · Live Demo
 * ════════════════════════════════════════════════════════════════════
 * Self-contained IIFE. No globals exported.
 *
 * HTML contract (elements this script expects to exist):
 *   #playground          <textarea>  — the editable demo area
 *   #demoStatus          <p>         — aria-live status region
 *   #clearBtn            <button>    — clears the textarea
 *   .shortcut-btn        <button>    — each has data-shortcut="/abbr"
 *
 * Expansion flow:
 *   Space key pressed
 *     → match abbreviation immediately before caret
 *     → preventDefault (block native space insertion)
 *     → expandTyped(matched)
 *         → remove abbreviation from value
 *         → after EXPAND_DELAY_MS: insert replacement, move caret
 *         → show success styles for SUCCESS_DELAY_MS
 *
 *   Button clicked
 *     → clear textarea
 *     → after EXPAND_DELAY_MS: insert replacement, move caret
 *     → show success styles for SUCCESS_DELAY_MS
 * ════════════════════════════════════════════════════════════════════
 */
(function () {
  "use strict";

  /* ── Snippet data ──────────────────────────────────────────────── */

  var SNIPPETS = {
    "/sig":
      "Best regards,\n\nVincent\nProduct Designer\nKAYSTEE",

    "/thanks":
      "Thanks for reaching out.\n\nI appreciate your message and will get back to you shortly.",

    "/followup":
      "Hi there,\n\nJust following up on my previous message.\nLet me know if you have any questions.\n\nBest,\nNguyen",

    "/addr":
      "Vincent\n123 Nguyen Hue Street\nDistrict 1\nHo Chi Minh City, Vietnam"
  };

  /**
   * Sorted longest-first so that overlapping prefixes (e.g. "/fo" vs "/followup")
   * always resolve to the longest matching shortcut.
   */
  var SHORTCUT_KEYS = Object.keys(SNIPPETS).sort(function (a, b) {
    return b.length - a.length;
  });

  /* ── Timing constants ──────────────────────────────────────────── */

  var EXPAND_DELAY_MS  = 140; // pause before inserting text (feels intentional)
  var SUCCESS_DELAY_MS = 500; // how long the success highlight lingers

  /* ── Element references ────────────────────────────────────────── */

  var playground = document.getElementById("playground");
  var statusEl   = document.getElementById("demoStatus");
  var clearBtn   = document.getElementById("clearBtn");

  // Guard: if the demo markup isn't on this page, stop here.
  if (!playground || !statusEl) return;

  /* ── Module state ──────────────────────────────────────────────── */

  var isExpanding = false; // prevents re-entrant expansion

  /* ── Status helpers ────────────────────────────────────────────── */

  /**
   * Render the status bar without using innerHTML.
   * Each part is either a plain text node or a styled element.
   *
   * @param {Array<{text: string, tag?: string, cls?: string}>} parts
   */
  function setStatus(parts) {
    statusEl.textContent = "";
    parts.forEach(function (part) {
      var node;
      if (part.tag) {
        node = document.createElement(part.tag);
        if (part.cls)  node.className   = part.cls;
        if (part.text) node.textContent = part.text;
      } else {
        node = document.createTextNode(part.text || "");
      }
      statusEl.appendChild(node);
    });
  }

  function setStatusIdle() {
    setStatus([
      { text: "Try " },
      { tag: "code", cls: "text-snap-accent", text: "/sig" },
      { text: " and press Space." }
    ]);
  }

  function setStatusExpanding(shortcut) {
    setStatus([
      { text: "Expanding " },
      { tag: "code", cls: "text-snap-accent", text: shortcut },
      { text: "\u2026" } // …
    ]);
  }

  function setStatusDone(shortcut) {
    setStatus([
      { tag: "span", cls: "text-snap-accent", text: "Expanded" },
      { text: " " },
      { tag: "code", cls: "text-snap-accent", text: shortcut }
    ]);
  }

  /* ── Visual feedback ───────────────────────────────────────────── */

  function applySuccessStyles() {
    playground.classList.add("demo-success", "demo-expanding");
  }

  function removeSuccessStyles() {
    playground.classList.remove("demo-success", "demo-expanding");
  }

  /* ── Expansion — typed path ────────────────────────────────────── */

  /**
   * Handle a Space-triggered expansion.
   * The abbreviation is still in the textarea; Space's default was prevented.
   *
   * @param {string} shortcut — the matched abbreviation (e.g. "/sig")
   */
  function expandTyped(shortcut) {
    var replacement    = SNIPPETS[shortcut];
    var caretPos       = playground.selectionStart;
    var beforeCursor   = playground.value.slice(0, caretPos);
    var afterCursor    = playground.value.slice(caretPos);
    var beforeShortcut = beforeCursor.slice(0, -shortcut.length);

    // Step 1: Remove the shortcut text from the value.
    playground.value = beforeShortcut + afterCursor;

    // Step 2: After a short pause, insert the replacement and move the caret.
    //         The pause makes the expansion feel intentional rather than instant.
    setTimeout(function () {
      var insertAt = beforeShortcut.length;
      var before   = playground.value.slice(0, insertAt);
      var after    = playground.value.slice(insertAt);

      playground.value = before + replacement + after;

      var newCaret = insertAt + replacement.length;
      playground.focus();
      playground.setSelectionRange(newCaret, newCaret);

      applySuccessStyles();
      setStatusDone(shortcut);

      setTimeout(function () {
        removeSuccessStyles();
        isExpanding = false;
      }, SUCCESS_DELAY_MS);
    }, EXPAND_DELAY_MS);
  }

  /* ── Expansion — button path ───────────────────────────────────── */

  /**
   * Handle a button-click triggered expansion.
   * Clears the textarea first so users see the full replacement.
   *
   * @param {string} shortcut — the abbreviation to expand (e.g. "/sig")
   */
  function expandFromButton(shortcut) {
    var replacement = SNIPPETS[shortcut];
    if (!replacement || isExpanding) return;

    isExpanding = true;
    playground.value = "";
    playground.focus();
    setStatusExpanding(shortcut);

    setTimeout(function () {
      playground.value = replacement;
      playground.setSelectionRange(replacement.length, replacement.length);

      applySuccessStyles();
      setStatusDone(shortcut);

      setTimeout(function () {
        removeSuccessStyles();
        isExpanding = false;
      }, SUCCESS_DELAY_MS);
    }, EXPAND_DELAY_MS + 40); // slightly longer pause for the button path
  }

  /* ── Event listeners ───────────────────────────────────────────── */

  // Space key → check for shortcut match and expand
  playground.addEventListener("keydown", function (e) {
    if (e.key !== " " || isExpanding) return;

    var caret = playground.selectionStart;

    // Don't interfere when the user has a text selection active.
    if (caret !== playground.selectionEnd) return;

    var textBefore = playground.value.slice(0, caret);
    var matched    = null;

    for (var i = 0; i < SHORTCUT_KEYS.length; i++) {
      if (textBefore.endsWith(SHORTCUT_KEYS[i])) {
        matched = SHORTCUT_KEYS[i];
        break;
      }
    }

    if (!matched) return;

    e.preventDefault(); // block the native space insertion
    isExpanding = true;
    expandTyped(matched);
  });

  // Shortcut buttons — read target from data-shortcut attribute
  document.querySelectorAll(".shortcut-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var shortcut = btn.dataset.shortcut;
      if (shortcut) expandFromButton(shortcut);
    });
  });

  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      playground.value = "";
      playground.focus();
      setStatusIdle();
    });
  }

  /* ── Initialise ────────────────────────────────────────────────── */

  setStatusIdle();

}());
