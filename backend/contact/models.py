from django.db import models


class ContactMessage(models.Model):
    """Un message soumis via le formulaire de contact du site NDIMB S.A."""

    class Sector(models.TextChoices):
        INFRASTRUCTURE = "infrastructure", "Infrastructure"
        BTP = "btp", "BTP"
        TRANSPORT = "transport", "Transport & Logistique"
        NUMERIQUE = "numerique", "Numérique"
        AGROALIMENTAIRE = "agroalimentaire", "Agroalimentaire"
        AUTRE = "autre", "Autre"

    name = models.CharField("Nom complet", max_length=150)
    email = models.EmailField("E-mail")
    phone = models.CharField("Téléphone", max_length=40, blank=True)
    sector = models.CharField(
        "Secteur concerné", max_length=30, choices=Sector.choices, blank=True
    )
    message = models.TextField("Message")
    created_at = models.DateTimeField("Reçu le", auto_now_add=True)
    email_sent = models.BooleanField("E-mail envoyé", default=False)

    class Meta:
        verbose_name = "Message de contact"
        verbose_name_plural = "Messages de contact"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} <{self.email}> — {self.created_at:%Y-%m-%d %H:%M}"
