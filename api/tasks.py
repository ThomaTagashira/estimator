from datetime import timedelta
from django.utils import timezone
from .models import Subscription, UserToken
import os

TOKEN_ALLOCATION_MAP = os.getenv('TOKEN_ALLOCATION_MAP')


def allocate_monthly_tokens():
    subscriptions = Subscription.objects.filter(is_active=True)
    for subscription in subscriptions:
        # Check if 30 days have passed since the last token allocation
        if subscription.last_token_allocation_date is None or (
            timezone.now() - subscription.last_token_allocation_date >= timedelta(days=30)
        ):
            tokens_to_add = TOKEN_ALLOCATION_MAP.get(subscription.subscription_type, 0)
            user_token, created = UserToken.objects.get_or_create(user=subscription.user)
            user_token.token_balance += tokens_to_add
            user_token.save()

            # Update last_token_allocation_date
            subscription.last_token_allocation_date = timezone.now()
            subscription.save()
