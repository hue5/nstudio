// Nikhil Studio, shared interactions for every page.
// Everything degrades: no JS means no preloader, no reveals, and all content visible.
(() => {
  const doc = document;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const wide = () => window.matchMedia("(min-width: 60rem)").matches;

  // Preloader, first visit only, never blocks content for long.
  const preloader = doc.getElementById("preloader");
  const startPage = () => {
    doc.body.classList.add("is-ready");
    doc.body.classList.remove("is-locked");
  };
  if (preloader) {
    let seen = false;
    try { seen = sessionStorage.getItem("ns-seen") === "1"; } catch (err) { seen = false; }
    if (seen || reduceMotion) {
      preloader.remove();
      startPage();
    } else {
      preloader.hidden = false;
      doc.body.classList.add("is-locked");
      window.setTimeout(() => {
        preloader.classList.add("is-done");
        startPage();
        try { sessionStorage.setItem("ns-seen", "1"); } catch (err) { /* private mode */ }
        window.setTimeout(() => preloader.remove(), 600);
      }, 950);
    }
  } else {
    startPage();
  }

  // Header, progress, filmstrip and marquee all read scroll in one frame.
  const header = doc.querySelector(".site-header");
  const progress = doc.getElementById("scroll-progress");
  const film = doc.getElementById("film");
  const filmTrack = doc.getElementById("film-track");
  const marquee = doc.querySelector(".marquee");
  const marqueeTrack = doc.querySelector(".marquee__track");
  let ticking = false;

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

  const onScroll = () => {
    const y = window.scrollY || doc.documentElement.scrollTop;
    if (header) header.classList.toggle("is-scrolled", y > 16);
    if (progress) {
      const max = doc.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? clamp(y / max, 0, 1).toFixed(4) : "0") + ")";
    }
    if (film && filmTrack && wide() && !reduceMotion) {
      const rect = film.getBoundingClientRect();
      const total = window.innerHeight + rect.height;
      const p = clamp((window.innerHeight - rect.top) / total, 0, 1);
      const max = Math.max(0, filmTrack.scrollWidth - film.clientWidth);
      filmTrack.style.transform = "translate3d(" + (-max * p).toFixed(1) + "px,0,0)";
    }
    if (marquee && marqueeTrack && !reduceMotion) {
      const rect = marquee.getBoundingClientRect();
      const total = window.innerHeight + rect.height;
      const p = clamp((window.innerHeight - rect.top) / total, 0, 1);
      const max = Math.max(0, marqueeTrack.scrollWidth - marquee.clientWidth);
      marqueeTrack.style.transform = "translate3d(" + (-max * p * 0.7).toFixed(1) + "px,0,0)";
    }
    ticking = false;
  };
  const requestScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  };
  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll);
  onScroll();

  // Full menu.
  const menu = doc.getElementById("menu");
  const menuToggle = doc.getElementById("menu-toggle");
  if (menu && menuToggle) {
    const firstLink = menu.querySelector("a");
    const menuLabel = menuToggle.querySelector(".menu-toggle__label");
    const setMenu = (open) => {
      menu.classList.toggle("is-open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      menu.toggleAttribute("inert", !open);
      doc.body.classList.toggle("is-locked", open);
      if (menuLabel) menuLabel.textContent = open ? "Close" : "Menu";
      doc.querySelectorAll("main, .site-footer").forEach((el) => el.toggleAttribute("inert", open));
      if (open && firstLink) window.setTimeout(() => firstLink.focus(), 240);
      if (!open) menuToggle.focus();
    };
    menu.setAttribute("inert", "");
    menuToggle.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });
    doc.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menu.classList.contains("is-open")) setMenu(false);
    });
    window.addEventListener("resize", () => {
      if (!wide() && menu.classList.contains("is-open")) {
        // keep open on phone resizes
      }
      if (wide() && menu.classList.contains("is-open")) setMenu(false);
    });
  }

  // Reveals.
  const revealEls = Array.from(doc.querySelectorAll("[data-reveal]"));
  if (revealEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("is-in"));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      revealEls.forEach((el) => io.observe(el));
    }
  }

  // Floating service preview, fine pointers only.
  const preview = doc.getElementById("service-preview");
  if (preview && finePointer && !reduceMotion) {
    const previewImg = preview.querySelector("img");
    const rows = Array.from(doc.querySelectorAll(".service-row[data-preview]"));
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    const paint = () => {
      px += (tx - px) * 0.16;
      py += (ty - py) * 0.16;
      preview.style.setProperty("--px", px.toFixed(1) + "px");
      preview.style.setProperty("--py", py.toFixed(1) + "px");
      if (Math.abs(tx - px) > 0.2 || Math.abs(ty - py) > 0.2) {
        raf = window.requestAnimationFrame(paint);
      } else {
        raf = 0;
      }
    };
    rows.forEach((row) => {
      row.addEventListener("pointerenter", () => {
        if (!wide()) return;
        if (previewImg) previewImg.src = row.dataset.preview || "";
        preview.classList.add("is-visible");
      });
      row.addEventListener("pointermove", (event) => {
        if (!wide()) return;
        tx = event.clientX;
        ty = event.clientY;
        if (!raf) {
          px = tx;
          py = ty;
          raf = window.requestAnimationFrame(paint);
        }
      });
      row.addEventListener("pointerleave", () => {
        preview.classList.remove("is-visible");
        if (raf) {
          window.cancelAnimationFrame(raf);
          raf = 0;
        }
      });
    });
  }

  // Sticky process, one active frame at a time.
  const process = doc.querySelector(".process");
  if (process) {
    const steps = Array.from(process.querySelectorAll(".process__step"));
    const images = Array.from(process.querySelectorAll(".process__img"));
    const indexEl = doc.getElementById("process-index");
    const setStep = (n) => {
      images.forEach((img) => img.classList.toggle("is-active", img.dataset.step === String(n)));
      if (indexEl) indexEl.textContent = String(n + 1).padStart(2, "0");
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setStep(Number(entry.target.dataset.step || 0));
        });
      }, { rootMargin: "-42% 0px -42% 0px" });
      steps.forEach((step) => io.observe(step));
    }
    setStep(0);
  }

  // Magnetic primary buttons, subtle and pointer only.
  if (finePointer && !reduceMotion) {
    doc.querySelectorAll("[data-magnetic]").forEach((el) => {
      el.addEventListener("pointermove", (event) => {
        const rect = el.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;
        el.style.setProperty("--mx", x.toFixed(1) + "px");
        el.style.setProperty("--my", y.toFixed(1) + "px");
      });
      el.addEventListener("pointerleave", () => {
        el.style.setProperty("--mx", "0px");
        el.style.setProperty("--my", "0px");
      });
    });
  }

  // Work filters.
  const filterBtns = Array.from(doc.querySelectorAll(".filter"));
  const workCards = Array.from(doc.querySelectorAll(".work-grid .work-card"));
  const workCount = doc.getElementById("work-count");
  if (filterBtns.length && workCards.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.setAttribute("aria-pressed", "false"));
        btn.setAttribute("aria-pressed", "true");
        const wanted = btn.dataset.filter;
        const visible = [];
        workCards.forEach((card) => {
          const cats = (card.dataset.category || "").split(" ").filter(Boolean);
          const show = wanted === "all" || cats.includes(wanted);
          card.hidden = !show;
          if (show) visible.push(card);
        });
        if (workCount) workCount.textContent = String(visible.length).padStart(2, "0") + (visible.length === 1 ? " frame" : " frames");
        if (!reduceMotion) {
          visible.forEach((card, i) => {
            card.animate(
              [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "translateY(0)" }],
              { duration: 520, delay: Math.min(i * 55, 320), easing: "cubic-bezier(0.16,1,0.3,1)", fill: "backwards" }
            );
          });
        }
      });
    });
  }

  // Lightbox with clip morph, counter, keyboard and focus restore.
  const dialog = doc.getElementById("lightbox");
  if (dialog) {
    const img = doc.getElementById("lightbox-img");
    const media = doc.getElementById("lightbox-media");
    const title = doc.getElementById("lightbox-title");
    const cap = doc.getElementById("lightbox-cap");
    const count = doc.getElementById("lightbox-count");
    const closeBtn = doc.getElementById("lightbox-close");
    const prevBtn = doc.getElementById("lightbox-prev");
    const nextBtn = doc.getElementById("lightbox-next");
    const openers = Array.from(doc.querySelectorAll("[data-lightbox]"));
    let current = 0;
    let last = null;
    const visible = () => openers.filter((b) => {
      const card = b.closest(".work-card");
      return card && !card.hidden;
    });
    const show = (n) => {
      const list = visible();
      if (!list.length) return;
      current = (n + list.length) % list.length;
      const btn = list[current];
      const card = btn.closest(".work-card");
      const thumb = card ? card.querySelector("img") : null;
      if (thumb) {
        img.src = thumb.currentSrc || thumb.src;
        img.alt = thumb.alt || "";
      }
      title.textContent = btn.dataset.title || "Frame";
      cap.textContent = btn.dataset.caption || "";
      if (count) count.textContent = String(current + 1).padStart(2, "0") + " / " + String(list.length).padStart(2, "0");
      if (!reduceMotion && media) {
        media.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: "cubic-bezier(0.16,1,0.3,1)" });
      }
    };
    openers.forEach((btn) => {
      btn.addEventListener("click", () => {
        last = btn;
        const list = visible();
        current = Math.max(0, list.indexOf(btn));
        show(current);
        if (typeof dialog.showModal === "function") dialog.showModal();
        const thumb = btn.closest(".work-card") ? btn.closest(".work-card").querySelector("img") : null;
        if (!reduceMotion && thumb && dialog.animate) {
          const tr = thumb.getBoundingClientRect();
          const dr = dialog.getBoundingClientRect();
          if (dr.width > 0) {
            const top = clamp(((tr.top - dr.top) / dr.height) * 100, 0, 100);
            const bottom = clamp(((dr.bottom - tr.bottom) / dr.height) * 100, 0, 100);
            const left = clamp(((tr.left - dr.left) / dr.width) * 100, 0, 100);
            const right = clamp(((dr.right - tr.right) / dr.width) * 100, 0, 100);
            dialog.animate(
              [{ clipPath: "inset(" + top + "% " + right + "% " + bottom + "% " + left + "%)", opacity: 0.35 },
               { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }],
              { duration: 520, easing: "cubic-bezier(0.16,1,0.3,1)" }
            );
          }
        }
      });
    });
    if (closeBtn) closeBtn.addEventListener("click", () => dialog.close());
    if (prevBtn) prevBtn.addEventListener("click", () => show(current - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => show(current + 1));
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") show(current - 1);
      if (event.key === "ArrowRight") show(current + 1);
    });
    dialog.addEventListener("close", () => { if (last) last.focus(); });
  }

  // FAQ accordion. Closed panels are inert so the collapsed copy leaves the tab order.
  const faqButtons = Array.from(doc.querySelectorAll(".faq__q"));
  if (faqButtons.length) {
    faqButtons.forEach((btn) => {
      const panel = doc.getElementById(btn.getAttribute("aria-controls"));
      if (panel) {
        panel.setAttribute("inert", "");
        panel.setAttribute("aria-hidden", "true");
      }
    });
    faqButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        const panel = doc.getElementById(btn.getAttribute("aria-controls"));
        if (panel) {
          panel.toggleAttribute("inert", open);
          panel.setAttribute("aria-hidden", String(open));
        }
      });
    });
  }

  // Booking demo: inline errors, loading, honest note. Nothing is sent.
  const form = doc.getElementById("booking-form");
  if (form) {
    const status = doc.getElementById("form-status");
    const submit = form.querySelector('button[type="submit"]');
    const name = form.querySelector("#name");
    const contact = form.querySelector("#contact");
    const type = form.querySelector('input[name="type"]');
    const date = form.querySelector("#date");
    const nameErr = doc.getElementById("name-error");
    const contactErr = doc.getElementById("contact-error");
    const typeErr = doc.getElementById("type-error");
    if (date) {
      const today = new Date();
      const iso = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
      date.min = iso;
    }
    const setErr = (input, err, bad) => {
      if (!input) return;
      input.setAttribute("aria-invalid", bad ? "true" : "false");
      if (err) err.hidden = !bad;
    };
    if (name) name.addEventListener("input", () => setErr(name, nameErr, false));
    if (contact) contact.addEventListener("input", () => setErr(contact, contactErr, false));
    form.querySelectorAll('input[name="type"]').forEach((radio) => {
      radio.addEventListener("change", () => setErr(type, typeErr, false));
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const nameBad = !name || !name.value.trim();
      const contactBad = !contact || !contact.value.trim();
      const typeBad = !form.querySelector('input[name="type"]:checked');
      setErr(name, nameErr, nameBad);
      setErr(contact, contactErr, contactBad);
      setErr(type, typeErr, typeBad);
      if (nameBad || contactBad || typeBad) {
        if (status) status.textContent = "Add your name, a way to reply, and the kind of shoot.";
        const first = nameBad ? name : contactBad ? contact : type;
        if (first) first.focus();
        return;
      }
      if (submit) {
        submit.disabled = true;
        submit.textContent = "Checking...";
        submit.setAttribute("aria-busy", "true");
      }
      if (status) status.textContent = "Checking the date...";
      window.setTimeout(() => {
        if (submit) {
          submit.disabled = false;
          submit.textContent = "Send the enquiry";
          submit.removeAttribute("aria-busy");
        }
        if (status) status.textContent = "Demo form. Nothing was sent. Add your WhatsApp, email or booking link to go live.";
      }, 800);
    });
  }
})();
