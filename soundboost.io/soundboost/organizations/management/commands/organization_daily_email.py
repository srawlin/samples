from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from organizations.models import Organization
from organizations.email import organization_daily_summary


class Command(BaseCommand):
    help = 'Daily summary email sent to organizations with new submissions'

    def handle(self, *args, **options):
        organizations = Organization.objects.filter(
            submissions__created_at__gte=timezone.now() - timedelta(days=1)
        ).distinct('id')
        for organization in organizations:
            organization_daily_summary(organization)

        self.stdout.write(
            self.style.SUCCESS('Successfully emailed {0} organizations'.
                               format(organizations.count())))
