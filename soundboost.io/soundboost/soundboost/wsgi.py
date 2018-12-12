"""
WSGI config for submit project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.10/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

level = os.environ.get('LEVEL') or 'development'
os.environ.setdefault(
    'DJANGO_SETTINGS_MODULE',
    'soundboost.settings.{0}'.format(level)
)

application = get_wsgi_application()
