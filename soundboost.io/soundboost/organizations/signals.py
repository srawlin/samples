from django.db.models import signals
from django.dispatch import receiver
from django.utils import timezone
from slugify import slugify

from .models import Organization, Submission
from .email import notify_submitter_submission_result, organization_welcome


@receiver(signals.pre_save, sender=Organization)
def organization_pre_save(instance, **kwargs):
    if instance.id:
        return

    initial_slug = slugify(instance.name)
    slugs = list(
        Organization.objects.filter(slug__startswith=initial_slug)
        .values_list('slug', flat=True)
    )

    slug = initial_slug
    i = 0
    while slug in slugs:
        slug = '{0}{1}'.format(initial_slug, str(i))
        i += 1

    instance.slug = slug


@receiver(signals.pre_save, sender=Submission)
def submission_pre_save(instance, **kwargs):
    changed = instance.tracker.changed()
    if changed.get('status') == Submission.STATUS.new:
        instance.response_time = timezone.now() - instance.created_at


@receiver(signals.post_save, sender=Submission)
def submission_post_save(instance, **kwargs):
    changed = instance.tracker.changed()

    # status changes from new to approved/declined
    if changed.get('status') == Submission.STATUS.new and (
            instance.status in [Submission.STATUS.approved,
                                Submission.STATUS.declined]):
        notify_submitter_submission_result(instance)


@receiver(signals.post_save, sender=Organization)
def organization_post_save(instance, created, **kwargs):
    if created:
        organization_welcome(instance)
