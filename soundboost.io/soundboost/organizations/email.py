from django.conf import settings
from django.core.mail import get_connection, EmailMultiAlternatives
from django.template.loader import render_to_string

from .models import Submission


def send_email(subject, text, from_email, to_email, html=None):

    with get_connection(
        host='smtp.sendgrid.net',
        port=587,
        username='soundboost-production',
        password='yTr.T2XQ',
        use_tls=True,
        fail_silently=False
    ) as connection:

        msg = EmailMultiAlternatives(
            subject,
            text,
            from_email,
            to_email,
            connection=connection)
        if html:
            msg.attach_alternative(html, "text/html")
        msg.send()


def notify_submitter_submission_result(submission):
    if submission.status not in [Submission.STATUS.approved,
                                 Submission.STATUS.declined]:
        raise ValueError('Submission status must be approved or '
                         'delcined to notify submitter')

    context = {'submitter': submission.submitted_by,
               'organization': submission.organization,
               'feedback': submission.comments.all(),
               'song': submission.song}

    # Declined
    if submission.status == Submission.STATUS.declined:
        text_content = render_to_string('email/submission_declined.txt',
                                        context)
        html_content = render_to_string('email/submission_declined.html',
                                        context)
        subject = '[soundboost] Your submission to {0} was declined'.format(
            submission.organization.name)
        send_email(subject,
                   text_content,
                   settings.NOTIFICATIONS_EMAIL,
                   [submission.submitted_by.email],
                   html_content)

    # Approved
    if submission.status == Submission.STATUS.approved:
        # email to submitter
        text_content = render_to_string(
            'email/submission_approved_submitter.txt',
            context)
        html_content = render_to_string(
            'email/submission_approved_submitter.html',
            context)
        subject = ('[soundboost] Congrats! Your submission to {0} was '
                   'approved'.format(submission.organization.name))
        send_email(subject,
                   text_content,
                   settings.NOTIFICATIONS_EMAIL,
                   [submission.submitted_by.email],
                   html_content)

        # email to reviewer
        text_content = render_to_string(
            'email/submission_approved_reviewer.txt',
            context)
        html_content = render_to_string(
            'email/submission_approved_reviewer.html',
            context)
        subject = '[soundboost] Approved song by {0}'.format(
            submission.submitted_by.get_full_name())
        send_email(subject,
                   text_content,
                   settings.NOTIFICATIONS_EMAIL,
                   [submission.organization.user.email],
                   html_content)


def organization_daily_summary(organization):
    new_submissions = organization.submissions_today
    if new_submissions > 0:
        context = {'organization': organization,
                   'new_count': new_submissions}
        text_content = render_to_string(
            'email/organization_daily_summary.txt', context)
        html_content = render_to_string(
            'email/organization_daily_summary.html', context)
        subject = '[soundboost] You have {0} new song to review'.format(
            new_submissions)
        send_email(subject,
                   text_content,
                   settings.NOTIFICATIONS_EMAIL,
                   [organization.user.email],
                   html_content)


def organization_welcome(organization):
    context = {'organization': organization}
    text_content = render_to_string(
        'email/organization_welcome.txt', context)
    html_content = render_to_string(
        'email/organization_welcome.html', context)
    subject = 'Welcome to soundboost!'
    send_email(subject,
               text_content,
               settings.NOTIFICATIONS_EMAIL,
               [organization.user.email],
               html_content)
