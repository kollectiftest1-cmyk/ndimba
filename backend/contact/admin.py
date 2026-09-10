from django.contrib import admin

from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "sector", "email_sent", "created_at")
    list_filter = ("sector", "email_sent", "created_at")
    search_fields = ("name", "email", "phone", "message")
    readonly_fields = ("name", "email", "phone", "sector", "message", "created_at", "email_sent")
    ordering = ("-created_at",)

    def has_add_permission(self, request):
        # Les messages sont créés uniquement via le formulaire du site.
        return False
