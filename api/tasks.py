from datetime import timedelta
from django.utils import timezone
from .models import Subscription, UserToken
import os
import json

# Parse TOKEN_ALLOCATION_MAP from the environment variable
try:
    token_allocation_map_str = os.getenv('TOKEN_ALLOCATION_MAP', '{}')
    TOKEN_ALLOCATION_MAP = json.loads(token_allocation_map_str)
except json.JSONDecodeError as e:
    TOKEN_ALLOCATION_MAP = {}
    print(f"Error parsing TOKEN_ALLOCATION_MAP from environment variable: {e}")

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
