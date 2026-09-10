from django import forms

from .models import ContactMessage


class ContactForm(forms.ModelForm):
    """
    Formulaire de validation des soumissions de contact.

    Le champ ``company`` est un champ "pot de miel" (honeypot) : invisible
    pour un visiteur humain côté site, mais qu'un robot de spam remplit
    généralement automatiquement. S'il contient une valeur, la soumission
    est silencieusement écartée (voir contact/views.py).
    """

    company = forms.CharField(required=False, widget=forms.HiddenInput())

    class Meta:
        model = ContactMessage
        fields = ["name", "email", "phone", "sector", "message"]
        error_messages = {
            "name": {"required": "Veuillez indiquer votre nom."},
            "email": {
                "required": "Veuillez indiquer votre e-mail.",
                "invalid": "Veuillez saisir une adresse e-mail valide.",
            },
            "message": {"required": "Veuillez saisir un message."},
        }

    def clean_company(self):
        value = self.cleaned_data.get("company")
        if value:
            raise forms.ValidationError("Spam détecté.")
        return value

    def clean_name(self):
        return self.cleaned_data["name"].strip()

    def clean_message(self):
        return self.cleaned_data["message"].strip()
