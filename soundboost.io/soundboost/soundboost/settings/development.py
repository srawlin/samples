from .defaults import *  # NOQA

ALLOWED_HOSTS = ['*']

STRIPE_SECRET_KEY = 'sk_test_zcWFG5kyrYFXWUShdgWnAdX1'  # Test mode key

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ),
}

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
