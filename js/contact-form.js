/**
 * NDIMB S.A — contact-form.js
 * Gestion du formulaire de contact : pré-sélection du secteur via l'URL,
 * validation, envoi à l'API Django, retour visuel bilingue.
 *
 * IMPORTANT — À CONFIGURER AVANT DÉPLOIEMENT :
 * Renseignez ici l'URL de l'API du backend Django (voir dossier /backend).
 * En local (django manage.py runserver), l'URL par défaut est déjà correcte.
 * En production, remplacez-la par l'URL réelle de votre API déployée,
 * par ex. "https://api.ndimb-sa.com/api/contact/".
 */
var NDIMB_CONTACT_API_URL = "http://127.0.0.1:8000/api/contact/";

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("contact-form-el");
    if (!form) return;

    var sectorSelect = document.getElementById("sector");
    var submitBtn = document.getElementById("contact-submit-btn");
    var submitLabel = submitBtn ? submitBtn.querySelector("[data-btn-label]") : null;
    var submitSpinner = document.getElementById("contact-submit-spinner");
    var feedback = document.getElementById("form-feedback");
    var feedbackText = document.getElementById("form-feedback-text");
    var feedbackIcon = document.getElementById("form-feedback-icon");

    /* -------------------------------------------------------------- */
    /* Pré-sélection du secteur depuis l'URL (?secteur=infrastructure) */
    /* -------------------------------------------------------------- */
    try {
      var params = new URLSearchParams(window.location.search);
      var sector = params.get("secteur") || params.get("sector");
      if (sector && sectorSelect) {
        var optionExists = Array.prototype.some.call(sectorSelect.options, function (opt) {
          return opt.value === sector;
        });
        if (optionExists) sectorSelect.value = sector;
      }
    } catch (e) {
      /* URLSearchParams indisponible ou paramètre invalide : on ignore */
    }

    function isEnglish() {
      return document.documentElement.classList.contains("lang-en");
    }

    function showFeedback(type, frMessage, enMessage) {
      if (!feedback || !feedbackText) return;
      feedback.classList.remove("hidden");
      feedback.classList.remove("flex");
      feedback.classList.add("flex");

      feedback.classList.remove("bg-leaf-50", "text-leaf-700", "bg-red-50", "text-red-700");
      if (type === "success") {
        feedback.classList.add("bg-leaf-50", "text-leaf-700");
        if (feedbackIcon) feedbackIcon.setAttribute("href", "#ic-check-circle");
      } else {
        feedback.classList.add("bg-red-50", "text-red-700");
        if (feedbackIcon) feedbackIcon.setAttribute("href", "#ic-alert");
      }
      feedbackText.textContent = isEnglish() ? enMessage : frMessage;
      feedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function setLoading(isLoading) {
      if (!submitBtn) return;
      submitBtn.disabled = isLoading;
      submitBtn.classList.toggle("opacity-70", isLoading);
      submitBtn.classList.toggle("cursor-not-allowed", isLoading);
      if (submitLabel) submitLabel.classList.toggle("opacity-0", isLoading);
      if (submitSpinner) submitSpinner.classList.toggle("hidden", !isLoading);
    }

    function isValidEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (feedback) feedback.classList.add("hidden");

      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var message = form.message.value.trim();

      if (!name || !email || !message) {
        showFeedback(
          "error",
          "Veuillez remplir tous les champs obligatoires.",
          "Please fill in all required fields."
        );
        return;
      }
      if (!isValidEmail(email)) {
        showFeedback("error", "Veuillez saisir une adresse email valide.", "Please enter a valid email address.");
        return;
      }

      var payload = {
        name: name,
        email: email,
        phone: form.phone.value.trim(),
        sector: form.sector.value,
        message: message,
        company: form.company.value, // champ piège (honeypot) — doit rester vide
      };

      setLoading(true);

      fetch(NDIMB_CONTACT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (response) {
          return response
            .json()
            .catch(function () {
              return {};
            })
            .then(function (data) {
              return { ok: response.ok, data: data };
            });
        })
        .then(function (result) {
          setLoading(false);
          if (result.ok && result.data && result.data.success) {
            form.reset();
            showFeedback(
              "success",
              "Merci ! Votre message a bien été envoyé. Notre équipe vous répondra rapidement.",
              "Thank you! Your message has been sent. Our team will get back to you shortly."
            );
          } else {
            var frErr =
              (result.data && result.data.message) ||
              "Une erreur est survenue lors de l'envoi. Veuillez réessayer.";
            var enErr =
              (result.data && result.data.message_en) ||
              "Something went wrong while sending your message. Please try again.";
            showFeedback("error", frErr, enErr);
          }
        })
        .catch(function () {
          setLoading(false);
          showFeedback(
            "error",
            "Impossible de contacter le serveur. Vérifiez votre connexion ou réessayez plus tard.",
            "Unable to reach the server. Check your connection or try again later."
          );
        });
    });
  });
})();
