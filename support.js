/**
 * support.js — KAYSTEE Landing Page · Support / Buy Me a Coffee
 * ════════════════════════════════════════════════════════════════════
 * Self-contained IIFE. No globals exported. Mirrors the structure of
 * script.js so the two stay easy to tell apart at a glance.
 *
 * HTML contract (element this script expects to exist):
 *   #support   <section>  — empty placeholder in index.html. This file
 *                            owns everything rendered inside it.
 *
 * Responsibilities:
 *   - Render the Support section markup (nothing lives in index.html).
 *   - Display the MoMo QR code for Vietnam-based support.
 *   - Keep all support-related config/logic out of script.js, which
 *     stays focused on the live shortcut demo.
 *
 * Extensibility — adding an international payment method later:
 *   1. Add a descriptor to INTERNATIONAL_PROVIDERS, e.g.
 *        { id: "stripe", label: "Card / Apple Pay", url: "https://..." }
 *   2. That's it — renderInternationalProviders() already loops over
 *      this array and inserts a button/link per entry. The Vietnam/
 *      MoMo card above is untouched, and if the array stays empty (as
 *      it is today) that part of the section simply isn't rendered.
 *   No fake provider, placeholder link, or payment API is wired up
 *   until a real descriptor is added here.
 * ════════════════════════════════════════════════════════════════════
 */
(function () {
  "use strict";

  /* ── Configuration ────────────────────────────────────────────── */

  var VIETNAM_SUPPORT = {
    appName: "MoMo",
    qrSrc: "assets/momo-qr.png",
    qrAlt:
      "MoMo QR code for supporting KAYSTEE \u2014 scan with the MoMo app " +
      "or your banking app, then enter any amount you'd like to contribute."
  };

  // Empty today on purpose (see extensibility note above). Each entry
  // should look like: { id: "stripe", label: "Card / PayPal", url: "https://..." }
  var INTERNATIONAL_PROVIDERS = [];

  /* ── Element reference ────────────────────────────────────────── */

  var supportSection = document.getElementById("support");

  // Guard: if the placeholder isn't on this page, stop here.
  if (!supportSection) return;

  /* ── Small DOM helper ─────────────────────────────────────────── */

  /**
   * Create an element, assign a class name, and append text/child nodes.
   * Keeps the render functions below readable without resorting to
   * innerHTML.
   *
   * @param {string} tag
   * @param {string} [className]
   * @param {(string|Node)[]} [children]
   */
  function el(tag, className, children) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    (children || []).forEach(function (child) {
      if (child == null) return;
      node.appendChild(
        typeof child === "string" ? document.createTextNode(child) : child
      );
    });
    return node;
  }

  /* ── Section pieces ───────────────────────────────────────────── */

 function buildHeader() {
  var eyebrow = el(
    "p",
    "text-xs uppercase tracking-[0.2em] text-snap-accent font-semibold mb-4",
    ["Support the project"]
  );
  eyebrow.setAttribute("aria-hidden", "true");

  var heading = el(
    "h2",
    "text-3xl md:text-4xl font-bold text-white",
    ["\u2615 Support KAYSTEE"]
  );
  heading.id = "support-heading";

  var lede = el(
    "p",
    "mt-4 text-snap-muted max-w-xl mx-auto leading-relaxed",
    [
      "This extension is free and will stay free.",
      el("br"),
      "If it saves you some time, consider buying me a coffee to support its development"
    ]
  );

  return el("div", "text-center max-w-2xl mx-auto mb-12", [
    eyebrow,
    heading,
    lede
  ]);
}

  function buildVietnamCard(config) {
    var qrImg = el("img", "w-48 h-auto sm:w-56 rounded-lg");
    qrImg.src = config.qrSrc;
    qrImg.alt = config.qrAlt;
    qrImg.width = 224;
    qrImg.height = 224;
    qrImg.loading = "lazy";
    qrImg.decoding = "async";

    var qrFrame = el(
      "div",
      "p-4 sm:p-5 rounded-2xl " +
        "transition-all duration-200 ease-out " +
        "motion-safe:hover:scale-[1.10] " +
        "motion-safe:hover:shadow-2xl " +
        "cursor-pointer will-change-transform",
      [qrImg]
    );

    var instructions = el(
      "p",
      "mt-6 text-snap-muted max-w-sm leading-relaxed",
      [
        "Scan with " +
          config.appName +
          " or your banking app."
      ]
    );

    var thanks = el(
      "p",
      "mt-4 text-white font-semibold",
      ["Thank you for your support \u2764\uFE0F"]
    );

    return el(
      "div",
      "bg-snap-surface border border-snap-border rounded-2xl p-8 sm:p-10 hero-glow flex flex-col items-center text-center",
      [qrFrame, instructions, thanks]
    );
  }

  /**
   * Renders a card per configured international provider. Returns null
   * when the list is empty so the caller can skip it entirely — keeps
   * the section free of empty containers or "coming soon" placeholders
   * until a real provider exists.
   *
   * @param {{id: string, label: string, url: string}[]} providers
   */
  function buildInternationalProviders(providers) {
    if (!providers.length) return null;

    var links = providers.map(function (provider) {
      var link = el("a", "underline hover:text-white transition-colors duration-150", [
        provider.label
      ]);
      link.href = provider.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.id = "support-intl-" + provider.id;
      return el("li", null, [link]);
    });

    return el("ul", "mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-snap-muted list-none", links);
  }

  /* ── Render ────────────────────────────────────────────────────── */

  function render() {
    var wrapper = el("div", "max-w-4xl mx-auto px-5 sm:px-6");
    var content = el("div", "flex flex-col items-center", [
      buildVietnamCard(VIETNAM_SUPPORT),
      buildInternationalProviders(INTERNATIONAL_PROVIDERS)
    ]);

    wrapper.appendChild(buildHeader());
    wrapper.appendChild(content);

    supportSection.className = "py-24 border-y border-snap-border bg-snap-surface/20";
    supportSection.setAttribute("aria-labelledby", "support-heading");
    supportSection.appendChild(wrapper);
  }

  render();
}());
