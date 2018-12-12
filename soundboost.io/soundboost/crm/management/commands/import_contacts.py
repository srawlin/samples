import csv

from django.core.management.base import BaseCommand

from crm.models import Contact


class Command(BaseCommand):
    help = 'Import music blog directory into CRM'

    def add_arguments(self, parser):
        parser.add_argument('csvfile')
        parser.add_argument(
            '-d',
            '--dry-run',
            action='store_true',
            dest='dry_run',
            help="Dry-run. Don't actually do anything.",
        )

    def handle(self, *args, **options):
        count = 0
        with open(options['csvfile'], 'rU') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                blog = row['NAME OF BLOG'].decode(
                    'utf-8', 'ignore'
                ).encode("utf-8")[0:50].replace('(H)', '').strip()

                website = row['WEBSITE'][0:50]
                email = row['EMAIL ADDRESS']
                first_name = row['F. NAME'].decode(
                    'utf-8', 'ignore').encode("utf-8")[0:50].strip()

                last_name = row['L. NAME'].decode(
                    'utf-8', 'ignore'
                ).encode("utf-8")[0:50].strip()

                genre = row['GENRE'][0:50].strip()
                description = row['DESCRIPTION / AUTHORS WORDS'].decode(
                    'utf-8', 'ignore').encode("utf-8")

                blog_software = row['BLOG SOFTWARE'].lower()
                alexa_rank = int(row['ALEXA RANK']) if len(
                    row['ALEXA RANK']) else None

                if not options['dry_run']:
                    Contact.objects.create(
                        first_name=first_name,
                        last_name=last_name,
                        email=email,
                        organization_name=blog,
                        url=website,
                        description=description,
                        genre=genre,
                        alexa_rank=alexa_rank,
                        blog_software=blog_software)

                count = count + 1

        self.stdout.write('Contacts added: {0}'.format(count))
