from __future__ import unicode_literals

from django.db import models

from users.models import User


class Charge(models.Model):

    amount = models.PositiveIntegerField()
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    stripe_id = models.CharField(max_length=255)
