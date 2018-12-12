import stripe

from django.conf import settings

from .models import Charge


def charge_user(user, card_token, amount):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    charge = stripe.Charge.create(
        source=card_token, currency='usd', amount=amount
    )
    return Charge.objects.create(
        amount=amount,
        created_by=user,
        stripe_id=charge.id,
    )
