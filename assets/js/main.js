/* Carole St-Pierre salon & spa — site behaviour.
   Vanilla JS. GSAP/ScrollTrigger enhance motion when present; everything works without them. */
(function () {
  "use strict";

  var doc = document.documentElement;
  var CFG = window.SITE_CONFIG || {};
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var money = function (n) { return "$" + Math.round(n).toLocaleString("en-CA"); };

  // Pages always open at the top (unless a #section is requested), so a restored scroll can't tuck the hero under the header.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  // Instant, and only until the reader takes over: a late image load must never drag them back up.
  var touched = false;
  ["wheel", "touchstart", "keydown", "pointerdown"].forEach(function (t) { window.addEventListener(t, function () { touched = true; }, { passive: true, once: true }); });
  var toTop = function () { if (!location.hash && !touched && window.scrollY) window.scrollTo({ top: 0, left: 0, behavior: "instant" }); };
  toTop();
  window.addEventListener("load", toTop);
  window.addEventListener("pageshow", function (e) { if (e.persisted) { touched = false; toTop(); } });

  doc.classList.remove("no-js");
  doc.classList.add("js");
  if (reduced) doc.classList.add("reduced");

  /* ---------- Preloader (once per session) ---------- */
  function preloader() {
    var el = $(".loader");
    if (!el) return Promise.resolve();
    var seen = false;
    try { seen = sessionStorage.getItem("csp-loaded") === "1"; sessionStorage.setItem("csp-loaded", "1"); } catch (e) {}
    if (seen || reduced) { el.remove(); return Promise.resolve(); }
    document.body.style.overflow = "hidden";
    var count = $(".count", el);
    // Progress follows real loading (fonts + page assets) but never rushes: it eases toward its target
    // and holds a short minimum so the name animation can finish.
    var loaded = false, MIN = 1150, start = performance.now(), shown = 0;
    var done = function () { loaded = true; };
    if (document.readyState === "complete") done(); else window.addEventListener("load", done);
    setTimeout(done, 3500);
    return new Promise(function (resolve) {
      (function tick(now) {
        var t = Math.min(1, (now - start) / MIN);
        var target = loaded ? t : Math.min(t, 0.86);
        shown += (target - shown) * 0.14;
        if (target === 1 && 1 - shown < 0.015) shown = 1;
        el.style.setProperty("--p", shown.toFixed(4));
        if (count) count.textContent = Math.round(shown * 100) + "%";
        if (shown < 1) { requestAnimationFrame(tick); return; }
        el.classList.add("is-leaving");
        setTimeout(function () {
          el.classList.add("is-done");
          document.body.style.overflow = "";
          resolve();
          setTimeout(function () { el.remove(); }, 1300);
        }, 250);
      })(start);
    });
  }


  /* ---------- Header ---------- */
  function header() {
    var h = $(".site-header");
    if (!h) return;
    // Heroes pad themselves by the header's real height, whatever the screen, zoom or font size.
    var navBar = $(".nav-bar", h);
    var measure = function () { doc.style.setProperty("--header-h", Math.ceil(navBar.getBoundingClientRect().bottom - h.getBoundingClientRect().top) + "px"); };
    measure();
    if ("ResizeObserver" in window) new ResizeObserver(measure).observe(navBar);
    window.addEventListener("resize", measure);
    var lastY = window.scrollY;
    function onScroll() {
      var y = window.scrollY;
      h.classList.toggle("is-solid", y > 40);
      var menuOpen = doc.classList.contains("menu-open");
      if (!menuOpen) h.classList.toggle("is-hidden", y > 480 && y > lastY + 4);
      if (y < lastY - 4) h.classList.remove("is-hidden");
      doc.classList.toggle("hdr-hidden", h.classList.contains("is-hidden"));
      lastY = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Services dropdown: hover on desktop, click/keyboard everywhere.
    $$(".has-drop").forEach(function (li) {
      var btn = $("button", li);
      var timer;
      function open() { clearTimeout(timer); li.setAttribute("data-open", ""); btn.setAttribute("aria-expanded", "true"); }
      function close() { timer = setTimeout(function () { li.removeAttribute("data-open"); btn.setAttribute("aria-expanded", "false"); }, 120); }
      li.addEventListener("mouseenter", open);
      li.addEventListener("mouseleave", close);
      btn.addEventListener("click", function () { li.hasAttribute("data-open") ? close() : open(); });
      li.addEventListener("focusout", function (e) { if (!li.contains(e.relatedTarget)) close(); });
      li.addEventListener("keydown", function (e) { if (e.key === "Escape") { close(); btn.focus(); } });
    });

    // Full-screen menu
    var menu = $(".menu");
    var toggle = $(".menu-toggle");
    if (!menu || !toggle) return;
    var closeBtn = $(".menu-close", menu);
    var viaKeys = false;
    function setMenu(open) {
      menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      doc.classList.toggle("menu-open", open);
      document.body.style.overflow = open ? "hidden" : "";
      // Move focus only for keyboard users, so a tap doesn't leave a focus ring on the button.
      if (viaKeys) { if (open) setTimeout(function () { closeBtn.focus(); }, 50); else toggle.focus(); }
    }
    toggle.addEventListener("click", function (e) { viaKeys = e.detail === 0; setMenu(true); });
    closeBtn.addEventListener("click", function (e) { viaKeys = e.detail === 0; setMenu(false); });
    $$(".menu-acc", menu).forEach(function (acc) {
      var b = $("button", acc);
      b.addEventListener("click", function () {
        var on = !acc.classList.contains("is-open");
        acc.classList.toggle("is-open", on);
        b.setAttribute("aria-expanded", on ? "true" : "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) { viaKeys = true; setMenu(false); }
    });
    menu.addEventListener("keydown", function (e) {
      if (e.key === "Tab") {
        var f = $$("a, button", menu);
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { if (menu.classList.contains("is-open")) setMenu(false); }); });
  }

  /* ---------- Text splitting ---------- */
  function splitLines() {
    $$("[data-split]").forEach(function (el) {
      // Lines stay as authored (.ln); every word inside becomes its own span so headlines can rise word by word.
      var w = 0;
      var wrap = function (node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              var sp = document.createElement("span");
              sp.className = "wd"; sp.style.setProperty("--w", w++); sp.textContent = part;
              frag.appendChild(sp);
            });
            n.parentNode.replaceChild(frag, n);
          } else if (n.nodeType === 1) {
            // Inline elements (an italic <em>) move as one word so their gradient and kerning stay intact.
            // A fresh wrapper starts hidden; classing the existing element would fade it out first.
            if (n.matches("em, strong, i, b")) {
              var box = document.createElement("span");
              box.className = "wd"; box.style.setProperty("--w", w++);
              n.parentNode.replaceChild(box, n); box.appendChild(n);
            }
            else wrap(n);
          }
        });
      };
      $$(".ln", el).forEach(function (ln, i) { ln.style.setProperty("--i", i); wrap(ln); });
    });
    $$("[data-scrub-words]").forEach(function (el) {
      var walk = function (node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
              else { var s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.appendChild(s); }
            });
            n.parentNode.replaceChild(frag, n);
          } else if (n.nodeType === 1 && !n.classList.contains("pill-img")) {
            walk(n);
          } else if (n.nodeType === 1) {
            n.classList.add("w");
          }
        });
      };
      walk(el);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  function reveals() {
    $$(".bx-photo, .rit-card figure, .gallery figure, .card figure, .menu-group-media, .ritual figure, .collage figure, .member figure, .person figure, .rounded-img, .band, .pol").forEach(function (el) {
      el.setAttribute("data-reveal", "curtain");
    });
    var items = $$("[data-reveal], [data-split]");
    if (reduced || !("IntersectionObserver" in window)) { items.forEach(function (el) { el.classList.add("is-in"); }); return; }
    // Clip-revealed elements have no visible area until revealed, so watch their parent instead.
    var watched = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        (watched.get(en.target) || []).forEach(function (el) { el.classList.add("is-in"); });
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px 6% 0px", threshold: 0 });
    var vh = window.innerHeight;
    items.forEach(function (el) {
      // Anything already on screen at load reveals straight away, even in the bottom margin.
      // Already on screen: reveal on the next frames, after the start state has painted, so the motion is seen.
      if (el.getBoundingClientRect().top < vh) { requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("is-in"); }); }); return; }
      var mode = el.getAttribute("data-reveal");
      var t = mode === "clip" || mode === "curtain" ? el.parentElement : el;
      if (!watched.has(t)) { watched.set(t, []); io.observe(t); }
      watched.get(t).push(el);
    });
    // Stagger children of grids marked data-stagger
    $$("[data-stagger]").forEach(function (g) {
      $$(":scope > [data-reveal]", g).forEach(function (c, i) { c.style.setProperty("--d", (i % 4) * 0.05 + "s"); });
    });
  }

  /* ---------- Scroll-scrubbed word highlight ---------- */
  function scrubWords() {
    var els = $$("[data-scrub-words]");
    if (!els.length || reduced) return;
    // Page positions are measured once (and again whenever the page's size changes), so scrolling
    // itself never has to ask the browser for layout.
    var boxes = [];
    var measure = function () {
      var sy = window.scrollY;
      boxes = els.map(function (el) { var r = el.getBoundingClientRect(); return { top: r.top + sy, height: r.height }; });
    };
    function update() {
      var vh = window.innerHeight, sy = window.scrollY;
      els.forEach(function (el, k) {
        var r = { top: boxes[k].top - sy, height: boxes[k].height };
        var words = el._w || (el._w = $$(".w", el));
        var p = (vh * 0.98 - r.top) / (r.height * 0.55 + vh * 0.3);
        p = Math.max(0, Math.min(1, p));
        var lit = Math.round(p * words.length), was = el._lit || 0;
        if (lit === was) return;
        // Touch only the words between the old and new edge.
        for (var i = Math.min(lit, was); i < Math.max(lit, was); i++) words[i].classList.toggle("is-lit", i < lit);
        el._lit = lit;
      });
    }
    var queued = false;
    var onScroll = function () { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; update(); }); } };
    window.addEventListener("scroll", onScroll, { passive: true });
    var remeasure = function () { measure(); onScroll(); };
    window.addEventListener("resize", remeasure);
    window.addEventListener("load", remeasure);
    if ("ResizeObserver" in window) new ResizeObserver(remeasure).observe(document.body);
    if (window.ScrollTrigger) window.ScrollTrigger.addEventListener("refresh", remeasure);
    measure();
    update();
  }

  /* ---------- GSAP: parallax + pinned horizontal scroll ---------- */
  function gsapMotion() {
    if (reduced || !window.gsap || !window.ScrollTrigger) return;
    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    $$("[data-parallax]").forEach(function (el) {
      var amt = parseFloat(el.getAttribute("data-parallax")) || 10;
      gsap.fromTo(el, { yPercent: -amt / 2 }, {
        yPercent: amt / 2, ease: "none",
        scrollTrigger: { trigger: el.closest("[data-parallax-root]") || el.parentElement, start: "top bottom", end: "bottom top", scrub: 0.35 }
      });
    });

    var mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", function () {
      $$("[data-hscroll]").forEach(function (wrap) {
        var track = $(".hs-track", wrap);
        var bar = $(".hs-progress i", wrap);
        if (!track) return;
        wrap.classList.add("is-pinned");
        var dist = function () { return Math.max(0, track.scrollWidth - track.clientWidth); };
        var tween = gsap.to(track, {
          x: function () { return -dist(); }, ease: "none",
          scrollTrigger: {
            trigger: wrap, start: "top top+=" + (window.innerHeight * 0.08), end: function () { return "+=" + dist(); },
            pin: true, scrub: 0.3, invalidateOnRefresh: true, anticipatePin: 1,
            onUpdate: function (st) { if (bar) bar.style.width = (st.progress * 100) + "%"; }
          }
        });
        return function () { wrap.classList.remove("is-pinned"); tween.kill(); gsap.set(track, { clearProps: "x" }); };
      });
    });

    // Spa rituals (desktop): the section pins and the intro and cards glide sideways as you scroll down.
    mm.add("(min-width: 1024px)", function () {
      var sec = $("[data-rit-pin]");
      if (!sec) return;
      var row = $(".rit", sec), scroller = $(".rit-scroll", sec), bar = $(".rit-progress i", sec);
      sec.classList.add("is-pinned");
      scroller.classList.add("is-pinned");
      var dist = function () { return Math.max(0, row.offsetWidth - sec.clientWidth); };
      var tween = gsap.to(row, {
        x: function () { return -dist(); }, ease: "none",
        scrollTrigger: {
          trigger: sec, start: "top top", end: function () { return "+=" + dist(); },
          pin: true, scrub: 0.5, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: function (st) { if (bar) bar.style.transform = "scaleX(" + st.progress.toFixed(4) + ")"; }
        }
      });
      // Each photo drifts inside its frame as it crosses the screen.
      $$(".rit-card figure img", sec).forEach(function (im) {
        gsap.fromTo(im, { xPercent: -6, scale: 1.16 }, {
          xPercent: 6, scale: 1.16, ease: "none",
          scrollTrigger: { trigger: im.closest(".rit-card"), containerAnimation: tween, start: "left right", end: "right left", scrub: true }
        });
      });
      return function () { sec.classList.remove("is-pinned"); scroller.classList.remove("is-pinned"); };
    });

    // Hero image drift on mouse move
    var hero = $(".hero-media");
    if (hero && finePointer) {
      var a = $(".hero-img--a", hero), b = $(".hero-img--b", hero);
      var q = function (el, p) { return el ? gsap.quickTo(el, p, { duration: 1.2, ease: "power3.out" }) : function () {}; };
      var ax = q(a, "x"), ay = q(a, "y"), bx = q(b, "x"), by = q(b, "y");
      hero.closest(".hero").addEventListener("mousemove", function (e) {
        var x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
        ax(x * -14); ay(y * -10); bx(x * 22); by(y * 16);
      }, { passive: true });
    }
  }

  /* ---------- Native horizontal scrollers: buttons + drag + progress ---------- */
  function scrollers() {
    $$("[data-scroller]").forEach(function (wrap) {
      var track = $(".hs-track, .reviews-track, .people", wrap) || wrap;
      var prev = $("[data-prev]", wrap.closest("section") || wrap);
      var next = $("[data-next]", wrap.closest("section") || wrap);
      var bar = $(".hs-progress i", wrap);
      var step = function () { var c = track.children[1] || track.children[0]; return c ? c.getBoundingClientRect().width + 16 : 320; };
      if (prev) prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
      if (next) next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });
      if (bar) track.addEventListener("scroll", function () {
        if (wrap.classList.contains("is-pinned")) return;
        var max = track.scrollWidth - track.clientWidth;
        bar.style.width = (max > 0 ? track.scrollLeft / max * 100 : 0) + "%";
      }, { passive: true });
      if (!finePointer) return;
      var down = false, sx = 0, sl = 0, moved = false;
      track.addEventListener("pointerdown", function (e) {
        if (wrap.classList.contains("is-pinned") || e.pointerType !== "mouse") return;
        down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
      });
      window.addEventListener("pointermove", function (e) {
        if (!down) return;
        var dx = e.clientX - sx;
        if (Math.abs(dx) > 5) { moved = true; track.classList.add("is-dragging"); }
        track.scrollLeft = sl - dx;
      });
      window.addEventListener("pointerup", function () {
        if (!down) return;
        down = false;
        setTimeout(function () { track.classList.remove("is-dragging"); }, 0);
      });
      track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    });
  }

  /* ---------- Counters ---------- */
  function counters() {
    var els = $$("[data-count]");
    if (!els.length) return;
    var run = function (el) {
      var end = parseFloat(el.getAttribute("data-count"));
      if (reduced) { el.textContent = end; return; }
      var t0 = performance.now(), dur = 1600;
      (function tick(now) {
        var p = Math.min(1, (now - t0) / dur);
        var e = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(end * e);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    };
    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { run(x.target); io.unobserve(x.target); } });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Open-now status (salon's local time) ---------- */
  function openStatus() {
    var hours = CFG.hours;
    if (!hours) return;
    var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var now = new Date();
    var day, minutes;
    try {
      var parts = new Intl.DateTimeFormat("en-US", { timeZone: CFG.timeZone, weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(now);
      var get = function (t) { var p = parts.filter(function (x) { return x.type === t; })[0]; return p ? p.value : ""; };
      day = SHORT.indexOf(get("weekday"));
      minutes = parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10);
    } catch (e) { day = now.getDay(); minutes = now.getHours() * 60 + now.getMinutes(); }
    var fmt = function (h) { var ap = h >= 12 ? "PM" : "AM"; var hh = h % 12 || 12; return hh + " " + ap; };
    var today = hours[day];
    var open = today && minutes >= today[0] * 60 && minutes < today[1] * 60;
    var label, short;
    if (open) { label = "Open now · until " + fmt(today[1]); short = "Open today until " + fmt(today[1]); }
    else {
      var d = day, guard = 0, nextLabel;
      if (today && minutes < today[0] * 60) nextLabel = "today at " + fmt(today[0]);
      else {
        do { d = (d + 1) % 7; guard++; } while (!hours[d] && guard < 8);
        nextLabel = (guard === 1 ? "tomorrow" : DAYS[d]) + " at " + fmt(hours[d][0]);
      }
      label = "Closed · opens " + nextLabel; short = "Opens " + nextLabel;
    }
    $$("[data-open-status]").forEach(function (el) {
      var mode = el.getAttribute("data-open-status");
      el.innerHTML = '<span class="dot ' + (open ? "dot--live" : "dot--closed") + '"></span><span>' + (mode === "short" ? short : label) + "</span>";
    });
    $$("[data-hours] li[data-day]").forEach(function (li) { li.classList.toggle("is-today", parseInt(li.getAttribute("data-day"), 10) === day); });
  }

  /* ---------- Tabs ---------- */
  function tabs() {
    $$("[data-tabs]").forEach(function (root) {
      var btns = $$('[role="tab"]', root);
      var select = function (b) {
        btns.forEach(function (x) {
          var on = x === b;
          x.setAttribute("aria-selected", on ? "true" : "false");
          x.tabIndex = on ? 0 : -1;
          var p = document.getElementById(x.getAttribute("aria-controls"));
          if (p) p.hidden = !on;
        });
        root.dispatchEvent(new CustomEvent("tabchange", { detail: b.getAttribute("data-value") }));
      };
      btns.forEach(function (b, i) {
        b.addEventListener("click", function () { select(b); });
        b.addEventListener("keydown", function (e) {
          var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (!d) return;
          var n = btns[(i + d + btns.length) % btns.length];
          n.focus(); select(n);
        });
      });
    });
  }

  /* ---------- Filters (team, rituals) ---------- */
  function filters() {
    $$("[data-filter-group]").forEach(function (group) {
      var target = document.getElementById(group.getAttribute("data-filter-group"));
      if (!target) return;
      var items = $$("[data-cat]", target);
      var btns = $$("button[data-filter]", group);
      btns.forEach(function (b) {
        var f = b.getAttribute("data-filter");
        var c = $(".c", b);
        if (c) c.textContent = f === "all" ? items.length : items.filter(function (it) { return it.getAttribute("data-cat").split(" ").indexOf(f) > -1; }).length;
        b.addEventListener("click", function () {
          btns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
          items.forEach(function (it) {
            var show = f === "all" || it.getAttribute("data-cat").split(" ").indexOf(f) > -1;
            it.hidden = !show;
            if (show) { it.classList.remove("is-in"); requestAnimationFrame(function () { it.classList.add("is-in"); }); }
          });
          if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        });
      });
    });
  }

  /* ---------- Massage duration toggle ---------- */
  function durations() {
    $$("[data-duration-group]").forEach(function (root) {
      var btns = $$("[data-duration]", root.querySelector(".seg") || root);
      var prices = $$(".price[data-prices]", root);
      var set = function (d) {
        btns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-duration") === d ? "true" : "false"); });
        prices.forEach(function (p) {
          var map = JSON.parse(p.getAttribute("data-prices"));
          var v = map[d];
          var keys = Object.keys(map), longest = keys[keys.length - 1];
          p.innerHTML = v ? money(v) + "<small>" + d + " min</small>" : money(map[longest]) + '<small class="unavailable">' + longest + " min max</small>";
        });
      };
      btns.forEach(function (b) { b.addEventListener("click", function () { set(b.getAttribute("data-duration")); }); });
      set("60");
    });
  }

  /* ---------- Table search (laser zones) ---------- */
  function tableSearch() {
    $$("[data-search]").forEach(function (input) {
      var table = document.getElementById(input.getAttribute("data-search"));
      var empty = document.getElementById(input.getAttribute("data-search") + "-empty");
      if (!table) return;
      var rows = $$("tbody tr", table);
      input.addEventListener("input", function () {
        var q = input.value.trim().toLowerCase();
        var shown = 0;
        rows.forEach(function (r) { var ok = !q || r.textContent.toLowerCase().indexOf(q) > -1; r.hidden = !ok; if (ok) shown++; });
        if (empty) empty.hidden = shown > 0;
      });
    });
  }

  /* ---------- Menu side-nav active state ---------- */
  function menuNav() {
    var nav = $(".menu-nav");
    if (nav) {
      var queued = false;
      var stuck = function () {
        queued = false;
        var top = parseFloat(getComputedStyle(nav).top) || 0;
        nav.classList.toggle("is-stuck", nav.getBoundingClientRect().top <= top + 1);
      };
      window.addEventListener("scroll", function () { if (!queued) { queued = true; requestAnimationFrame(stuck); } }, { passive: true });
      stuck();
    }
    if (!nav || !("IntersectionObserver" in window)) return;
    var links = $$("a", nav);
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (x.isIntersecting) {
          links.forEach(function (a) { a.classList.remove("is-active"); });
          var a = map[x.target.id];
          if (a) {
            a.classList.add("is-active");
            if (nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: a.offsetLeft - 16, behavior: "smooth" });
          }
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Treatment finder ---------- */
  var FINDER = {
    relax: {
      short: { t: "Swedish <em>massage</em>", d: "Sixty minutes of full-body relaxation that resets mind and muscles. Ask for hot stones or essential oils to make it yours.", p: "60 min · $105", img: "massage-hands", href: "massage.html#massage" },
      half: { t: "Total <em>Peacefulness</em>", d: "A 20-minute infratherapy session followed by a 90-minute Swedish massage. Our most-gifted way to switch off.", p: "2 h · $150", img: "hot-stones", href: "rituals.html#total-peacefulness" },
      day: { t: "Ultimate <em>Relaxation</em>", d: "Aromatic massage, Éminence Kombucha facial, classic manicure and pedicure: the full exhale.", p: "Ritual · $345", img: "ritual-ultimate", href: "rituals.html#ultimate-relaxation" }
    },
    skin: {
      short: { t: "Hydrating <em>Plumping</em> Facial", d: "Our classic: skin analysis, double exfoliation, extractions, masks and a relaxing massage, tailored to your skin.", p: "$115", img: "facial-white", href: "skin.html#facials" },
      half: { t: "Ultimate <em>Signature</em> Facial", d: "Éminence Organics at full strength, with anti-wrinkle eye and mouth care plus a hand and foot massage.", p: "$175", img: "facial-hands", href: "skin.html#facials" },
      day: { t: "Queen <em>for a Day</em>", d: "Kombucha facial, Aroma Spa manicure and pedicure, shampoo and styling, event makeup, and the lounge all day.", p: "4 h · $380", img: "ritual-queen", href: "rituals.html#queen-for-a-day" }
    },
    hair: {
      short: { t: "Cut <em>&amp;</em> Style", d: "Consultation, Aveda stress-relieving shampoo, precision cut and finish with a stylist matched to your hair.", p: "From $60", img: "aveda-bob", href: "hair.html#cut" },
      half: { t: "Colour <em>+</em> Botanical Repair", d: "Aveda plant-powered colour with 100% grey coverage, sealed with a bond-building Botanical Repair treatment.", p: "From $75 + $35", img: "botanical-leaf", href: "hair.html#colour" },
      day: { t: "From Head <em>to Toes</em>", d: "Antioxidant facial or aromatic massage, gel pedicure, scalp massage with hair treatment and a fresh blow-dry.", p: "4 h · $265", img: "ritual-head-to-toe", href: "rituals.html#from-head-to-toes" }
    },
    results: {
      short: { t: "O2 Lift <em>+ LED</em>", d: "Oxygen, plant stem cells and enzymatic botanicals for an instant, visible glow. Add LED light therapy for $25.", p: "$175", img: "led", href: "medispa.html#o2" },
      half: { t: "Mesotherapy <em>&amp; Exosomes</em>", d: "Microneedling with peptide serums and lab-made exosomes to firm, refine pores and fade marks from the first session.", p: "$400 · series pricing", img: "microneedling", href: "medispa.html#mesotherapy" },
      day: { t: "Photo<em>rejuvenation</em> series", d: "Intense light to even tone, calm redness and rebuild collagen with no downtime. Plan 4 to 6 sessions for face and neck.", p: "From $225", img: "photorejuvenation", href: "medispa.html#photorejuvenation" }
    },
    bridal: { t: "Bridal <em>hair &amp; makeup</em>", d: "Trials, the whole wedding party, and our on-location Beauty in Action team. Build your quote in under a minute.", p: "From $90", img: "bridal-curls", href: "weddings.html#quote", cta: "Build my bridal quote" },
    gift: { t: "A gift <em>they'll feel</em>", d: "Gift cards never expire and work on any service, or choose a ready-made spa ritual from $109.", p: "Any amount", img: "ritual-mom", href: CFG.giftUrl, cta: "Buy a gift card", ext: true }
  };
  function finder() {
    var root = $("[data-finder]");
    if (!root) return;
    var steps = $$(".finder-step", root);
    var bars = $$(".finder-progress i", root);
    var answers = {};
    var go = function (i) {
      steps.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
      bars.forEach(function (b, k) { b.classList.toggle("is-on", k <= i); });
    };
    var result = function () {
      var r = FINDER[answers.need];
      if (answers.need !== "bridal" && answers.need !== "gift") r = r[answers.time || "short"];
      var out = $(".finder-result", root);
      var forGift = answers.who === "gift" && answers.need !== "gift";
      out.innerHTML =
        '<span class="eyebrow"><span class="num">✦</span> Your match</span>' +
        '<a class="res-card" href="' + r.href + '"' + (r.ext ? ' target="_blank" rel="noopener"' : "") + '>' +
        '<img src="assets/img/' + r.img + '.webp" alt="" loading="lazy">' +
        '<div class="res-body"><span class="mono" style="color:var(--lime)">' + r.p + '</span><h3 class="h3">' + r.t + '</h3><p class="muted">' + r.d + "</p></div></a>" +
        '<div class="btn-row">' +
        '<a class="btn btn--lime" href="' + (r.cta ? r.href : CFG.bookingUrl) + '"' + (r.ext || !r.cta ? ' target="_blank" rel="noopener"' : "") + ">" + (r.cta || "Book this") + ' <span class="ic">' + ARROW + "</span></a>" +
        (forGift ? '<a class="btn btn--ghost" href="' + CFG.giftUrl + '" target="_blank" rel="noopener">Send it as a gift <span class="ic">' + ARROW + "</span></a>" : '<a class="btn btn--ghost" href="' + r.href + '">See details <span class="ic">' + ARROW + "</span></a>") +
        "</div>" +
        (answers.who === "two" ? '<p class="muted" style="font-size:.9rem">Booking for two? Call <a href="tel:' + CFG.phone + '" style="text-decoration:underline">450 455-7999</a> and we will line up your appointments together.</p>' : "");
      go(steps.length - 1);
    };
    $$(".finder-opts button", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var step = b.closest(".finder-step");
        var key = step.getAttribute("data-key");
        answers[key] = b.getAttribute("data-value");
        $$("button", step).forEach(function (x) { x.classList.toggle("is-picked", x === b); });
        var idx = steps.indexOf(step);
        setTimeout(function () {
          if (b.hasAttribute("data-final") || idx >= steps.length - 2) result();
          else go(idx + 1);
        }, 260);
      });
    });
    $$("[data-finder-restart]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        answers = {};
        $$(".is-picked", root).forEach(function (x) { x.classList.remove("is-picked"); });
        go(0);
      });
    });
    $$("[data-finder-back]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var i = steps.indexOf(b.closest(".finder-step"));
        go(Math.max(0, i - 1));
      });
    });
  }

  /* ---------- Wedding quote builder ---------- */
  // Prices from the salon's published wedding menu. [min, max]. Minutes are planning estimates.
  var QB_ITEMS = {
    salon: [
      { id: "b_hair", group: "bride", kind: "toggle", label: "Bride updo", note: "Your wedding-day hairstyle", price: [90, 125], min: 75, type: "hair" },
      { id: "b_makeup", group: "bride", kind: "toggle", label: "Bride makeup", note: "Day-of-wedding makeup", price: [85, 100], min: 60, type: "makeup" },
      { id: "b_htrial", group: "bride", kind: "toggle", label: "Hair trial", note: "Recommended, at the salon", price: [75, 100], trial: true },
      { id: "b_mtrial", group: "bride", kind: "toggle", label: "Makeup trial", note: "Recommended, at the salon", price: [75, 100], trial: true },
      { id: "b_lash", group: "bride", kind: "toggle", label: "False lashes for the bride", price: [10, 10] },
      { id: "p_half", group: "party", kind: "count", label: "Half-up hairstyles", note: "Bridesmaids, mothers, guests", price: [85, 95], min: 50, type: "hair", person: true },
      { id: "p_short", group: "party", kind: "count", label: "Blow-dry, short hair", price: [55, 65], min: 35, type: "hair", person: true },
      { id: "p_long", group: "party", kind: "count", label: "Blow-dry, long hair", price: [65, 85], min: 45, type: "hair", person: true },
      { id: "p_makeup", group: "party", kind: "count", label: "Guest makeup", price: [75, 75], min: 45, type: "makeup", person: true },
      { id: "p_lash", group: "party", kind: "count", label: "False lashes for guests", price: [10, 10] },
      { id: "p_fg_hair", group: "party", kind: "count", label: "Flower girl hair", note: "12 years and under", price: [55, 55], min: 30, type: "hair", person: true },
      { id: "p_fg_makeup", group: "party", kind: "count", label: "Flower girl makeup", price: [35, 35], min: 20, type: "makeup" },
      { id: "p_groom_hair", group: "party", kind: "count", label: "Groom hair", price: [45, 45], min: 25, type: "hair", person: true },
      { id: "p_groom_makeup", group: "party", kind: "count", label: "Groom makeup", price: [45, 45], min: 20, type: "makeup" },
      { id: "x_long", group: "extras", kind: "count", label: "Extra-long hair", note: "Per person", price: [25, 25] }
    ],
    location: [
      { id: "b_both", group: "bride", kind: "toggle", label: "Bride hair & makeup", note: "$175 hair + $175 makeup, wherever you get ready", price: [350, 350], min: 75, type: "both" },
      { id: "b_htrial", group: "bride", kind: "toggle", label: "Hair trial", note: "Trials happen at the salon", price: [75, 100], trial: true },
      { id: "b_mtrial", group: "bride", kind: "toggle", label: "Makeup trial", note: "Trials happen at the salon", price: [75, 100], trial: true },
      { id: "p_updo", group: "party", kind: "count", label: "Updos", note: "Bridesmaids & guests", price: [150, 150], min: 60, type: "hair", person: true },
      { id: "p_half", group: "party", kind: "count", label: "Stylized or half-up", price: [125, 125], min: 50, type: "hair", person: true },
      { id: "p_brush", group: "party", kind: "count", label: "Blow-dry styling", price: [85, 85], min: 40, type: "hair", person: true },
      { id: "p_makeup", group: "party", kind: "count", label: "Makeup", price: [125, 125], min: 45, type: "makeup", person: true },
      { id: "p_makeup_lash", group: "party", kind: "count", label: "Makeup with false lashes", price: [145, 145], min: 50, type: "makeup", person: true },
      { id: "x_long", group: "extras", kind: "count", label: "Extra-long hair", note: "Per person", price: [25, 25] },
      { id: "x_travel", group: "extras", kind: "toggle", label: "Venue beyond 15 km", note: "Flat team travel fee", price: [100, 100] }
    ]
  };
  var QB_SUMMARY = /^Bridal quote estimate[\s\S]*?before taxes\n*/;
  function inquiryNote() {
    var note = $("#inquiry [data-qb-added]");
    if (!note) return;
    var msg = $("#inquiry textarea[name=message]");
    $("[data-qb-clear]", note).addEventListener("click", function () {
      msg.value = msg.value.replace(QB_SUMMARY, "");
      msg.dispatchEvent(new Event("input"));
      note.hidden = true;
      msg.focus();
    });
    msg.addEventListener("input", function () { if (!QB_SUMMARY.test(msg.value)) note.hidden = true; });
    if (msg.form) msg.form.addEventListener("reset", function () { note.hidden = true; });
  }
  function quoteBuilder() {
    var root = $("[data-quote]");
    if (!root) return;
    var mode = "salon";
    var state = { salon: { b_hair: 1, b_makeup: 1, b_htrial: 1, b_mtrial: 0, b_lash: 0, p_half: 2, p_makeup: 2 }, location: { b_both: 1, b_htrial: 1, p_updo: 2, p_makeup: 2 } };
    var lists = { bride: $("[data-qb-list=bride]", root), party: $("[data-qb-list=party]", root), extras: $("[data-qb-list=extras]", root) };
    var early = $("#qb-early", root);
    var ready = $("#qb-ready", root);

    function render() {
      Object.keys(lists).forEach(function (g) { lists[g].innerHTML = ""; });
      QB_ITEMS[mode].forEach(function (it) {
        var v = state[mode][it.id] || 0;
        var priceTxt = it.price[0] === it.price[1] ? money(it.price[0]) : money(it.price[0]) + "–" + money(it.price[1]);
        var row = document.createElement("div");
        row.className = "qb-row";
        var ctl = it.kind === "toggle"
          ? '<label class="switch"><input type="checkbox" data-id="' + it.id + '"' + (v ? " checked" : "") + ' aria-label="' + it.label + '"><span></span></label>'
          : '<div class="stepper" role="group" aria-label="' + it.label + '"><button type="button" data-dec="' + it.id + '" aria-label="Fewer">−</button><output aria-live="polite">' + v + '</output><button type="button" data-inc="' + it.id + '" aria-label="More">+</button></div>';
        row.innerHTML = "<div><strong>" + it.label + "</strong><small>" + (it.note ? it.note + " · " : "") + priceTxt + (it.kind === "count" ? " each" : "") + "</small></div>" + ctl;
        lists[it.group].appendChild(row);
      });
      calc();
    }

    function calc() {
      var lo = 0, hi = 0, lines = [], hairPeople = 0, makeupPeople = 0, hairMin = 0, makeupMin = 0, brideIn = false;
      QB_ITEMS[mode].forEach(function (it) {
        var v = state[mode][it.id] || 0;
        if (!v) return;
        lo += it.price[0] * v; hi += it.price[1] * v;
        var amt = it.price[0] === it.price[1] ? money(it.price[0] * v) : money(it.price[0] * v) + "–" + money(it.price[1] * v);
        lines.push("<li><span>" + (v > 1 ? v + " × " : "") + it.label + "</span><span>" + amt + "</span></li>");
        if (it.person && it.type === "hair") hairPeople += v;
        if (it.person && it.type === "makeup") makeupPeople += v;
        if (it.group === "bride" && !it.trial && it.min) brideIn = true;
        if (it.min && !it.trial) {
          if (it.type === "hair" || it.type === "both") hairMin += it.min * v;
          if (it.type === "makeup" || it.type === "both") makeupMin += (it.type === "both" ? 50 : it.min) * v;
        }
      });
      // Guests often get both hair and makeup, so the chair count is the larger of the two groups.
      var people = Math.max(hairPeople, makeupPeople) + (brideIn ? 1 : 0);
      // Early start fee applies per person in the chair before 8 AM.
      var startMin = null;
      if (ready && ready.value) {
        var parts = ready.value.split(":");
        var readyAt = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        var artists = people > 6 ? 3 : 2;
        var span = Math.max(hairMin / artists, makeupMin / Math.max(1, artists - 1)) + 20;
        startMin = Math.round((readyAt - span) / 15) * 15;
      }
      var isEarly = (early && early.checked) || (startMin !== null && startMin < 8 * 60);
      if (isEarly && people) {
        lo += 25 * people; hi += 25 * people;
        lines.push("<li><span>Early start (7–8 AM) × " + people + "</span><span>" + money(25 * people) + "</span></li>");
      }
      $("[data-qb-lines]", root).innerHTML = lines.length ? lines.join("") : '<li class="empty">Add a service to start your estimate.</li>';
      $("[data-qb-total]", root).innerHTML = lo === hi ? money(lo) : money(lo) + '<span class="to">to</span>' + money(hi);
      var mini = $("[data-qb-total-mini]", root);
      if (mini) mini.textContent = lo === hi ? money(lo) : money(lo) + "–" + money(hi);
      $("[data-qb-people]", root).textContent = people + (people === 1 ? " person" : " people") + " getting ready";
      var minAlert = $("[data-qb-min]", root);
      if (minAlert) minAlert.hidden = !(mode === "location" && people > 0 && people < 4);
      var sched = $("[data-qb-start]", root);
      if (sched) {
        if (startMin === null || !people) sched.textContent = "—";
        else {
          var h = Math.floor(startMin / 60), m = startMin % 60;
          if (startMin < 6 * 60) sched.textContent = "Before 6 AM: let's talk";
          else sched.textContent = ((h % 12) || 12) + ":" + String(m).padStart(2, "0") + (h >= 12 ? " PM" : " AM");
        }
      }
      var earlyNote = $("[data-qb-early-note]", root);
      if (earlyNote) earlyNote.hidden = !(startMin !== null && startMin < 8 * 60 && people);
      root.setAttribute("data-summary", summaryText(lo, hi, people, startMin));
      root.setAttribute("data-people", people);
    }

    function summaryText(lo, hi, people, startMin) {
      var out = ["Bridal quote estimate (" + (mode === "salon" ? "in salon" : "Beauty in Action, on location") + ")"];
      QB_ITEMS[mode].forEach(function (it) {
        var v = state[mode][it.id] || 0;
        if (v) out.push("- " + (v > 1 ? v + " × " : "") + it.label);
      });
      if (ready && ready.value) out.push("Ready by: " + ready.value + (startMin !== null ? " (suggested start " + Math.floor(startMin / 60) + ":" + String(startMin % 60).padStart(2, "0") + ")" : ""));
      out.push("People: " + people);
      out.push("Estimate: " + (lo === hi ? money(lo) : money(lo) + " to " + money(hi)) + " before taxes");
      return out.join("\n");
    }

    root.addEventListener("click", function (e) {
      var inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]");
      if (!inc && !dec) return;
      var id = (inc || dec).getAttribute(inc ? "data-inc" : "data-dec");
      var v = (state[mode][id] || 0) + (inc ? 1 : -1);
      state[mode][id] = Math.max(0, Math.min(20, v));
      (inc || dec).parentNode.querySelector("output").textContent = state[mode][id];
      calc();
    });
    root.addEventListener("change", function (e) {
      var id = e.target.getAttribute("data-id");
      if (id) state[mode][id] = e.target.checked ? 1 : 0;
      calc();
    });
    if (ready) ready.addEventListener("input", calc);
    var modeTabs = $("[data-qb-mode]", root);
    if (modeTabs) modeTabs.addEventListener("tabchange", function (e) { mode = e.detail; render(); });
    $$("[data-qb-send]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        var msg = document.querySelector("#inquiry textarea[name=message]");
        if (msg) {
          // Replace an earlier estimate rather than stacking them, and keep whatever the guest wrote.
          msg.value = root.getAttribute("data-summary") + "\n\n" + msg.value.replace(QB_SUMMARY, "");
          msg.dispatchEvent(new Event("input"));
          var note = document.querySelector("#inquiry [data-qb-added]");
          if (note) note.hidden = false;
        }
        // Carry the quote's party size and place into the form, so the two always agree.
        var size = document.querySelector("#inquiry input[name=party_size]"), where = document.querySelector("#inquiry select[name=location]");
        var people = +root.getAttribute("data-people");
        if (size && people) size.value = people;
        if (where) where.value = mode === "salon" ? "The salon" : (state.location.x_travel ? "Venue beyond 15 km" : "Home or hotel (within 15 km)");
        var target = document.getElementById("inquiry");
        if (target) {
          target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
          setTimeout(function () { var f = target.querySelector("input"); if (f) f.focus({ preventScroll: true }); }, 900);
        }
      });
    });
    render();
  }

  /* ---------- Forms: endpoint or pre-filled email ---------- */
  function forms() {
    $$("form[data-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.reportValidity()) return;
        var data = {};
        new FormData(form).forEach(function (v, k) { data[k] = v; });
        var subject = form.getAttribute("data-subject") || "Website inquiry";
        var status = $(".form-status", form);
        var done = function (msg) {
          if (status) { status.textContent = msg; status.classList.add("is-shown"); }
          form.reset();
        };
        if (CFG.formEndpoint) {
          data._subject = subject;
          fetch(CFG.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) })
            .then(function (r) { if (!r.ok) throw new Error(); done(form.getAttribute("data-success") || "Thank you! We'll be in touch within one business day."); })
            .catch(function () { mailto(subject, data); });
        } else {
          mailto(subject, data);
          done("Your email app is opening with everything filled in. Just press send.");
        }
      });
    });
    function mailto(subject, data) {
      var body = Object.keys(data).map(function (k) { return k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, " ") + ": " + data[k]; }).join("\n");
      window.location.href = "mailto:" + CFG.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    }
  }

  /* ---------- Field helpers: birthday, phone, date hint, growing message boxes ---------- */
  function fields() {
    var DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    // Birthday: digits only, typed straight into MM/DD, and only real dates pass.
    $$("input.bday").forEach(function (el) {
      var check = function () {
        var m = /^(\d{2})\/(\d{2})$/.exec(el.value), ok = !el.value;
        if (m) { var mo = +m[1], d = +m[2]; ok = mo >= 1 && mo <= 12 && d >= 1 && d <= DAYS[mo - 1]; }
        el.setCustomValidity(ok ? "" : "Please enter your birthday as MM/DD, for example 07/14.");
      };
      el.addEventListener("input", function (e) {
        var deleting = e.inputType && e.inputType.indexOf("delete") === 0;
        var d = el.value.replace(/\D/g, "").slice(0, 4);
        if (d.length === 1 && +d > 1) d = "0" + d;                       // "4" means April
        if (d.length >= 2 && +d.slice(0, 2) > 12) d = "0" + d.slice(0, 1) + d.slice(1, 3);
        if (d.length >= 3 && +d[2] > 3) d = d.slice(0, 2) + "0" + d[2];   // "07/5" means the 5th
        el.value = d.length > 2 || (d.length === 2 && !deleting) ? d.slice(0, 2) + "/" + d.slice(2) : d;
        check();
      });
      el.addEventListener("blur", check);
      check();
    });
    // Phone: only characters a phone number uses, and at least a full local number.
    $$('input[type="tel"]').forEach(function (el) {
      var check = function () {
        var n = el.value.replace(/\D/g, "").length;
        el.setCustomValidity(!el.value || (n >= 10 && n <= 15) ? "" : "Please enter a full phone number, for example 450 555-0123.");
      };
      el.addEventListener("input", function () {
        var clean = el.value.replace(/[^0-9+()\-.\s]/g, "");
        if (clean !== el.value) el.value = clean;
        check();
      });
      check();
    });
    // Date: show a hint until a date is picked (date inputs ignore placeholder).
    $$(".date-wrap").forEach(function (wrap) {
      var el = $("input", wrap);
      var sync = function () { wrap.classList.toggle("has-value", !!el.value); };
      el.addEventListener("input", sync); el.addEventListener("change", sync);
      if (el.form) el.form.addEventListener("reset", function () { setTimeout(sync, 0); });
      sync();
    });
    // Message boxes grow with their text instead of hiding it behind a scrollbar.
    $$(".field textarea").forEach(function (t) {
      var fit = function () { t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight + 2, window.innerHeight * 0.6) + "px"; };
      t.addEventListener("input", fit);
      if (t.form) t.form.addEventListener("reset", function () { setTimeout(fit, 0); });
      if (t.value) fit();
    });
  }

  /* ---------- Magnetic buttons ---------- */
  function magnetic() {
    if (!finePointer || reduced) return;
    $$(".btn, .svc .arrow, .round-btns button").forEach(function (el) {
      var r = null, ex = 0, ey = 0, raf = 0;
      var paint = function () {
        raf = 0;
        if (!r) return;
        el.style.transform = "translate(" + (ex - r.left - r.width / 2) * 0.18 + "px," + (ey - r.top - r.height / 2) * 0.3 + "px)";
      };
      // Measure with the pull removed, so the rect is the button's true resting place.
      el.addEventListener("mouseenter", function () { el.style.transform = ""; r = el.getBoundingClientRect(); });
      el.addEventListener("mousemove", function (e) {
        if (!r) r = el.getBoundingClientRect();
        ex = e.clientX; ey = e.clientY;
        if (!raf) raf = requestAnimationFrame(paint);
      }, { passive: true });
      el.addEventListener("mouseleave", function () { r = null; if (raf) { cancelAnimationFrame(raf); raf = 0; } el.style.transform = ""; });
      window.addEventListener("scroll", function () { r = null; }, { passive: true });
    });
  }

  var ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';

  function yearStamp() { $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); }); }


  /* ---------- Arch hero: curtain slides, breathing guide, pointer depth ---------- */
  function archHero() {
    var root = $("[data-hx]");
    if (root) {
      var slides = $$(".hx-slide", root), num = $("[data-hx-n]", root), cap = $("[data-hx-cap]", root);
      var i = 0, timer = null;
      var show = function (n) {
        var prev = slides[i];
        i = (n + slides.length) % slides.length;
        slides.forEach(function (sl) { sl.classList.remove("is-prev"); });
        prev.classList.remove("is-active"); prev.classList.add("is-prev");
        void slides[i].offsetWidth;
        slides[i].classList.add("is-active");
        if (num) num.textContent = String(i + 1).padStart(2, "0");
        if (cap) cap.textContent = slides[i].getAttribute("data-caption");
      };
      var play = function () { clearInterval(timer); if (!reduced && slides.length > 1) timer = setInterval(function () { show(i + 1); }, 6500); };
      document.addEventListener("visibilitychange", function () { if (document.hidden) clearInterval(timer); else play(); });
      play();
    }
    // The guide's words follow the ring: it grows for four seconds (in), then shrinks for four (out).
    $$(".hx-breath").forEach(function (b) {
      var ring = $(".hx-breath-ring i", b), label = $("[data-breath]", b), inhale = true;
      if (!ring || reduced) return;
      ring.addEventListener("animationiteration", function () {
        inhale = !inhale;
        label.classList.add("is-fading");
        setTimeout(function () { label.textContent = inhale ? "Breathe in" : "Breathe out"; label.classList.remove("is-fading"); }, 350);
      });
    });
    if (reduced || !finePointer) return;
    $$("[data-hx-art]").forEach(function (art) {
      var hero = art.closest(".hx");
      var layers = $$("[data-depth]", art).map(function (el) { return [el, parseFloat(el.getAttribute("data-depth"))]; });
      var rings = $(".hx-rings", art);
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      var tick = function () {
        cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07;
        layers.forEach(function (l) { l[0].style.transform = "translate3d(" + (cx * l[1]).toFixed(2) + "px," + (cy * l[1]).toFixed(2) + "px,0)"; });
        if (rings) rings.style.transform = "translate(-50%,-50%) rotate(" + (cx * 6).toFixed(2) + "deg)";
        raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.0005 ? requestAnimationFrame(tick) : null;
      };
      hero.addEventListener("mousemove", function (e) {
        var r = hero.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5;
        if (!raf) raf = requestAnimationFrame(tick);
      });
    });
  }

  /* ---------- Custom cursor ---------- */
  function cursor() {
    if (!finePointer || reduced) return;
    var c = document.createElement("div");
    c.className = "cursor"; c.setAttribute("aria-hidden", "true");
    c.innerHTML = "<span></span>";
    document.body.appendChild(c);
    var label = c.firstChild, x = -100, y = -100, cx = x, cy = y, raf = 0;
    var loop = function () {
      cx += (x - cx) * 0.42; cy += (y - cy) * 0.42;
      if (Math.abs(x - cx) < 0.1 && Math.abs(y - cy) < 0.1) { cx = x; cy = y; raf = 0; }
      else raf = requestAnimationFrame(loop);
      c.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
    };
    window.addEventListener("mousemove", function (e) {
      x = e.clientX; y = e.clientY;
      if (!c.classList.contains("is-on")) { cx = x; cy = y; c.classList.add("is-on"); }
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    document.addEventListener("mouseleave", function () { c.classList.remove("is-on"); });
    document.addEventListener("mouseover", function (e) {
      var t = e.target.closest("[data-cursor], a, button, summary, label, input, select, textarea");
      c.classList.remove("is-link", "is-label", "is-hidden");
      if (!t) return;
      if (t.matches("input, select, textarea")) { c.classList.add("is-hidden"); return; }
      var l = t.getAttribute("data-cursor");
      if (l) { label.textContent = l; c.classList.add("is-label"); }
      else c.classList.add("is-link");
    });
  }

  /* ---------- Page transitions between internal pages ----------
     The cover is in every page's HTML, and the head script marks html.pt-enter before first paint,
     so an arriving page is never seen uncovered. Leaving waits for the cover to close fully. */
  var PT_LABELS = { "index.html": "Home", "weddings.html": "Weddings", "hair.html": "Hair & Makeup", "skin.html": "Skin & Esthetics",
    "massage.html": "Massage & Body", "medispa.html": "Medispa & Laser", "rituals.html": "Spa rituals", "team.html": "The team",
    "about.html": "About Carole", "visit.html": "Visit & FAQ", "privacy.html": "Privacy" };
  var ptEntered = Promise.resolve();
  function transitions() {
    var pt = $(".pt");
    if (!pt) return;
    try { sessionStorage.removeItem("csp-pt"); } catch (e) {}
    if (doc.classList.contains("pt-enter")) {
      ptEntered = new Promise(function (resolve) {
        pt.classList.add("is-cover");
        doc.classList.remove("pt-enter");
        // Hold the brand a beat (once the first frame is painted), then lift the cover away.
        requestAnimationFrame(function () {
          setTimeout(function () {
            pt.classList.add("is-exit");
            resolve();
            setTimeout(function () { pt.classList.add("no-anim"); pt.classList.remove("is-cover", "is-exit"); void pt.offsetWidth; pt.classList.remove("no-anim"); }, 700);
          }, 140);
        });
      });
    }
    if (reduced) return;
    var leaving = false;
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a[href]");
      if (!a || leaving || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || a.target === "_blank") return;
      var href = a.getAttribute("href");
      if (!/^[a-z0-9-]+\.html(#.*)?$/i.test(href)) return;
      var here = location.pathname.split("/").pop() || "index.html";
      var dest = href.split("#")[0];
      if (dest === here) return;
      e.preventDefault();
      leaving = true;
      $("[data-pt-to]", pt).textContent = PT_LABELS[dest] || "";
      try { sessionStorage.setItem("csp-pt", "1"); } catch (err) {}
      var go = function () { location.href = href; };
      var timer = setTimeout(go, 650);
      pt.addEventListener("transitionend", function te(ev) {
        if (ev.target !== pt || ev.propertyName !== "clip-path") return;
        pt.removeEventListener("transitionend", te);
        clearTimeout(timer);
        go();
      });
      pt.classList.add("is-leaving");
    });
    window.addEventListener("pageshow", function (ev) {
      if (ev.persisted) { leaving = false; pt.classList.add("no-anim"); pt.className = "pt"; }
    });
  }

  /* ---------- Prefetch internal pages on hover/touch (browsers without speculation rules) ---------- */
  function prefetch() {
    if (HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules")) return;
    var rel = document.createElement("link").relList;
    if (!rel || !rel.supports || !rel.supports("prefetch")) return;
    var done = {};
    var warm = function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      var href = a.getAttribute("href").split("#")[0];
      if (!/^[a-z0-9-]+\.html$/i.test(href) || done[href] || href === (location.pathname.split("/").pop() || "index.html")) return;
      done[href] = 1;
      var l = document.createElement("link"); l.rel = "prefetch"; l.href = href; document.head.appendChild(l);
    };
    document.addEventListener("pointerover", warm, { passive: true });
    document.addEventListener("touchstart", warm, { passive: true });
    document.addEventListener("focusin", warm);
  }

  /* ---------- Auto-scrolling strips: load every photo before the strip arrives ---------- */
  function eagerStrips() {
    var strips = $$(".ribbon, .marquee, .partners-mask");
    var load = function (el) { $$('img[loading="lazy"]', el).forEach(function (img) { img.loading = "eager"; }); };
    if (!("IntersectionObserver" in window)) { strips.forEach(load); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { load(x.target); io.unobserve(x.target); } });
    }, { rootMargin: "800px 0px" });
    strips.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Photo sliders: autoplay while visible, swipe, dots ---------- */
  function sliders() {
    $$("[data-gslide]").forEach(function (el) {
      var figs = $$(".gs", el), dots = $$(".gs-dots button", el);
      var i = 0, timer = null, visible = false, DUR = 5200;
      el.style.setProperty("--gs-dur", DUR + "ms");
      var go = function (n) {
        i = (n + figs.length) % figs.length;
        figs.forEach(function (f, k) { f.classList.toggle("is-active", k === i); });
        dots.forEach(function (d, k) { d.classList.remove("is-active"); d.classList.toggle("is-done", k < i); });
        void el.offsetWidth; if (dots[i]) dots[i].classList.add("is-active");
      };
      var play = function () { clearInterval(timer); if (visible && !reduced) timer = setInterval(function () { go(i + 1); }, DUR); };
      dots.forEach(function (d, k) { d.addEventListener("click", function () { go(k); play(); }); });
      var sx = null;
      el.addEventListener("pointerdown", function (e) { sx = e.clientX; });
      el.addEventListener("pointerup", function (e) { if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 40) { go(i + (dx < 0 ? 1 : -1)); play(); } });
      el.addEventListener("mouseenter", function () { el.classList.add("is-paused"); clearInterval(timer); });
      el.addEventListener("mouseleave", function () { el.classList.remove("is-paused"); go(i); play(); });
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (en) {
          visible = en[0].isIntersecting;
          if (visible) { go(i); play(); } else clearInterval(timer);
        }, { threshold: 0.3 }).observe(el);
      } else { visible = true; play(); }
    });
  }

  /* ---------- Footer signature: letters rise in as the footer arrives ---------- */
  // Looping animations only run while their section is on screen.
  function pauseOffscreen() {
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle("is-off", !e.isIntersecting); });
    }, { rootMargin: "120px 0px" });
    document.querySelectorAll("main > section, main > div > section, .site-footer").forEach(function (el) { io.observe(el); });
  }

  function footerWord() {
    var el = $("[data-footer-word]");
    if (!el) return;
    if (reduced || !("IntersectionObserver" in window)) { el.classList.add("is-in"); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { el.classList.toggle("is-in", x.isIntersecting); });
    }, { threshold: 0.25 });
    io.observe(el);
  }

  /* ---------- Boot ---------- */
  transitions();
  prefetch();
  eagerStrips();
  splitLines();
  archHero();
  sliders();
  footerWord();
  pauseOffscreen();
  cursor();
  header();
  openStatus();
  tabs();
  filters();
  durations();
  tableSearch();
  menuNav();
  finder();
  quoteBuilder();
  fields();
  inquiryNote();
  forms();
  scrollers();
  counters();
  yearStamp();
  magnetic();
  gsapMotion();
  scrubWords();
  preloader().then(function () { return ptEntered; }).then(function () {
    $$(".hx").forEach(function (el) { el.classList.add("is-ready"); });
    reveals();
  });
})();
