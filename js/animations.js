/**
 * NDIMB S.A — animations.js
 * Animations GSAP + ScrollTrigger. Le contenu reste visible par défaut
 * (voir input.css) : si GSAP ne se charge pas, la page reste fonctionnelle
 * et lisible, simplement sans les animations.
 *
 * Note technique : plusieurs éléments animés à l'entrée (cartes, liens)
 * portent aussi des classes Tailwind "transition-*" pour leurs effets au
 * survol (hover). Si on laisse cette transition CSS active pendant que
 * GSAP anime déjà opacity/transform, les deux moteurs se "battent" pour la
 * même propriété et l'élément peut rester visuellement bloqué à mi-chemin.
 * On désactive donc temporairement `transition` le temps de l'animation
 * d'entrée (onStart) puis on la restaure aussitôt après (onComplete) afin
 * que les effets de survol continuent de fonctionner normalement ensuite.
 */
(function () {
  "use strict";

  if (typeof gsap === "undefined") return;
  if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

  function suspendCSSTransition(els) {
    els.forEach(function (el) {
      el.style.transition = "none";
    });
  }
  function restoreCSSTransition(els) {
    els.forEach(function (el) {
      el.style.transition = "";
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ------------------------------------------------------------ */
    /* Timeline d'entrée du hero                                     */
    /* ------------------------------------------------------------ */
    var heroEls = gsap.utils.toArray(".hero-anim");
    if (heroEls.length) {
      gsap.timeline({ delay: reduceMotion ? 0 : 0.35 }).from(heroEls, {
        opacity: 0,
        y: reduceMotion ? 0 : 26,
        duration: reduceMotion ? 0.01 : 0.9,
        ease: "power3.out",
        stagger: reduceMotion ? 0 : 0.12,
        onStart: function () {
          suspendCSSTransition(heroEls);
        },
        onComplete: function () {
          restoreCSSTransition(heroEls);
        },
      });
    }

    /* ------------------------------------------------------------ */
    /* Révélations génériques au scroll                              */
    /* ------------------------------------------------------------ */
    if (typeof ScrollTrigger !== "undefined") {
      gsap.utils.toArray(".reveal-up").forEach(function (el) {
        gsap.from(el, {
          opacity: 0,
          y: reduceMotion ? 0 : 32,
          duration: reduceMotion ? 0.01 : 0.8,
          ease: "power3.out",
          onStart: function () {
            suspendCSSTransition([el]);
          },
          onComplete: function () {
            restoreCSSTransition([el]);
          },
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        });
      });

      // Cartes / listes en grille : révélation groupée avec effet de cascade,
      // en regroupant chaque lot de ".reveal-item" par conteneur parent.
      var itemGroups = new Map();
      gsap.utils.toArray(".reveal-item").forEach(function (el) {
        var parent = el.parentElement || document.body;
        if (!itemGroups.has(parent)) itemGroups.set(parent, []);
        itemGroups.get(parent).push(el);
      });

      itemGroups.forEach(function (items, parent) {
        gsap.from(items, {
          opacity: 0,
          y: reduceMotion ? 0 : 28,
          duration: reduceMotion ? 0.01 : 0.7,
          ease: "power3.out",
          stagger: reduceMotion ? 0 : 0.1,
          onStart: function () {
            suspendCSSTransition(items);
          },
          onComplete: function () {
            restoreCSSTransition(items);
          },
          scrollTrigger: {
            trigger: parent,
            start: "top 85%",
            once: true,
          },
        });
      });

      /* ------------------------------------------------------------ */
      /* Compteurs de statistiques                                     */
      /* ------------------------------------------------------------ */
      gsap.utils.toArray("[data-counter]").forEach(function (el) {
        var target = parseFloat(el.getAttribute("data-target") || "0");
        if (reduceMotion) {
          el.textContent = String(target);
          return;
        }
        var proxy = { val: 0 };
        gsap.to(proxy, {
          val: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            once: true,
          },
          onUpdate: function () {
            el.textContent = String(Math.round(proxy.val));
          },
        });
      });

      // Recalcule les positions de déclenchement une fois tout chargé
      // (images, polices) pour éviter des décalages de déclenchement.
      window.addEventListener("load", function () {
        ScrollTrigger.refresh();
      });
    }
  });
})();
