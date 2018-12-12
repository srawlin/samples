from django.core.management.base import BaseCommand
from django.db import transaction
from django.template.loader import render_to_string
from mailer import send_mail

from crm.models import Contact, SentEmail


class Command(BaseCommand):
    help = 'Send email from CRM'

    def add_arguments(self, parser):
        parser.add_argument('alexa_low')
        parser.add_argument('alexa_high')
        parser.add_argument('template')

        parser.add_argument(
            '-d',
            '--dry-run',
            action='store_true',
            dest='dry_run',
            help="Dry-run. Don't actually do anything.",
        )

    def handle(self, *args, **options):
        count = 0
        contacts = Contact.objects.filter(
            alexa_rank__gt=options['alexa_low'],
            alexa_rank__lt=options['alexa_high'],
            status=None
        ).exclude(
            first_name=''
        )

        for contact in contacts:

            context = {'first_name': contact.first_name,
                       'organization': contact.organization_name}

            text_content = render_to_string(
                'crm/{0}.txt'.format(options['template']),
                context
            )
            text_subject = render_to_string(
                'crm/{0}_subject.txt'.format(options['template']),
                context
            )

            # send email
            if not options['dry_run']:
                send_mail(
                    text_subject,
                    text_content,
                    'Steve Rawlinson <steve@soundboost.io>',
                    [contact.email],
                )

                with transaction.atomic():
                    SentEmail.objects.create(
                        contact=contact,
                        template=options['template'])

                    contact.status = Contact.SALES_STATUS.contacted
                    contact.save()

            count = count + 1

        self.stdout.write('Contacts emailed: {0}'.format(count))
