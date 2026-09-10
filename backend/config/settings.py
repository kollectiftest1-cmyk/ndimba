"""
Django settings for the NDIMB S.A contact API (project "config").

Ce backend a un rôle volontairement restreint : recevoir les soumissions du
formulaire de contact du site (statique, servi séparément), les enregistrer
et les transmettre par e-mail à l'adresse définie dans le fichier .env.

Toute la configuration sensible ou dépendante de l'environnement est lue
depuis un fichier .env (voir .env.example) grâce à django-environ.
"""

from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DEBUG=(bool, False),
)
# Lit le fichier backend/.env s'il existe (absent en production si les
# variables sont fournies autrement, par ex. par la plateforme d'hébergement).
environ.Env.read_env(BASE_DIR / ".env")


# ---------------------------------------------------------------------------
# Sécurité de base
# ---------------------------------------------------------------------------

SECRET_KEY = env(
    "DJANGO_SECRET_KEY",
    default="django-insecure-dev-only-change-me-before-deploying",
)

DEBUG = env.bool("DEBUG", default=True)

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["127.0.0.1", "localhost"])


# ---------------------------------------------------------------------------
# Applications
# ---------------------------------------------------------------------------

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "contact",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# ---------------------------------------------------------------------------
# Base de données — SQLite par défaut (suffisant pour ce backend léger).
# ---------------------------------------------------------------------------

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# ---------------------------------------------------------------------------
# Validation des mots de passe (comptes de l'admin Django)
# ---------------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# ---------------------------------------------------------------------------
# Internationalisation
# ---------------------------------------------------------------------------

LANGUAGE_CODE = "fr-fr"
TIME_ZONE = env("DJANGO_TIME_ZONE", default="Africa/Dakar")
USE_I18N = True
USE_TZ = True


# ---------------------------------------------------------------------------
# Fichiers statiques
# ---------------------------------------------------------------------------

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ---------------------------------------------------------------------------
# CORS — le site (statique) et l'API tournent sur des origines différentes.
# ---------------------------------------------------------------------------

CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:8080",
        "http://localhost:8080",
    ],
)
# Autorise également les ouvertures directes du site en fichier local
# (Origin: null envoyé par le navigateur pour les pages ouvertes via file://).
CORS_ALLOWED_ORIGIN_REGEXES = [r"^null$"] if DEBUG else []


# ---------------------------------------------------------------------------
# E-mail — envoi des messages du formulaire de contact.
# CONTACT_RECIPIENT_EMAIL est l'adresse qui recevra les messages : c'est LA
# variable à renseigner dans backend/.env (voir .env.example).
# ---------------------------------------------------------------------------

# Bascule automatiquement sur un envoi SMTP réel dès que des identifiants
# sont renseignés dans .env ; sinon les e-mails s'affichent simplement dans
# la console (pratique en développement, sans configuration nécessaire).
_smtp_configured = bool(env("EMAIL_HOST_USER", default="") and env("EMAIL_HOST_PASSWORD", default=""))
EMAIL_BACKEND = env(
    "EMAIL_BACKEND",
    default="django.core.mail.backends.smtp.EmailBackend"
    if _smtp_configured
    else "django.core.mail.backends.console.EmailBackend",
)
EMAIL_HOST = env("EMAIL_HOST", default="smtp.gmail.com")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
EMAIL_USE_SSL = env.bool("EMAIL_USE_SSL", default=False)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="Site NDIMB S.A <no-reply@ndimb-sa.com>")

# L'adresse qui reçoit les messages envoyés depuis le formulaire de contact.
CONTACT_RECIPIENT_EMAIL = env("CONTACT_RECIPIENT_EMAIL", default="")
