"""
Configuration des URLs du backend NDIMB S.A.

- /admin/       Interface d'administration Django (consultation des messages
                de contact enregistrés — voir contact/admin.py).
- /api/contact/ API JSON utilisée par le formulaire de contact du site.
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("contact.urls")),
]
