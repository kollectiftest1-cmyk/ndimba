/**
 * NDIMB S.A — main.js
 * Interactions générales : langue FR/EN, menu mobile, navigation active,
 * bouton retour en haut, préchargeur, année du footer.
 * Aucune dépendance externe (GSAP est utilisé séparément dans animations.js).
 */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* Helpers de stockage (dégradation silencieuse si indisponible)       */
  /* ------------------------------------------------------------------ */
  function getStoredLang() {
    try {
      return localStorage.getItem("ndimb_lang");
    } catch (e) {
      return null;
    }
  }
  function storeLang(lang) {
    try {
      localStorage.setItem("ndimb_lang", lang);
    } catch (e) {
      /* stockage indisponible (navigation privée, etc.) — on continue sans persister */
    }
  }

  /* ------------------------------------------------------------------ */
  /* Langue FR / EN                                                      */
  /* ------------------------------------------------------------------ */
  function applyTranslatedAttributes(lang) {
    // Placeholders des champs de formulaire
    document.querySelectorAll("[data-placeholder-fr]").forEach(function (el) {
      var value = lang === "en" ? el.getAttribute("data-placeholder-en") : el.getAttribute("data-placeholder-fr");
      if (value !== null) el.setAttribute("placeholder", value);
    });
    // Options de listes déroulantes
    document.querySelectorAll("option[data-fr]").forEach(function (opt) {
      var value = lang === "en" ? opt.getAttribute("data-en") : opt.getAttribute("data-fr");
      if (value !== null) opt.textContent = value;
    });
  }

  function setLanguage(lang, opts) {
    var silent = opts && opts.silent;
    document.documentElement.classList.toggle("lang-en", lang === "en");
    document.documentElement.setAttribute("lang", lang === "en" ? "en" : "fr");

    document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
      var isActive = btn.getAttribute("data-lang-btn") === lang;
      btn.classList.toggle("bg-gold-500", isActive);
      btn.classList.toggle("text-primary-950", isActive);
      btn.classList.toggle("text-white/60", !isActive);
    });

    applyTranslatedAttributes(lang);

    var body = document.body;
    if (body) {
      var titleAttr = lang === "en" ? "data-title-en" : "data-title-fr";
      var title = body.getAttribute(titleAttr);
      if (title) document.title = title;
    }

    if (!silent) storeLang(lang);
  }

  function initLanguage() {
    var stored = getStoredLang();
    var lang = stored === "en" ? "en" : "fr";
    setLanguage(lang, { silent: true });

    document.querySelectorAll("[data-lang-btn]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLanguage(btn.getAttribute("data-lang-btn"));
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Menu mobile                                                         */
  /* ------------------------------------------------------------------ */
  function initMobileMenu() {
    var menu = document.getElementById("mobile-menu");
    var openBtn = document.getElementById("mobile-menu-btn");
    var closeBtn = document.getElementById("mobile-menu-close");
    if (!menu || !openBtn) return;

    function openMenu() {
      menu.classList.remove("translate-x-full");
      document.documentElement.classList.add("overflow-hidden");
    }
    function closeMenu() {
      menu.classList.add("translate-x-full");
      document.documentElement.classList.remove("overflow-hidden");
    }

    openBtn.addEventListener("click", openMenu);
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Navigation active + en-tête compact au scroll                       */
  /* ------------------------------------------------------------------ */
  function initHeaderState() {
    var header = document.getElementById("site-header");
    var currentPage = document.body ? document.body.getAttribute("data-page") : null;

    if (currentPage) {
      document.querySelectorAll("nav a[data-page]").forEach(function (link) {
        if (link.getAttribute("data-page") === currentPage) {
          link.classList.add("text-white");
          link.classList.remove("text-white/80");
        }
      });
    }

    if (!header) return;
    function onScroll() {
      if (window.scrollY > 12) {
        header.classList.add("shadow-lg", "shadow-primary-950/30");
      } else {
        header.classList.remove("shadow-lg", "shadow-primary-950/30");
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------------------------------------------------ */
  /* Bouton retour en haut                                               */
  /* ------------------------------------------------------------------ */
  function initBackToTop() {
    var btn = document.getElementById("back-to-top");
    if (!btn) return;

    function onScroll() {
      var visible = window.scrollY > 600;
      btn.classList.toggle("opacity-0", !visible);
      btn.classList.toggle("translate-y-20", !visible);
      btn.classList.toggle("opacity-100", visible);
      btn.classList.toggle("translate-y-0", visible);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Préchargeur : disparaît dès que la page est prête (avec filet de    */
  /* sécurité pour ne jamais rester bloqué à l'écran).                   */
  /* ------------------------------------------------------------------ */
  function initPreloader() {
    var preloader = document.getElementById("preloader");
    if (!preloader) return;

    function hide() {
      if (!preloader || preloader.dataset.hidden === "true") return;
      preloader.dataset.hidden = "true";
      preloader.style.transition = "opacity 0.5s ease";
      preloader.style.opacity = "0";
      setTimeout(function () {
        if (preloader && preloader.parentNode) preloader.parentNode.removeChild(preloader);
      }, 550);
    }

    window.addEventListener("load", hide);
    // Filet de sécurité : au cas où l'évènement "load" tarderait (images lentes, etc.)
    setTimeout(hide, 2500);
  }

  /* ------------------------------------------------------------------ */
  /* Année automatique dans le footer                                    */
  /* ------------------------------------------------------------------ */
  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------ */
  /* Init                                                                */
  /* ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    initLanguage();
    initMobileMenu();
    initHeaderState();
    initBackToTop();
    initPreloader();
    initYear();
  });
})();
