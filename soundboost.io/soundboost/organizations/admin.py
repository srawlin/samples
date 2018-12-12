from django.contrib import admin

from .models import (
    Comment,
    Organization,
    Reviewer,
    Song,
    Submission,
)

admin.site.register(Organization)
admin.site.register(Reviewer)
admin.site.register(Song)
admin.site.register(Submission)
admin.site.register(Comment)
