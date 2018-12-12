from __future__ import unicode_literals

from datetime import timedelta

from django.db import models
from django.utils import timezone
from model_utils import Choices, FieldTracker

from billing.models import Charge
from users.models import User


class Organization(models.Model):

    name = models.CharField(max_length=50)
    slug = models.SlugField(unique=True)
    user = models.OneToOneField(User)
    songs = models.ManyToManyField('Song', through='Submission')
    reviewers = models.ManyToManyField(
        User, through='Reviewer', related_name='reviewing_organizations'
    )
    url = models.CharField(max_length=80)

    def __unicode__(self):
        return self.name

    @property
    def average_response_time(self):
        average = self.submissions.aggregate(
            average=models.Avg('response_time')
        )['average']
        return average.seconds if average else None

    @property
    def submissions_today(self):
        return self.submissions.filter(
            created_at__gte=timezone.now() - timedelta(days=1)
        ).count()

    @property
    def approval_rate(self):
        submissions = self.submissions.count()
        if submissions > 0:
            return self.submissions.filter(
                status=Submission.SUBMISSION_STATUS.approved
            ).count() / float(submissions)
        return None


class Reviewer(models.Model):

    organization = models.ForeignKey(Organization)
    user = models.ForeignKey(User)

    def __unicode__(self):
        return u'{0} at {1}'.format(self.user.email, self.organization)


class Song(models.Model):

    KIND = Choices(
        ('soundcloud', 'soundcloud', 'Soundcloud'),
        ('youtube', 'youtube', 'Youtube'),
    )

    title = models.CharField(max_length=200)
    kind = models.CharField(
        max_length=20,
        choices=KIND,
        blank=False,
    )
    identifier = models.CharField(max_length=20, null=True, blank=True)
    url = models.URLField(null=True, blank=True)

    def __unicode__(self):
        return self.title

    def get_url(self):
        if self.kind == Song.KIND.youtube:
            return 'https://www.youtube.com/watch?v={0}'.format(
                self.identifier)
        return self.url


class Submission(models.Model):

    STATUS = Choices(
        ('new', 'new', 'New'),
        ('approved', 'approved', 'Approved'),
        ('declined', 'declined', 'Declined'),
    )

    created_at = models.DateTimeField(auto_now_add=True)
    song = models.ForeignKey(Song, related_name='submissions')
    organization = models.ForeignKey(Organization, related_name='submissions')
    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default=STATUS.new
    )
    submitted_by = models.ForeignKey(User, related_name='submissions')
    response_time = models.DurationField(null=True, blank=True)
    charge = models.OneToOneField(
        Charge, null=True, blank=True, on_delete=models.PROTECT
    )
    tracker = FieldTracker()

    def __unicode__(self):
        return u'{0} ({1}) from {2}'.format(self.organization,
                                            self.status,
                                            self.submitted_by.email)

    @property
    def is_paid(self):
        return bool(self.charge)


class Comment(models.Model):

    text = models.TextField()
    created_by = models.ForeignKey(User, related_name='comments')
    created_at = models.DateTimeField(auto_now_add=True)
    submission = models.ForeignKey(Submission, related_name='comments')

    def __unicode__(self):
        return u'{0} - {1}'.format(self.submission,
                                   self.text[0:25])
