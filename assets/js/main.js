document.addEventListener("DOMContentLoaded", () => {
  const CONTENT = {
   settings: "/content/site-settings.json",
   home: "/content/home.json",
   projects: "/content/projects.json",
 };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const setText = (sel, value) => {
    const el = typeof sel === "string" ? $(sel) : sel;
    if (!el) return;
    if (value === undefined || value === null) return;
    el.textContent = String(value);
  };

  const setHTML = (sel, value) => {
    const el = typeof sel === "string" ? $(sel) : sel;
    if (!el) return;
    if (value === undefined || value === null) return;
    el.innerHTML = String(value);
  };

  const setAttr = (sel, attr, value) => {
    const el = typeof sel === "string" ? $(sel) : sel;
    if (!el) return;
    if (value === null || value === undefined || value === "") el.removeAttribute(attr);
    else el.setAttribute(attr, String(value));
  };

  const setImage = (imgSel, { src, alt, loading } = {}) => {
    const img = typeof imgSel === "string" ? $(imgSel) : imgSel;
    if (!img) return;
    if (src) img.src = src;
    if (alt !== undefined && alt !== null) img.alt = String(alt);
    if (loading) img.loading = loading;
  };

  async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`fetch failed: ${url}`);
    return await res.json();
  }

  /* ─────────────────────────────────────────────
     CONTENT LOADER
  ────────────────────────────────────────────── */
  let SITE = null;
  let HOME = null;
  let PROJECTS = null;

  async function loadContent() {
    [SITE, HOME, PROJECTS] = await Promise.all([
      fetchJSON(CONTENT.settings),
      fetchJSON(CONTENT.home),
      fetchJSON(CONTENT.projects),
    ]);
  }

  function applySiteSettings() {
    if (!SITE) return;

    if (SITE.meta?.title) document.title = SITE.meta.title;
    if (SITE.meta?.description) {
      const md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute("content", SITE.meta.description);
    }

    if (SITE.brand?.logoUrl) {
      $$("#brandLogo, #brandLogoMobile, #brandLogoFooter, #brandLogoPreloader").forEach((img) => {
        setImage(img, { src: SITE.brand.logoUrl, alt: SITE.brand.name ?? "Logo" });
      });
    }
    if (SITE.brand?.name) {
      setAttr("#brandLogo", "alt", SITE.brand.name);
      setAttr("#brandLogoMobile", "alt", SITE.brand.name);
      setAttr("#brandLogoFooter", "alt", SITE.brand.name);
      setAttr("#brandLogoPreloader", "alt", SITE.brand.name);
    }

    if (SITE.nav?.ctaLabel) setText("#navCtaLabel", SITE.nav.ctaLabel);

    setHTML("#contactAddressValue", SITE.contact?.addressHtml);
    setText("#contactPhoneLabel", SITE.contact?.phoneLabel);
    setAttr("#contactPhoneLink", "href", SITE.contact?.phoneHref);
    setText("#contactPhoneLink", SITE.contact?.phoneText);
    setText("#contactEmailLabel", SITE.contact?.emailLabel);
    setAttr("#contactEmailLink", "href", SITE.contact?.emailHref);
    setText("#contactEmailLink", SITE.contact?.emailText);
    setHTML("#contactHoursValue", SITE.contact?.hoursHtml);

    setText("#locName", SITE.brand?.name);
    setText("#locAddressLine", SITE.contact?.addressLine);
    if (SITE.localisation?.hours && Array.isArray(SITE.localisation.hours)) {
      const wrap = $("#locHours");
      if (wrap) {
        wrap.innerHTML = SITE.localisation.hours
          .map((h) => `<div class="lh-item"><strong>${h.label}</strong>${h.value}</div>`)
          .join("");
      }
    }
    setAttr("#locMap", "src", SITE.localisation?.mapEmbedUrl);

    setText("#footerTagline", SITE.footer?.tagline);
    setText("#footerDescription", SITE.footer?.description);
    setText("#footerCopyright", SITE.footer?.copyright);
    if (SITE.footer?.legalLinks && Array.isArray(SITE.footer.legalLinks)) {
      const wrap = $("#footerLegalLinks");
      if (wrap) {
        wrap.innerHTML = SITE.footer.legalLinks
          .map((l) => `<a href="${l.href ?? "#"}">${l.label ?? ""}</a>`)
          .join("");
      }
    }

    if (SITE.socials?.instagramHref) setAttr("#socialInstagram", "href", SITE.socials.instagramHref);
    if (SITE.socials?.facebookHref)  setAttr("#socialFacebook",  "href", SITE.socials.facebookHref);
    if (SITE.socials?.emailHref)     setAttr("#socialEmail",     "href", SITE.socials.emailHref);
  }

  function applyHome() {
    if (!HOME) return;

    setText("#heroEyebrow", HOME.hero?.eyebrow);
    setHTML("#heroTagline", HOME.hero?.taglineHtml);
    setText("#heroSideText", HOME.hero?.sideText);
    setAttr("#heroVideoSource", "src", HOME.hero?.videoUrl);
    const heroVideo = $("#heroVideo");
    if (heroVideo) heroVideo.load();

    if (HOME.hero?.ctaPrimary) {
      setAttr("#heroCtaPrimary", "href", HOME.hero.ctaPrimary.href);
      setText("#heroCtaPrimaryLabel", HOME.hero.ctaPrimary.label);
    }
    if (HOME.hero?.ctaSecondary) {
      setAttr("#heroCtaSecondary", "href", HOME.hero.ctaSecondary.href);
      setText("#heroCtaSecondaryLabel", HOME.hero.ctaSecondary.label);
    }

    if (HOME.hero?.marquee && Array.isArray(HOME.hero.marquee)) {
      const track = $("#heroMarqueeTrack");
      if (track) {
        const seq = HOME.hero.marquee
          .flatMap((t) => [`<span>${t}</span>`, `<span class="m-dot">·</span>`])
          .slice(0, -1);
        track.innerHTML = seq.concat(seq).join("");
      }
    }

    setText("#manifesteLabel", HOME.manifeste?.label);
    setHTML("#manifesteTitle", HOME.manifeste?.titleHtml);
    const pWrap = $("#manifesteParagraphs");
    if (pWrap) {
      const ps = HOME.manifeste?.paragraphs ?? [];
      if (Array.isArray(ps) && ps.length) {
        pWrap.innerHTML = ps.map((t, i) => `<p class="fade-up d${Math.min(6, i + 2)}">${t}</p>`).join("");
      }
    }
    setText("#manifesteNote", HOME.manifeste?.noteHtml);
    if (HOME.manifeste?.images && Array.isArray(HOME.manifeste.images)) {
      HOME.manifeste.images.slice(0, 3).forEach((img, i) => {
        setImage(`#manifesteImg${i + 1}`, { src: img.src, alt: img.alt ?? "", loading: "lazy" });
        setText(`#manifesteImg${i + 1}Ph`, img.ph);
      });
    }

    setText("#processusLabel", HOME.processus?.label);
    setHTML("#processusTitle", HOME.processus?.titleHtml);
    setText("#processusIntro", HOME.processus?.intro);
    if (HOME.processus?.cta) {
      setAttr("#processusCta", "href", HOME.processus.cta.href);
      setText("#processusCtaLabel", HOME.processus.cta.label);
    }
    if (HOME.processus?.steps && Array.isArray(HOME.processus.steps)) {
      const stepsWrap = $("#processusStepsList");
      if (stepsWrap) {
        const steps = HOME.processus.steps.filter((s) => s?.title || s?.text);
        if (steps.length) {
          stepsWrap.innerHTML = steps
            .map((s, idx) => {
              const num = String(idx + 1).padStart(2, "0");
              return `
                <div class="step${idx === 0 ? " active" : ""}">
                  <div class="step-dot"></div>
                  <span class="step-num">${num}</span>
                  <h3>${s.title ?? ""}</h3>
                  <p>${s.text ?? ""}</p>
                </div>`;
            })
            .join("");
        }
      }
    }

    setText("#atelierLabel", HOME.atelier?.label);
    setHTML("#atelierTitle", HOME.atelier?.titleHtml);
    setText("#atelierQuoteText", HOME.atelier?.quote?.text);
    setText("#atelierQuoteCite", HOME.atelier?.quote?.cite);
    const aRight = $("#atelierRightText");
    if (aRight) {
      const ps = HOME.atelier?.rightParagraphs ?? [];
      if (Array.isArray(ps) && ps.length) aRight.innerHTML = ps.map((t) => `<p>${t}</p>`).join("");
    }
    if (HOME.atelier?.stats && Array.isArray(HOME.atelier.stats)) {
      const stats = $("#atelierStats");
      if (stats) {
        const items = HOME.atelier.stats.filter((s) => s?.value || s?.label);
        if (items.length) {
          stats.innerHTML = items
            .map((s, i) => `
              <div class="stat-item fade-up d${Math.min(6, i + 3)}">
                <div class="stat-num" aria-label="${s.ariaLabel ?? ""}">${s.value ?? ""}</div>
                <div class="stat-label">${s.label ?? ""}</div>
              </div>`)
            .join("");
        }
      }
    }

    setText("#contactLabel", HOME.contact?.label);
    setHTML("#contactTitle", HOME.contact?.titleHtml);
    setText("#contactIntro", HOME.contact?.intro);
    setText("#formSubmitLabel", HOME.contact?.formSubmitLabel);
    setHTML("#formSuccessHtml", HOME.contact?.formSuccessHtml);
    if (HOME.contact?.formAction) setAttr("#contactForm", "action", HOME.contact.formAction);
  }

  /* ─────────────────────────────────────────────
     GALLERY LIGHTBOX — singleton injecté dans <body>
  ────────────────────────────────────────────── */
  let GALLERY_DATA = {};
  let glbOpen = false;
  let glbCur  = 0;
  let glbImgs = [];
  let glbPrevFocus = null;
  let glbAutoTimer = null;
  let glbBarTimer  = null;

  function buildLightboxDOM() {
    if ($("#glb")) return; // already injected
    const el = document.createElement("div");
    el.id = "glb";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-hidden", "true");
    el.setAttribute("aria-label", "Galerie de réalisations");
    el.innerHTML = `
      <div class="glb-bg"          id="glbBg"></div>
      <button class="glb-close"    id="glbClose" aria-label="Fermer la galerie">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" width="16" height="16">
          <line x1="18" y1="6"  x2="6"  y2="18"/>
          <line x1="6"  y1="6"  x2="18" y2="18"/>
        </svg>
      </button>
      <div class="glb-top">
        <div class="glb-top-left">
          <div class="glb-cat"           id="glbCat"></div>
          <div class="glb-gallery-title" id="glbTitle"></div>
        </div>
        <div class="glb-top-right">
          <div class="glb-counter" id="glbCounter">
            <strong id="glbCur">01</strong>
            <span class="glb-counter-sep">/</span>
            <span id="glbTotal">01</span>
          </div>
          <div class="glb-nav-group">
            <button class="glb-nav glb-prev" id="glbPrev" aria-label="Photo précédente">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button class="glb-nav glb-next" id="glbNext" aria-label="Photo suivante">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9 6 15 12 9 18"/></svg>
            </button>
          </div>
        </div>
      </div>
      <div class="glb-stage" id="glbStage">
        <div class="glb-img-wrap" id="glbImgWrap"></div>
      </div>
      <div class="glb-bottom">
        <div class="glb-desc"           id="glbDesc"></div>
        <div class="glb-filmstrip-wrap">
          <div class="glb-filmstrip"    id="glbFilmstrip"></div>
        </div>
      </div>
      <div class="glb-progress-bar" id="glbProgressBar"></div>`;
    document.body.appendChild(el);

    // Attach cursor hover listeners to glb buttons (injected after cursor setup runs)
    if (window.matchMedia("(pointer:fine)").matches) {
      el.querySelectorAll("button").forEach((btn) => {
        btn.addEventListener("mouseenter", () => document.body.classList.add("c-hover"));
        btn.addEventListener("mouseleave", () => document.body.classList.remove("c-hover"));
      });
    }
  }

  const pad2 = (n) => String(n).padStart(2, "0");

  function glbGoTo(next) {
    const wrap  = $("#glbImgWrap");
    const strip = $("#glbFilmstrip");
    const bar   = $("#glbProgressBar");
    const cur_el  = $("#glbCur");
    if (!wrap) return;

    const total  = glbImgs.length;
    next = ((next % total) + total) % total;
    if (next === glbCur) return;

    const slides = $$(".glb-slide", wrap);
    const thumbs = $$(".glb-thumb", strip);

    slides[glbCur]?.classList.remove("active");
    slides[glbCur]?.classList.add("leave");
    setTimeout(() => slides[glbCur]?.classList.remove("leave"), 700);

    glbCur = next;
    void slides[glbCur]?.offsetWidth;
    slides[glbCur]?.classList.add("active");

    thumbs.forEach((t, i) => {
      t.classList.toggle("active-t", i === glbCur);
      t.setAttribute("aria-current", String(i === glbCur));
    });
    thumbs[glbCur]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });

    if (cur_el) cur_el.textContent = pad2(glbCur + 1);

    if (bar) {
      bar.classList.remove("running");
      void bar.offsetWidth;
      clearTimeout(glbBarTimer);
      glbBarTimer = setTimeout(() => bar.classList.add("running"), 60);
    }
    glbResetAuto();
  }

  function glbNext() { glbGoTo(glbCur + 1); }
  function glbPrev() { glbGoTo(glbCur - 1); }

  function glbResetAuto() {
    clearInterval(glbAutoTimer);
    if (glbImgs.length > 1) glbAutoTimer = setInterval(glbNext, 5500);
  }

  function openGallery(id) {
    const d = GALLERY_DATA[id];
    if (!d) return;

    glbPrevFocus = document.activeElement;
    glbCur  = 0;
    glbImgs = d.images;
    glbOpen = true;

    const wrap  = $("#glbImgWrap");
    const strip = $("#glbFilmstrip");
    const bar   = $("#glbProgressBar");

    // Update header info
    setText("#glbCat",   d.cat);
    setText("#glbTitle", d.title);
    setText("#glbDesc",  d.desc || d.location || "");
    setText("#glbTotal", pad2(glbImgs.length));
    setText("#glbCur",   pad2(1));

    // Show/hide nav based on image count
    const multi = glbImgs.length > 1;
    const prevBtn = $("#glbPrev");
    const nextBtn = $("#glbNext");
    const counter = $("#glbCounter");
    if (prevBtn) prevBtn.style.display = multi ? "" : "none";
    if (nextBtn) nextBtn.style.display = multi ? "" : "none";
    if (counter) counter.style.visibility = multi ? "visible" : "hidden";

    // Build slides
    if (wrap) {
      wrap.innerHTML = glbImgs
        .map((img, i) => `
          <div class="glb-slide${i === 0 ? " active" : ""}" data-slide="${i}">
            <div class="glb-slide-img-wrap">
              <img src="${img.src ?? ""}" alt="${img.alt ?? img.caption ?? ""}" loading="${i === 0 ? "eager" : "lazy"}" draggable="false">
            </div>
            ${img.caption ? `<p class="glb-caption">${img.caption}</p>` : ""}
          </div>`)
        .join("");
    }

    // Build filmstrip
    if (strip) {
      strip.innerHTML = glbImgs
        .map((img, i) => `
          <button class="glb-thumb${i === 0 ? " active-t" : ""}" data-go="${i}" aria-label="Photo ${i + 1}" aria-current="${i === 0}">
            <img src="${img.src ?? ""}" alt="" loading="lazy" draggable="false">
            <div class="glb-thumb-bar"></div>
          </button>`)
        .join("");
    }

    // Show lightbox
    const glb = $("#glb");
    if (!glb) return;
    glb.classList.add("open");
    glb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (window.__lenis) window.__lenis.stop();

    // Progress bar
    if (bar) {
      bar.classList.remove("running");
      void bar.offsetWidth;
      clearTimeout(glbBarTimer);
      glbBarTimer = setTimeout(() => bar.classList.add("running"), 60);
    }

    glbResetAuto();
    setTimeout(() => $("#glbClose")?.focus(), 80);
  }

  function closeGallery() {
    // ── Restore page interaction FIRST ──
    document.body.style.overflow = "";
    try {
      if (window.Lenis) {
        // If instantiated as a class globally
        const l = document.querySelector('html').__lenis || window.__lenis;
        if (l && typeof l.start === 'function') l.start();
      } else if (window.__lenis) {
        window.__lenis.start();
      }
    } catch (e) {
      console.warn("Could not restart Lenis:", e);
    }

    glbOpen = false;
    clearInterval(glbAutoTimer);
    clearTimeout(glbBarTimer);

    const glb = $("#glb");
    if (glb) {
      glb.classList.remove("open");
      glb.setAttribute("aria-hidden", "true");
      // Interaction is now handled by CSS 'visibility' and 'pointer-events'
    }

    const bar = $("#glbProgressBar");
    if (bar) {
      bar.classList.remove("running");
      bar.style.transition = "none";
      bar.style.width = "0%";
      setTimeout(() => { if (bar) bar.style.transition = ""; }, 50);
    }

    try { glbPrevFocus?.focus(); } catch (_) {}
  }

  function initLightboxEvents() {
    // ── Close button & background ──
    document.addEventListener("click", (e) => {
      if (e.target.closest("#glbClose") || e.target.id === "glbBg") closeGallery();
      if (e.target.closest("#glbPrev")) glbPrev();
      if (e.target.closest("#glbNext")) glbNext();
      // Filmstrip thumbnail
      const thumb = e.target.closest(".glb-thumb");
      if (thumb && thumb.closest("#glb")) {
        const i = parseInt(thumb.dataset.go);
        if (!isNaN(i)) glbGoTo(i);
      }
    });

    // ── Keyboard ──
    document.addEventListener("keydown", (e) => {
      if (!glbOpen) return;
      if (e.key === "Escape")     closeGallery();
      if (e.key === "ArrowRight") glbNext();
      if (e.key === "ArrowLeft")  glbPrev();
      if (e.key === "Tab") {
        const glb = $("#glb");
        const focusable = $$("button:not([disabled])", glb);
        if (!focusable.length) return;
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    });

    // ── Touch swipe ──
    let touchX = 0, touchY = 0;
    document.addEventListener("touchstart", (e) => {
      if (!glbOpen) return;
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
    }, { passive: true });
    document.addEventListener("touchend", (e) => {
      if (!glbOpen) return;
      const dx = e.changedTouches[0].clientX - touchX;
      const dy = e.changedTouches[0].clientY - touchY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) dx < 0 ? glbNext() : glbPrev();
    }, { passive: true });

    // ── Mouse drag ──
    let dragX = 0, dragging = false;
    const stage = document.getElementById("glbStage");
    // use document-level delegation for stage events
    document.addEventListener("mousedown", (e) => {
      if (!glbOpen || !e.target.closest("#glbStage")) return;
      dragX = e.clientX; dragging = true;
    });
    document.addEventListener("mouseup", (e) => {
      if (!dragging) return;
      dragging = false;
      if (!glbOpen) return;
      const dx = e.clientX - dragX;
      if (Math.abs(dx) > 60) dx < 0 ? glbNext() : glbPrev();
    });
    document.addEventListener("mouseleave", () => { dragging = false; });
  }

  /* ── EVENT DELEGATION on creationsGrid (robust, works after innerHTML) ── */
  function initCreationsGrid() {
    const grid = $("#creationsGrid");
    if (!grid) return;

    grid.addEventListener("click", (e) => {
      const card = e.target.closest(".c-card");
      if (!card) return;
      const id = card.dataset.gallery;
      if (id) openGallery(id);
    });

    grid.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const card = e.target.closest(".c-card");
      if (!card) return;
      e.preventDefault();
      const id = card.dataset.gallery;
      if (id) openGallery(id);
    });
  }

  function applyProjects() {
    if (!PROJECTS) return;

    setText("#creationsLabel", PROJECTS.creations?.label);
    setHTML("#creationsTitle",  PROJECTS.creations?.titleHtml);
    setText("#creationsIntro",  PROJECTS.creations?.intro);

    const cards = Array.isArray(PROJECTS.creations?.items) ? PROJECTS.creations.items : [];
    const grid  = $("#creationsGrid");

    if (grid) {
      grid.innerHTML = cards
        .map((c, idx) => {
          const delay    = idx === 0 ? "" : ` d${Math.min(6, idx)}`;
          const imgCount = Array.isArray(c.images) ? c.images.length : (c.modalImage ? 1 : 1);
          const badge    = imgCount > 1
            ? `<div class="c-photo-count" aria-hidden="true">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" width="11" height="11">
                  <rect x="1" y="3" width="11" height="9" rx="1.5"/>
                  <path d="M4 3V2.5A1.5 1.5 0 015.5 1h7A1.5 1.5 0 0114 2.5v8a1.5 1.5 0 01-1.5 1.5H12"/>
                </svg>${imgCount}</div>`
            : "";
          return `
            <button class="c-card fade-up${delay}"
              data-gallery="${c.id ?? ""}"
              aria-label="${c.ariaLabel ?? `Voir la galerie ${c.title ?? ""}`}">
              <div class="c-ph"></div>
              <img src="${c.cardImage ?? ""}" alt="${c.title ?? ""}" loading="lazy">
              <div class="c-overlay"></div>
              <div class="c-info">
                <div class="c-cat">${c.category ?? ""}</div>
                <div class="c-title">${c.title ?? ""}</div>
                <div class="c-sub">${c.subtitle ?? ""}</div>
              </div>
              ${badge}
            </button>`;
        })
        .join("");
    }

    // Build GALLERY_DATA — supports images[] array OR legacy modalImage
    GALLERY_DATA = {};
    cards.forEach((c) => {
      if (!c.id) return;
      const imgs = Array.isArray(c.images) && c.images.length
        ? c.images
        : [{ src: c.modalImage ?? c.cardImage ?? "", caption: c.description ?? "", alt: c.title ?? "" }];
      GALLERY_DATA[c.id] = {
        title:    c.title    ?? "",
        cat:      c.category ?? "",
        desc:     c.description ?? "",
        location: c.location ?? "",
        images:   imgs,
      };
    });

    /* ── Galerie immersive (section Atelier) ── */
    (function initGallery() {
      const wrap    = $("#galerie");
      const projets = Array.isArray(PROJECTS.gallery) ? PROJECTS.gallery : [];
      if (!wrap || !projets.length) return;

      const total     = projets.length;
      const ARROW_P   = `<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>`;
      const ARROW_N   = `<svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>`;

      wrap.innerHTML =
        projets.map((p, i) => `
          <div class="g-slide${i === 0 ? " active" : ""}" data-index="${i}">
            <div class="g-slide-img">
              <img src="${p.image ?? ""}" alt="${p.title ?? ""}" loading="${i === 0 ? "eager" : "lazy"}">
            </div>
            <div class="g-slide-overlay">
              <div class="g-slide-left">
                <div class="g-slide-cat">${p.category ?? ""}</div>
                <h3 class="g-slide-title">${p.title ?? ""}</h3>
              </div>
              <div class="g-slide-right">
                <div class="g-counter"><strong>${pad2(i + 1)}</strong><span>— ${pad2(total)}</span></div>
                <div class="g-navs">
                  <button class="g-nav g-prev" aria-label="Projet précédent">${ARROW_P}</button>
                  <button class="g-nav g-next" aria-label="Projet suivant">${ARROW_N}</button>
                </div>
              </div>
            </div>
          </div>`).join("") +
        `<div class="g-thumbs" aria-hidden="true">${projets.map((p, i) => `
          <div class="g-thumb${i === 0 ? " active-t" : ""}" data-go="${i}">
            <img src="${p.thumb ?? p.image ?? ""}" alt="">
          </div>`).join("")}</div>` +
        `<div class="g-progress" id="gProgress"></div>`;

      const slides    = $$(".g-slide", wrap);
      const thumbs    = $$(".g-thumb", wrap);
      const bar       = $("#gProgress");
      let cur = 0, autoT = null, barT = null;

      function gGoTo(next) {
        if (next === cur) return;
        const prev = cur; cur = next;
        if (bar) { bar.classList.remove("running"); bar.style.width = "0%"; }
        slides[prev]?.classList.remove("active");
        slides[prev]?.classList.add("leave");
        setTimeout(() => slides[prev]?.classList.remove("leave"), 1100);
        void slides[cur]?.offsetWidth;
        slides[cur]?.classList.add("active");
        thumbs.forEach((t, i) => t.classList.toggle("active-t", i === cur));
        clearTimeout(barT);
        barT = setTimeout(() => bar?.classList.add("running"), 60);
        clearInterval(autoT);
        autoT = setInterval(() => gGoTo((cur + 1) % total), 5000);
      }

      wrap.addEventListener("click", (e) => {
        const btn = e.target.closest(".g-nav");
        if (btn) { btn.classList.contains("g-prev") ? gGoTo((cur - 1 + total) % total) : gGoTo((cur + 1) % total); return; }
        const th = e.target.closest(".g-thumb");
        if (th) { const i = parseInt(th.dataset.go); if (!isNaN(i)) gGoTo(i); }
      });

      document.addEventListener("keydown", (e) => {
        if (!wrap.closest("section")?.matches(":hover")) return;
        if (e.key === "ArrowRight") gGoTo((cur + 1) % total);
        if (e.key === "ArrowLeft")  gGoTo((cur - 1 + total) % total);
      });

      let tx = 0;
      wrap.addEventListener("touchstart", (e) => { tx = e.touches[0].clientX; }, { passive: true });
      wrap.addEventListener("touchend",   (e) => {
        const dx = e.changedTouches[0].clientX - tx;
        if (Math.abs(dx) > 44) dx < 0 ? gGoTo((cur + 1) % total) : gGoTo((cur - 1 + total) % total);
      }, { passive: true });

      clearTimeout(barT);
      barT = setTimeout(() => bar?.classList.add("running"), 60);
      autoT = setInterval(() => gGoTo((cur + 1) % total), 5000);
    })();
  }

  /* ─────────────────────────────────────────────
     VIDEO : metadata sur mobile
  ────────────────────────────────────────────── */
  if (window.matchMedia("(pointer:coarse)").matches || window.innerWidth < 768) {
    const v = $("#heroVideo");
    if (v) v.preload = "metadata";
  }

  /* ─────────────────────────────────────────────
     LENIS
  ────────────────────────────────────────────── */
  function initLenis() {
    if (window.matchMedia("(pointer:coarse)").matches) return;
    if (typeof Lenis === "undefined") return;
    const lenis = new Lenis({ duration: 1.35, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smooth: true });
    window.__lenis = lenis;
    (function r(t) { lenis.raf(t); requestAnimationFrame(r); })(0);
  }
  function waitLenis() {
    if (typeof Lenis === "undefined") { setTimeout(waitLenis, 80); return; }
    initLenis();
  }
  waitLenis();

  /* ─────────────────────────────────────────────
     SCROLL PROGRESS
  ────────────────────────────────────────────── */
  const progressBar = $("#scroll-progress");
  window.addEventListener("scroll", () => {
    if (!progressBar) return;
    progressBar.style.width = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100 + "%";
  }, { passive: true });

  /* ─────────────────────────────────────────────
     CURSOR
  ────────────────────────────────────────────── */
  if (window.matchMedia("(pointer:fine)").matches) {
    const dot = $("#cur-dot"), ring = $("#cur-ring"), label = $("#cur-label"), torch = $("#torch");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, px = mx, py = my, sT;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      if (torch) torch.style.background = `radial-gradient(700px circle at ${mx}px ${my}px, rgba(255,183,121,.04), transparent 70%)`;
      const vx = Math.abs(mx - px), vy = Math.abs(my - py);
      clearTimeout(sT);
      if (vx > vy + 4)      { document.body.classList.add("c-vx"); document.body.classList.remove("c-vy"); }
      else if (vy > vx + 4) { document.body.classList.add("c-vy"); document.body.classList.remove("c-vx"); }
      sT = setTimeout(() => document.body.classList.remove("c-vx", "c-vy"), 120);
      px = mx; py = my;
    });
    (function animate() {
      rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1;
      if (ring)  { ring.style.left  = rx + "px"; ring.style.top  = ry + "px"; }
      if (label) { label.style.left = rx + "px"; label.style.top = ry + "px"; }
      if (dot)   { dot.style.left   = mx + "px"; dot.style.top   = my + "px"; }
      requestAnimationFrame(animate);
    })();

    $$("a, button, .btn-bronze").forEach((el) => {
      el.addEventListener("mouseenter", () => document.body.classList.add("c-hover"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("c-hover"));
    });
    document.addEventListener("mouseover",  (e) => { if (e.target.closest?.(".c-card")) { document.body.classList.add("c-voir"); document.body.classList.remove("c-hover"); } }, { passive: true });
    document.addEventListener("mouseout",   (e) => { if (e.target.closest?.(".c-card"))   document.body.classList.remove("c-voir"); }, { passive: true });
  }

  /* ─────────────────────────────────────────────
     PRELOADER
  ────────────────────────────────────────────── */
  window.addEventListener("load", () => {
    setTimeout(() => {
      $("#preloader")?.classList.add("out");
      setTimeout(() => $("#heroWhiplash")?.classList.add("visible"), 180);
      setTimeout(() => $("#heroEyebrow")?.classList.add("visible"),  320);
      setTimeout(() => $("#heroTagline")?.classList.add("visible"),  580);
      setTimeout(() => $("#heroCtas")?.classList.add("visible"),     860);
      setTimeout(() => { $("#heroBottomStrip")?.classList.add("visible"); $("#trustBadge")?.classList.add("visible"); }, 1300);
    }, 1200);
  });

  /* ─────────────────────────────────────────────
     FADE UP OBSERVER
  ────────────────────────────────────────────── */
  const obs = new IntersectionObserver(
    (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); obs.unobserve(e.target); } }),
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  /* ─────────────────────────────────────────────
     ACTIVE NAV
  ────────────────────────────────────────────── */
  const secObs = new IntersectionObserver(
    (es) => es.forEach((e) => {
      if (e.isIntersecting) {
        $$(".nav-links a").forEach((a) => a.classList.remove("active"));
        $(`.nav-links a[href="#${e.target.id}"]`)?.classList.add("active");
      }
    }),
    { threshold: 0.38 }
  );
  $$("section[id]").forEach((s) => secObs.observe(s));

  /* ─────────────────────────────────────────────
     NAVBAR SCROLL
  ────────────────────────────────────────────── */
  const nav = $("#navbar");
  window.addEventListener("scroll", () => nav?.classList.toggle("scrolled", scrollY > 80), { passive: true });

  /* ─────────────────────────────────────────────
     MOBILE MENU
  ────────────────────────────────────────────── */
  window.toggleMobile = function () {
    const m = $("#mobileMenu"), b = $("#burger");
    if (!m || !b) return;
    const o = m.classList.toggle("open");
    b.classList.toggle("open");
    b.setAttribute("aria-expanded", String(o));
    document.body.style.overflow = o ? "hidden" : "";
  };
  window.closeMobile = function () {
    const m = $("#mobileMenu"), b = $("#burger");
    if (!m || !b) return;
    m.classList.remove("open"); b.classList.remove("open");
    b.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  /* ─────────────────────────────────────────────
     MAGNETIC BUTTONS
  ────────────────────────────────────────────── */
  if (window.matchMedia("(pointer:fine)").matches) {
    $$(".btn-bronze, .nav-cta, .btn-glass").forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.22}px, ${(e.clientY - (r.top + r.height / 2)) * 0.22}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
        btn.style.transition = "transform .5s cubic-bezier(0.34,1.56,0.64,1)";
        setTimeout(() => (btn.style.transition = ""), 500);
      });
    });
  }

  /* ─────────────────────────────────────────────
     TIMELINE
  ────────────────────────────────────────────── */
  function updateTimeline() {
    const steps = $$(".step");
    const fill  = $("#pLineFill");
    const bg    = $("#pLineBg");
    const cont  = $("#processusSteps");
    if (!fill || !bg || !cont || !steps.length) return;
    bg.style.height = cont.offsetHeight + "px";
    let active = 0;
    steps.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      if (r.top + r.height / 2 < innerHeight * 0.7) { s.classList.add("active"); active = i; }
      else s.classList.remove("active");
    });
    const fd = steps[0]?.querySelector(".step-dot");
    const ad = steps[active]?.querySelector(".step-dot");
    if (fd && ad) {
      const cr = cont.getBoundingClientRect();
      const t  = fd.getBoundingClientRect().top - cr.top + 7;
      const b  = ad.getBoundingClientRect().top - cr.top + 7;
      fill.style.top    = t + "px";
      fill.style.height = Math.max(0, b - t) + "px";
    }
  }
  window.addEventListener("scroll", updateTimeline, { passive: true });
  window.addEventListener("resize", updateTimeline);

  /* ─────────────────────────────────────────────
     FORMULAIRE
  ────────────────────────────────────────────── */
  function initForm() {
    const form = $("#contactForm");
    if (!form) return;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector(".form-submit");
      const sb  = btn?.querySelector(".sb");
      const orig = sb?.textContent ?? "";
      if (sb)  sb.textContent = "Envoi en cours…";
      if (btn) btn.disabled = true;
      try {
        const r = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        if (r.ok) {
          form.style.display = "none";
          const ok = $("#formSuccess");
          if (ok) ok.style.display = "block";
        } else {
          if (sb) sb.textContent = "Erreur — réessayez";
          if (btn) btn.disabled = false;
        }
      } catch {
        const emailHref = SITE?.contact?.emailHref ?? "mailto:ferasouderfils@gmail.com";
        window.location.href = `mailto:${emailHref.replace(/^mailto:/, "")}?subject=${encodeURIComponent("Projet " + ($("#projet")?.value ?? "") + " — " + ($("#nom")?.value ?? ""))}&body=${encodeURIComponent(($("#message")?.value ?? "") + "\n\nDe : " + ($("#nom")?.value ?? "") + "\nEmail : " + ($("#email")?.value ?? ""))}`;
        if (sb) sb.textContent = orig;
        if (btn) btn.disabled = false;
      }
    });
  }

  /* ─────────────────────────────────────────────
     SMOOTH ANCHOR
  ────────────────────────────────────────────── */
  function initAnchors() {
    $$("a[href^='#']").forEach((a) => {
      a.addEventListener("click", (e) => {
        const h = a.getAttribute("href");
        if (h === "#") return;
        const t = document.querySelector(h);
        if (t) {
          e.preventDefault();
          if (window.__lenis) window.__lenis.scrollTo(t, { offset: -80, duration: 1.55 });
          else t.scrollIntoView({ behavior: "smooth" });
          window.closeMobile?.();
        }
      });
    });
  }

  /* ─────────────────────────────────────────────
     SPLIT TEXT REVEAL
  ────────────────────────────────────────────── */
  function initSplit() {
    // Exclude lightbox title from split
    $$("h2:not(.glb-gallery-title)").forEach((h) => {
      if (h.dataset.split) return;
      h.dataset.split = "1";
      const parts = h.innerHTML.split(/(<em>.*?<\/em>|<br>)/g);
      h.innerHTML = parts.map((p) => {
        if (p.startsWith("<br>")) return "<br>";
        if (p.startsWith("<em>")) {
          const i = p.replace(/<\/?em>/g, "");
          return `<em><span class="split-word"><span class="split-word-inner">${i}</span></span></em>`;
        }
        return p.split(" ").map((w) => w ? `<span class="split-word"><span class="split-word-inner">${w}</span></span> ` : "").join("");
      }).join("");
    });
  }
  const so = new IntersectionObserver(
    (es) => es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.querySelectorAll(".split-word").forEach((w, i) => setTimeout(() => w.classList.add("revealed"), i * 75));
        so.unobserve(e.target);
      }
    }),
    { threshold: 0.2 }
  );

  /* ─────────────────────────────────────────────
     COUNTER ANIMATION
  ────────────────────────────────────────────── */
  function animCtr(el, n, suf, dur) {
    const s = performance.now();
    const num = parseInt(n);
    if (isNaN(num)) { el.textContent = n + suf; return; }
    (function u(now) {
      const eased = 1 - Math.pow(1 - Math.min((now - s) / dur, 1), 3);
      el.textContent = Math.floor(eased * num) + suf;
      if (eased < 1) requestAnimationFrame(u);
    })(s);
  }
  const co = new IntersectionObserver(
    (es) => es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.querySelectorAll(".stat-num").forEach((n) => {
          const raw = n.textContent.trim();
          const num = parseInt(raw);
          if (!isNaN(num)) {
            const suf = raw.replace(String(num), "");
            animCtr(n, num, suf, 2000);
          }
        });
        co.unobserve(e.target);
      }
    }),
    { threshold: 0.4 }
  );

  /* ─────────────────────────────────────────────
     PARALLAX HERO
  ────────────────────────────────────────────── */
  window.addEventListener("scroll", () => {
    const w = $("#heroWhiplash");
    if (w && scrollY < innerHeight) w.style.transform = `translateY(${scrollY * 0.13}px)`;
  }, { passive: true });

  /* ─────────────────────────────────────────────
     CARD TILT
  ────────────────────────────────────────────── */
  function initCardTilt() {
    if (!window.matchMedia("(pointer:fine)").matches) return;
    $$(".c-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r  = card.getBoundingClientRect();
        const dx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
        const dy = ((e.clientY - r.top)  / r.height - 0.5) * 2;
        card.style.transform  = `perspective(1000px) rotateY(${dx * 4}deg) rotateX(${-dy * 3}deg) scale(1.025)`;
        card.style.transition = "transform .1s ease-out, box-shadow .3s";
        card.style.boxShadow  = `${-dx * 12}px ${dy * 12}px 40px rgba(0,0,0,.5)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transition = "transform .6s var(--ease-s), box-shadow .6s";
        card.style.transform  = "";
        card.style.boxShadow  = "";
      });
    });
  }

  /* ─────────────────────────────────────────────
     BLUR-UP IMAGES
  ────────────────────────────────────────────── */
  function initLazyBlur() {
    $$("img[loading='lazy']").forEach((img) => {
      if (!img.complete) {
        img.classList.add("lazy-blur");
        img.addEventListener("load", () => {
          img.classList.add("loaded");
          setTimeout(() => img.classList.remove("lazy-blur", "loaded"), 700);
        }, { once: true });
      }
    });
  }

  /* ─────────────────────────────────────────────
     BOOT
  ────────────────────────────────────────────── */
  (async function boot() {
    // 1. Inject lightbox DOM immediately (before content loads)
    buildLightboxDOM();

    // 2. Attach all global lightbox events once
    initLightboxEvents();

    // 3. Attach grid delegation (works even before cards exist)
    initCreationsGrid();

    // 4. Load content & populate
    try {
      await loadContent();
      applySiteSettings();
      applyHome();
      applyProjects();
    } catch (e) {
      console.warn("Contenu JSON non chargé. Le site reste en fallback.", e);
    }

    $$(".fade-up").forEach((el) => obs.observe(el));
    initForm();
    initAnchors();
    updateTimeline();

    setTimeout(() => {
      initSplit();
      $$("h2:not(.glb-gallery-title)").forEach((h) => so.observe(h));
    }, 1750);

    $$(".atelier-stats").forEach((el) => co.observe(el));
    initCardTilt();
    initLazyBlur();
  })();

  /* ─────────────────────────────────────────────
     IMAGE ERROR HANDLING
  ────────────────────────────────────────────── */
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement)) return;
    img.dataset.imgError = "1";
    img.style.display = "none";
  }, true);
});