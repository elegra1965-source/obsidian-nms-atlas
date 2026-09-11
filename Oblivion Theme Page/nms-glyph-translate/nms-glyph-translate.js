/* ============================================================
   NMS Glyph Translate — animated decode (optional enhancement)
   Per-letter "scramble -> English" decode on hover, with an
   optional boot reveal on load. Pairs with nms-glyph-translate.css.

   This uses your REAL NMS alphabet font for every frame: the scramble
   cycles through random LETTERS rendered in 'NMS Alphabet', so each
   frame is an authentic Korvax glyph (NOT placeholder symbols). At the
   end of the decode the element switches to a readable font = English.

   USAGE
   1. Write the ENGLISH text in your HTML (accessible + SEO-friendly):
        <h1 class="nms-glyph">Korvax Archive</h1>
   2. Load the CSS (which defines @font-face 'NMS Alphabet'), then this
      script, then call:
        <script src="nms-glyph-translate.js"></script>
        <script>NMSGlyph.init();</script>

   OPTIONS (per element, via data-* attributes)
     data-nms-boot      decode this element once on page load
     data-nms-static    do NOT re-scramble after hover (stays English)

   GLOBAL OPTIONS
     NMSGlyph.init({ boot: true })   // boot-decode every .nms-glyph on load
     NMSGlyph.revealAll()            // force all to English
     NMSGlyph.reglyphAll()           // force all back to NMS glyphs

   Resting state = the real word rendered in 'NMS Alphabet' (true glyphs).
   If JS is absent the CSS still gives an instant glyph<->English swap.
   ============================================================ */
(function (root) {
  var LETTERS = 'abcdefghijklmnopqrstuvwxyz';
  var GLYPH_FONT = "'NMS Alphabet', 'Orbitron', monospace";
  var EN_FONT = "'Orbitron', 'Rajdhani', system-ui, sans-serif";
  function rnd() { return LETTERS[(Math.random() * LETTERS.length) | 0]; }

  function decode(el) {
    clearInterval(el._nmsT);
    var en = el.getAttribute('data-nms-en');
    var f = 0;
    el.style.fontFamily = GLYPH_FONT;          /* glyphs while scrambling */
    el._nmsT = setInterval(function () {
      f++;
      var rev = Math.floor(f * 1.5), o = '';
      for (var i = 0; i < en.length; i++) {
        var c = en[i];
        o += (c === ' ' || c === '/' || c === '-') ? c : (i < rev ? c : rnd());
      }
      el.textContent = o;
      if (rev >= en.length) {
        clearInterval(el._nmsT);
        el.textContent = en;
        el.style.fontFamily = EN_FONT;         /* translated -> English */
      }
    }, 26);
  }
  /* resting: real word rendered in the NMS font = true Korvax glyphs */
  function reglyph(el) { clearInterval(el._nmsT); el.style.fontFamily = GLYPH_FONT; el.textContent = el.getAttribute('data-nms-en'); }
  function english(el) { clearInterval(el._nmsT); el.style.fontFamily = EN_FONT; el.textContent = el.getAttribute('data-nms-en'); }

  function bind(el) {
    if (el._nmsBound) return;
    el._nmsBound = true;
    el.setAttribute('data-nms-en', el.textContent);
    reglyph(el);
    el.addEventListener('mouseenter', function () { decode(el); });
    el.addEventListener('focus', function () { decode(el); });
    el.addEventListener('mouseleave', function () {
      if (el.hasAttribute('data-nms-static')) return;
      setTimeout(function () { reglyph(el); }, 450);
    });
  }

  var API = {
    init: function (opts) {
      opts = opts || {};
      var els = document.querySelectorAll('.nms-glyph');
      for (var i = 0; i < els.length; i++) {
        bind(els[i]);
        if (opts.boot || els[i].hasAttribute('data-nms-boot')) {
          (function (e, d) { setTimeout(function () { decode(e); }, 250 + d * 180); })(els[i], i);
        }
      }
    },
    revealAll: function () { var e = document.querySelectorAll('.nms-glyph'); for (var i = 0; i < e.length; i++) english(e[i]); },
    reglyphAll: function () { var e = document.querySelectorAll('.nms-glyph'); for (var i = 0; i < e.length; i++) reglyph(e[i]); }
  };
  root.NMSGlyph = API;
})(window);
