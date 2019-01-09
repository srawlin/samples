from decimal import *

from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.contrib.auth.models import User
from django.conf import settings
from django.db.models.signals import post_save

class UserProfile(models.Model):
    user = models.OneToOneField(User)
    balance = models.DecimalField(default=100000.0, decimal_places=2, max_digits=12, validators=[MinValueValidator(Decimal('0.00'))], blank=False, null=False)

def create_profile(sender, instance, created, **kwargs):
    if created:
        profile, created = UserProfile.\
                 objects.get_or_create(user=instance)
post_save.connect(create_profile, sender=User)

class Holdings(models.Model):
	owner = models.ForeignKey(settings.AUTH_USER_MODEL, blank=False, null=False)
	symbol = models.CharField(max_length=64, blank=False, null=False )
	company_name = models.CharField(max_length=256, blank=False, null=False)
	quantity = models.IntegerField(default=0, blank=False, null=False, validators=[MinValueValidator(0)])
	price_paid = models.DecimalField(decimal_places=2, max_digits=12, validators=[MinValueValidator(Decimal('0.01'))], blank=False, null=False)

	class Meta:
		unique_together = (("owner", "symbol"),)

	def __str__(self):
		return str("%s %s %d" % (self.owner, self.symbol, self.quantity))