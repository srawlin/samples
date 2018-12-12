from __future__ import unicode_literals

from django.apps import AppConfig


class OrganizationsConfig(AppConfig):
    name = 'organizations'

    def ready(self):
        from . import signals  # noqa
