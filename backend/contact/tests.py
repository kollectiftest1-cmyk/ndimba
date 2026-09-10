import json

from django.core import mail
from django.test import Client, TestCase, override_settings
from django.urls import reverse

from .models import ContactMessage


@override_settings(CONTACT_RECIPIENT_EMAIL="destinataire-test@example.com")
class ContactSubmitTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = reverse("contact:submit")
        self.valid_payload = {
            "name": "Jean Kabila",
            "email": "jean.kabila@example.com",
            "phone": "+221771234567",
            "sector": "infrastructure",
            "message": "Bonjour, je souhaite un devis pour un projet routier.",
            "company": "",
        }

    def post(self, payload):
        return self.client.post(
            self.url, data=json.dumps(payload), content_type="application/json"
        )

    def test_valid_submission_is_saved_and_emailed(self):
        response = self.post(self.valid_payload)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["success"])

        self.assertEqual(ContactMessage.objects.count(), 1)
        saved = ContactMessage.objects.first()
        self.assertEqual(saved.email, "jean.kabila@example.com")
        self.assertTrue(saved.email_sent)

        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("destinataire-test@example.com", mail.outbox[0].to)

    def test_missing_required_field_is_rejected(self):
        payload = dict(self.valid_payload)
        payload["message"] = ""
        response = self.post(payload)
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.json()["success"])
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_invalid_email_is_rejected(self):
        payload = dict(self.valid_payload)
        payload["email"] = "pas-un-email"
        response = self.post(payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_honeypot_filled_is_silently_ignored(self):
        payload = dict(self.valid_payload)
        payload["company"] = "Je suis un robot"
        response = self.post(payload)
        # On répond succès pour ne pas révéler la détection au robot...
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["success"])
        # ...mais rien n'est enregistré ni envoyé.
        self.assertEqual(ContactMessage.objects.count(), 0)
        self.assertEqual(len(mail.outbox), 0)

    def test_get_method_not_allowed(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 405)
