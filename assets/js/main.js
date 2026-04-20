document.addEventListener("DOMContentLoaded", () => {
  const CONTENT = {
    settings: "content/site-settings.json",
    home: "content/home.json",
    projects: "content/projects.json",
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
    const res = await fetch(url, { cache: "no-cache" });
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

    // Contact panel
    setHTML("#contactAddressValue", SITE.contact?.addressHtml);
    setText("#contactPhoneLabel", SITE.contact?.phoneLabel);
    setAttr("#contactPhoneLink", "href", SITE.contact?.phoneHref);
    setText("#contactPhoneLink", SITE.contact?.phoneText);
    setText("#contactEmailLabel", SITE.contact?.emailLabel);
    setAttr("#contactEmailLink", "href", SITE.contact?.emailHref);
    setText("#contactEmailLink", SITE.contact?.emailText);
    setHTML("#contactHoursValue", SITE.contact?.hoursHtml);

    // Localisation
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

    // Footer
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

    // Socials
    if (SITE.socials?.instagramHref) setAttr("#socialInstagram", "href", SITE.socials.instagramHref);
    if (SITE.socials?.facebookHref) setAttr("#socialFacebook", "href", SITE.socials.facebookHref);
    if (SITE.socials?.emailHref) setAttr("#socialEmail", "href", SITE.socials.emailHref);
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
        // duplicate to allow seamless scroll
        track.innerHTML = seq.concat(seq).join("");
      }
    }

    // Manifeste
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

    // Processus
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
        if (!steps.length) return;
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

    // Atelier
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
        if (!items.length) return;
        stats.innerHTML = items
          .map(
            (s, i) => `
            <div class="stat-item fade-up d${Math.min(6, i + 3)}">
              <div class="stat-num" aria-label="${s.ariaLabel ?? ""}">${s.value ?? ""}</div>
              <div class="stat-label">${s.label ?? ""}</div>
            </div>`
          )
          .join("");
      }
    }

    // Contact
    setText("#contactLabel", HOME.contact?.label);
    setHTML("#contactTitle", HOME.contact?.titleHtml);
    setText("#contactIntro", HOME.contact?.intro);
    setText("#formSubmitLabel", HOME.contact?.formSubmitLabel);
    setHTML("#formSuccessHtml", HOME.contact?.formSuccessHtml);
    if (HOME.contact?.formAction) setAttr("#contactForm", "action", HOME.contact.formAction);
  }

  function applyProjects() {
    if (!PROJECTS) return;

    // Créations header
    setText("#creationsLabel", PROJECTS.creations?.label);
    setHTML("#creationsTitle", PROJECTS.creations?.titleHtml);
    setText("#creationsIntro", PROJECTS.creations?.intro);

    // Créations grid cards + modal data source
    const cards = Array.isArray(PROJECTS.creations?.items) ? PROJECTS.creations.items : [];
    const grid = $("#creationsGrid");
    if (grid) {
      grid.innerHTML = cards
        .slice(0, 6)
        .map((c, idx) => {
          const delay = idx === 0 ? "" : ` d${Math.min(6, idx)}`;
          return `
            <button class="c-card fade-up${delay}" data-modal="${c.id ?? ""}" aria-label="${c.ariaLabel ?? `Voir le projet ${c.title ?? ""}`}">
              <div class="c-ph"></div>
              <img src="${c.cardImage ?? ""}" alt="${c.title ?? ""}" loading="lazy">
              <div class="c-overlay"></div>
              <div class="c-info">
                <div class="c-cat">${c.category ?? ""}</div>
                <div class="c-title">${c.title ?? ""}</div>
                <div class="c-sub">${c.subtitle ?? ""}</div>
              </div>
            </button>`;
        })
        .join("");
    }

    // Modal data map
    const MODAL_DATA = {};
    cards.forEach((c) => {
      if (!c.id) return;
      MODAL_DATA[c.id] = {
        title: c.title ?? "",
        cat: c.category ?? "",
        lieu: c.location ?? "",
        img: c.modalImage ?? c.cardImage ?? "",
        desc: c.description ?? "",
        meta: c.meta ?? [],
      };
    });

    /* ─────────────────────────────────────────────
       MODAL
    ────────────────────────────────────────────── */
    const modal = $("#modal");
    const modalBg = $("#modalBg");
    const modalClose = $("#modalClose");
    let prevFocus;

    function openModal(k) {
      const d = MODAL_DATA[k];
      if (!d || !modal) return;
      prevFocus = document.activeElement;

      setText("#modalTitle", d.title);
      setText("#modalDesc", d.desc);

      const metaBase = [
        { label: "Catégorie", value: d.cat },
        { label: "Localisation", value: d.lieu },
      ];
      const metaAll = metaBase.concat(Array.isArray(d.meta) ? d.meta : []);
      const metaWrap = $("#modalMeta");
      if (metaWrap) {
        metaWrap.innerHTML = metaAll
          .filter((m) => m && (m.value ?? "") !== "")
          .map(
            (m) =>
              `<div class="meta-item"><div class="meta-label">${m.label ?? ""}</div><div class="meta-value">${m.value ?? ""}</div></div>`
          )
          .join("");
      }

      setImage("#modalImg", { src: d.img, alt: d.title });

      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (window.__lenis) window.__lenis.stop();
      if (modalClose) modalClose.focus();
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (window.__lenis) window.__lenis.start();
      if (prevFocus) prevFocus.focus();
    }

    $$(".c-card").forEach((c) => {
      c.addEventListener("click", () => {
        const k = c.dataset.modal;
        if (k) openModal(k);
      });
      c.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const k = c.dataset.modal;
          if (k) openModal(k);
        }
      });
    });
    if (modalBg) modalBg.addEventListener("click", closeModal);
    if (modalClose) modalClose.addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal?.classList.contains("open")) closeModal();
    });

    /* ─────────────────────────────────────────────
       GALLERY IMMERSIVE — depuis projects.json
    ────────────────────────────────────────────── */
    (function initGallery() {
      const wrap = $("#galerie");
      const projets = Array.isArray(PROJECTS.gallery) ? PROJECTS.gallery : [];
      if (!wrap || projets.length === 0) return;

      const total = projets.length;
      const pad = (n) => String(n).padStart(2, "0");
      const ARROW_PREV = `<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>`;
      const ARROW_NEXT = `<svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>`;

      const slidesHTML = projets
        .map(
          (p, i) => `
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
                <div class="g-counter"><strong>${pad(i + 1)}</strong><span>— ${pad(total)}</span></div>
                <div class="g-navs">
                  <button class="g-nav g-prev" aria-label="Projet précédent">${ARROW_PREV}</button>
                  <button class="g-nav g-next" aria-label="Projet suivant">${ARROW_NEXT}</button>
                </div>
              </div>
            </div>
          </div>`
        )
        .join("");

      const thumbsHTML = `
        <div class="g-thumbs" aria-hidden="true">
          ${projets
            .map(
              (p, i) => `
              <div class="g-thumb${i === 0 ? " active-t" : ""}" data-go="${i}">
                <img src="${p.thumb ?? p.image ?? ""}" alt="">
              </div>`
            )
            .join("")}
        </div>`;

      wrap.innerHTML = slidesHTML + thumbsHTML + `<div class="g-progress" id="gProgress"></div>`;

      const slides = Array.from(wrap.querySelectorAll(".g-slide"));
      const thumbs = Array.from(wrap.querySelectorAll(".g-thumb"));
      const bar = $("#gProgress");
      let cur = 0,
        autoTimer = null,
        barTimer = null;

      function goTo(next) {
        if (next === cur) return;
        const prev = cur;
        cur = next;
        const leaving = slides[prev];
        const arriving = slides[cur];
        if (bar) {
          bar.classList.remove("running");
          bar.style.width = "0%";
        }
        leaving?.classList.remove("active");
        leaving?.classList.add("leave");
        setTimeout(() => leaving?.classList.remove("leave"), 1100);
        // force reflow for clip transition correctness
        void arriving?.offsetWidth;
        arriving?.classList.add("active");
        thumbs.forEach((t, i) => t.classList.toggle("active-t", i === cur));
        clearTimeout(barTimer);
        barTimer = setTimeout(() => bar?.classList.add("running"), 60);
        resetAuto();
      }

      function next() {
        goTo((cur + 1) % total);
      }
      function prev() {
        goTo((cur - 1 + total) % total);
      }
      function resetAuto() {
        clearInterval(autoTimer);
        autoTimer = setInterval(next, 5000);
      }

      wrap.addEventListener("click", (e) => {
        const btn = e.target.closest(".g-nav");
        if (btn) {
          btn.classList.contains("g-prev") ? prev() : next();
          return;
        }
        const th = e.target.closest(".g-thumb");
        if (th) {
          const i = parseInt(th.dataset.go);
          if (!isNaN(i)) goTo(i);
        }
      });

      document.addEventListener("keydown", (e) => {
        if (!wrap.closest("section")?.matches(":hover")) return;
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
      });

      let tx = 0;
      wrap.addEventListener(
        "touchstart",
        (e) => {
          tx = e.touches[0].clientX;
        },
        { passive: true }
      );
      wrap.addEventListener(
        "touchend",
        (e) => {
          const dx = e.changedTouches[0].clientX - tx;
          if (Math.abs(dx) > 44) (dx < 0 ? next : prev)();
        },
        { passive: true }
      );

      barTimer = setTimeout(() => bar?.classList.add("running"), 60);
      resetAuto();
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
     LENIS — smooth scroll (pointer:fine only)
  ────────────────────────────────────────────── */
  function initLenis() {
    if (window.matchMedia("(pointer:coarse)").matches) return;
    if (typeof Lenis === "undefined") return;
    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });
    window.__lenis = lenis;
    (function r(t) {
      lenis.raf(t);
      requestAnimationFrame(r);
    })(0);
  }

  function waitLenis() {
    if (typeof Lenis === "undefined") {
      setTimeout(waitLenis, 80);
      return;
    }
    initLenis();
  }
  waitLenis();

  /* ─────────────────────────────────────────────
     SCROLL PROGRESS
  ────────────────────────────────────────────── */
  const progressBar = $("#scroll-progress");
  window.addEventListener(
    "scroll",
    () => {
      if (!progressBar) return;
      const p =
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) *
        100;
      progressBar.style.width = p + "%";
    },
    { passive: true }
  );

  /* ─────────────────────────────────────────────
     CURSOR — avec velocity stretch
  ────────────────────────────────────────────── */
  if (window.matchMedia("(pointer:fine)").matches) {
    const dot = $("#cur-dot");
    const ring = $("#cur-ring");
    const label = $("#cur-label");
    const torch = $("#torch");

    let mx = innerWidth / 2,
      my = innerHeight / 2;
    let rx = mx,
      ry = my;
    let px = mx,
      py = my;
    let stretchTimer;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (torch) {
        torch.style.background = `radial-gradient(700px circle at ${mx}px ${my}px, rgba(255,183,121,.04), transparent 70%)`;
      }

      const vx = Math.abs(mx - px),
        vy = Math.abs(my - py);
      clearTimeout(stretchTimer);
      if (vx > vy + 4) {
        document.body.classList.add("c-vx");
        document.body.classList.remove("c-vy");
      } else if (vy > vx + 4) {
        document.body.classList.add("c-vy");
        document.body.classList.remove("c-vx");
      }
      stretchTimer = setTimeout(() => {
        document.body.classList.remove("c-vx", "c-vy");
      }, 120);
      px = mx;
      py = my;
    });

    (function animate() {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      if (ring) {
        ring.style.left = rx + "px";
        ring.style.top = ry + "px";
      }
      if (label) {
        label.style.left = rx + "px";
        label.style.top = ry + "px";
      }
      if (dot) {
        dot.style.left = mx + "px";
        dot.style.top = my + "px";
      }
      requestAnimationFrame(animate);
    })();

    $$("a, button, .btn-bronze").forEach((el) => {
      el.addEventListener("mouseenter", () => document.body.classList.add("c-hover"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("c-hover"));
    });
    document.addEventListener(
      "mouseover",
      (e) => {
        const card = e.target.closest?.(".c-card");
        if (card) {
          document.body.classList.add("c-voir");
          document.body.classList.remove("c-hover");
        }
      },
      { passive: true }
    );
    document.addEventListener(
      "mouseout",
      (e) => {
        if (e.target.closest?.(".c-card")) document.body.classList.remove("c-voir");
      },
      { passive: true }
    );
  }

  /* ─────────────────────────────────────────────
     PRELOADER
  ────────────────────────────────────────────── */
  window.addEventListener("load", () => {
    setTimeout(() => {
      $("#preloader")?.classList.add("out");
      setTimeout(() => $("#heroWhiplash")?.classList.add("visible"), 180);
      setTimeout(() => $("#heroEyebrow")?.classList.add("visible"), 320);
      setTimeout(() => $("#heroTagline")?.classList.add("visible"), 580);
      setTimeout(() => $("#heroCtas")?.classList.add("visible"), 860);
      setTimeout(() => {
        $("#heroBottomStrip")?.classList.add("visible");
        $("#trustBadge")?.classList.add("visible");
      }, 1300);
    }, 1200);
  });

  /* ─────────────────────────────────────────────
     FADE UP OBSERVER
  ────────────────────────────────────────────── */
  const obs = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".fade-up").forEach((el) => obs.observe(el));

  /* ─────────────────────────────────────────────
     ACTIVE NAV TRACKING
  ────────────────────────────────────────────── */
  const sections = $$("section[id]");
  const navLinks = $$(".nav-links a");
  const secObs = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          navLinks.forEach((a) => a.classList.remove("active"));
          const link = $(`.nav-links a[href="#${e.target.id}"]`);
          if (link) link.classList.add("active");
        }
      });
    },
    { threshold: 0.38 }
  );
  sections.forEach((s) => secObs.observe(s));

  /* ─────────────────────────────────────────────
     NAVBAR SCROLL
  ────────────────────────────────────────────── */
  const nav = $("#navbar");
  window.addEventListener(
    "scroll",
    () => nav?.classList.toggle("scrolled", scrollY > 80),
    { passive: true }
  );

  /* ─────────────────────────────────────────────
     MOBILE MENU
  ────────────────────────────────────────────── */
  window.toggleMobile = function () {
    const m = $("#mobileMenu"),
      b = $("#burger");
    if (!m || !b) return;
    const o = m.classList.toggle("open");
    b.classList.toggle("open");
    b.setAttribute("aria-expanded", String(o));
    document.body.style.overflow = o ? "hidden" : "";
  };
  window.closeMobile = function () {
    const m = $("#mobileMenu"),
      b = $("#burger");
    if (!m || !b) return;
    m.classList.remove("open");
    b.classList.remove("open");
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
        const x = (e.clientX - (r.left + r.width / 2)) * 0.22;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.22;
        btn.style.transform = `translate(${x}px, ${y}px)`;
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
    const fill = $("#pLineFill");
    const bg = $("#pLineBg");
    const cont = $("#processusSteps");
    if (!fill || !bg || !cont || steps.length === 0) return;
    bg.style.height = cont.offsetHeight + "px";
    let active = 0;
    steps.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      if (r.top + r.height / 2 < innerHeight * 0.7) {
        s.classList.add("active");
        active = i;
      } else s.classList.remove("active");
    });
    const fd = steps[0]?.querySelector(".step-dot");
    const ad = steps[active]?.querySelector(".step-dot");
    if (fd && ad) {
      const cr = cont.getBoundingClientRect();
      const t = fd.getBoundingClientRect().top - cr.top + 7;
      const b = ad.getBoundingClientRect().top - cr.top + 7;
      fill.style.top = t + "px";
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
      const sb = btn?.querySelector(".sb");
      const orig = sb?.textContent ?? "";
      if (sb) sb.textContent = "Envoi en cours…";
      if (btn) btn.disabled = true;
      try {
        const r = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (r.ok) {
          form.style.display = "none";
          const ok = $("#formSuccess");
          if (ok) ok.style.display = "block";
        } else {
          if (sb) sb.textContent = "Erreur — réessayez";
          if (btn) btn.disabled = false;
        }
      } catch {
        const n = $("#nom")?.value ?? "";
        const em = $("#email")?.value ?? "";
        const msg = $("#message")?.value ?? "";
        const pr = $("#projet")?.value ?? "";
        const emailHref = SITE?.contact?.emailHref ?? "mailto:ferasouderfils@gmail.com";
        const emailTo = emailHref.replace(/^mailto:/, "");
        window.location.href = `mailto:${emailTo}?subject=${encodeURIComponent(
          "Projet " + pr + " — " + n
        )}&body=${encodeURIComponent(msg + "\n\nDe : " + n + "\nEmail : " + em)}`;
        if (sb) sb.textContent = orig;
        if (btn) btn.disabled = false;
      }
    });
  }

  /* ─────────────────────────────────────────────
     SMOOTH ANCHOR (Lenis ou fallback natif)
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
    $$("h2").forEach((h) => {
      if (h.dataset.split) return;
      h.dataset.split = "1";
      const parts = h.innerHTML.split(/(<em>.*?<\/em>|<br>)/g);
      h.innerHTML = parts
        .map((p) => {
          if (p.startsWith("<br>")) return "<br>";
          if (p.startsWith("<em>")) {
            const i = p.replace(/<\/?em>/g, "");
            return `<em><span class="split-word"><span class="split-word-inner">${i}</span></span></em>`;
          }
          return p
            .split(" ")
            .map((w) => (w ? `<span class="split-word"><span class="split-word-inner">${w}</span></span> ` : ""))
            .join("");
        })
        .join("");
    });
  }
  const so = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target
            .querySelectorAll(".split-word")
            .forEach((w, i) => setTimeout(() => w.classList.add("revealed"), i * 75));
          so.unobserve(e.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  /* ─────────────────────────────────────────────
     COUNTER ANIMATION
  ────────────────────────────────────────────── */
  function animCtr(el, n, suf, dur) {
    const s = performance.now();
    const num = parseInt(n);
    if (isNaN(num)) {
      el.textContent = n + suf;
      return;
    }
    (function u(now) {
      const p = Math.min((now - s) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * num) + suf;
      if (p < 1) requestAnimationFrame(u);
    })(s);
  }
  const co = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.querySelectorAll(".stat-num").forEach((n) => {
            const r = n.textContent.trim();
            if (r === "15") animCtr(n, 15, "", 1800);
            else if (r === "100%") animCtr(n, 100, "%", 2000);
          });
          co.unobserve(e.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  /* ─────────────────────────────────────────────
     PARALLAX hero whiplash
  ────────────────────────────────────────────── */
  window.addEventListener(
    "scroll",
    () => {
      const w = $("#heroWhiplash");
      if (w && scrollY < innerHeight) w.style.transform = `translateY(${scrollY * 0.13}px)`;
    },
    { passive: true }
  );

  /* ─────────────────────────────────────────────
     CARD TILT — flat perspective (compatible overflow:hidden)
  ────────────────────────────────────────────── */
  function initCardTilt() {
    if (!window.matchMedia("(pointer:fine)").matches) return;
    $$(".c-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const dx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const dy = ((e.clientY - r.top) / r.height - 0.5) * 2;
        card.style.transform = `perspective(1000px) rotateY(${dx * 4}deg) rotateX(${-dy * 3}deg) scale(1.025)`;
        card.style.transition = "transform .1s ease-out, box-shadow .3s";
        card.style.boxShadow = `${-dx * 12}px ${dy * 12}px 40px rgba(0,0,0,.5)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transition = "transform .6s var(--ease-s), box-shadow .6s";
        card.style.transform = "";
        card.style.boxShadow = "";
      });
    });
  }

  /* ─────────────────────────────────────────────
     BLUR-UP IMAGE LOADING
  ────────────────────────────────────────────── */
  function initLazyBlur() {
    $$("img[loading='lazy']").forEach((img) => {
      if (!img.complete) {
        img.classList.add("lazy-blur");
        img.addEventListener(
          "load",
          () => {
            img.classList.add("loaded");
            setTimeout(() => img.classList.remove("lazy-blur", "loaded"), 700);
          },
          { once: true }
        );
      }
    });
  }

  /* ─────────────────────────────────────────────
     BOOT
  ────────────────────────────────────────────── */
  (async function boot() {
    try {
      await loadContent();
      applySiteSettings();
      applyHome();
      applyProjects();
    } catch (e) {
      console.warn("Contenu JSON non chargé. Le site reste en fallback.", e);
    }

    // (re)observer new fade-up nodes after injections
    $$(".fade-up").forEach((el) => obs.observe(el));

    initForm();
    initAnchors();
    updateTimeline();

    // Split headings after injections
    setTimeout(() => {
      initSplit();
      $$("h2").forEach((h) => so.observe(h));
    }, 1750);

    // Stats counters (atelier)
    $$(".atelier-stats").forEach((el) => co.observe(el));

    initCardTilt();
    initLazyBlur();
  })();

  /* ─────────────────────────────────────────────
     IMAGE ERROR HANDLING (robuste en prod)
  ────────────────────────────────────────────── */
  document.addEventListener(
    "error",
    (e) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement)) return;
      img.dataset.imgError = "1";
      img.style.display = "none";
    },
    true
  );
});
