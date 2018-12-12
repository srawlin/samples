from __future__ import unicode_literals

from django.db import models
from model_utils import Choices


class Contact(models.Model):

    KIND = Choices(
        ('soundcloud', 'soundcloud', 'Soundcloud'),
        ('youtube', 'youtube', 'Youtube'),
        ('blog', 'blog', 'blog'),
        ('facebook', 'facebook', 'Facebook')
    )
    BLOG_KIND = Choices(
        ('wordpress', 'wordpress', 'WordPress'),
    )

    SALES_STATUS = Choices(
        ('contacted', 'contacted', 'Contacted'),
        ('responded', 'responded', 'Responded'),
        ('joined', 'joined', 'Joined'),
        ('active', 'active', 'Active')
    )

    first_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(unique=True)
    organization_name = models.CharField(max_length=50, blank=True, null=True)
    kind = models.CharField(
        max_length=20,
        choices=KIND,
        blank=False,
        default=KIND.blog
    )
    alexa_rank = models.PositiveIntegerField(null=True)
    url = models.URLField(blank=True, null=True)
    blog_software = models.CharField(
        max_length=20,
        choices=BLOG_KIND,
        blank=True,
        null=True
    )
    description = models.TextField(blank=True, null=True)
    genre = models.CharField(max_length=50, blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=SALES_STATUS,
        blank=True,
        null=True
    )

    def __unicode__(self):
        return '{0} - {1} {2}'.format(
            self.organization_name,
            self.first_name,
            self.last_name
        )


class SentEmail(models.Model):
    contact = models.ForeignKey(Contact)
    created_at = models.DateTimeField(auto_now_add=True)
    template = models.CharField(max_length=50)
