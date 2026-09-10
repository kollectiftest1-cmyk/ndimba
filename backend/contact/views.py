import json
import logging

from django.conf import settings
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django_ratelimit.decorators import ratelimit

from .forms import ContactForm

logger = logging.getLogger(__name__)


def _json_error(message_fr, message_en, status=400):
    return JsonResponse(
        {"success": False, "message": message_fr, "message_en": message_en},
        status=status,
    )


@csrf_exempt
@require_POST
@ratelimit(key="ip", rate="10/h", method="POST", block=False)
def contact_submit(request):
    """
    Point d'entrée de l'API de contact : POST /api/contact/

    Reçoit un JSON {name, email, phone, sector, message, company}, valide la
    soumission, l'enregistre en base (visible dans /admin/) puis envoie un
    e-mail à l'adresse définie par CONTACT_RECIPIENT_EMAIL dans backend/.env.

    L'enregistrement en base a lieu même si l'envoi de l'e-mail échoue,
    afin qu'aucun message ne soit jamais perdu.
    """
    if getattr(request, "limited", False):
        return _json_error(
            "Trop de tentatives. Veuillez réessayer dans quelques instants.",
            "Too many attempts. Please try again shortly.",
            status=429,
        )

    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return _json_error("Requête invalide.", "Invalid request.")

    form = ContactForm(payload)

    if not form.is_valid():
        if "company" in form.errors:
            # Soumission probable d'un robot : on répond "succès" pour ne
            # pas révéler la détection, sans rien enregistrer ni envoyer.
            return JsonResponse({"success": True})
        first_error = next(iter(form.errors.values()))[0]
        return _json_error(first_error, first_error)

    contact_message = form.save()

    recipient = settings.CONTACT_RECIPIENT_EMAIL
    if recipient:
        subject = "Nouveau message du site — {}".format(
            contact_message.get_sector_display() or "Contact général"
        )
        body = (
            "Nom : {name}\n"
            "E-mail : {email}\n"
            "Téléphone : {phone}\n"
            "Secteur : {sector}\n\n"
            "Message :\n{message}"
        ).format(
            name=contact_message.name,
            email=contact_message.email,
            phone=contact_message.phone or "N/A",
            sector=contact_message.get_sector_display() or "N/A",
            message=contact_message.message,
        )
        try:
            send_mail(
                subject=subject,
                message=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=False,
            )
            contact_message.email_sent = True
            contact_message.save(update_fields=["email_sent"])
        except Exception:
            logger.exception(
                "Échec de l'envoi de l'e-mail pour le message de contact #%s "
                "(le message reste enregistré en base).",
                contact_message.pk,
            )
    else:
        logger.warning(
            "CONTACT_RECIPIENT_EMAIL n'est pas configuré dans backend/.env : "
            "e-mail non envoyé pour le message #%s (reste enregistré en base).",
            contact_message.pk,
        )

    return JsonResponse(
        {
            "success": True,
            "message": "Message envoyé avec succès.",
            "message_en": "Message sent successfully.",
        }
    )
