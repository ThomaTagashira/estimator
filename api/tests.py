from datetime import timedelta
from django.utils import timezone
from .models import Subscription, UserToken
import os
import json

# Parse TOKEN_ALLOCATION_MAP from the environment variable
try:
    token_allocation_map_str = os.getenv('TOKEN_ALLOCATION_MAP', '{}')
    TOKEN_ALLOCATION_MAP = json.loads(token_allocation_map_str)
    print(f"Parsed TOKEN_ALLOCATION_MAP: {TOKEN_ALLOCATION_MAP}")
except json.JSONDecodeError as e:
    TOKEN_ALLOCATION_MAP = {}
    print(f"Error parsing TOKEN_ALLOCATION_MAP from environment variable: {e}")

def allocate_monthly_tokens():
    print("Starting token allocation process...")
    subscriptions = Subscription.objects.filter(is_active=True)
    print(f"Found {subscriptions.count()} active subscriptions")

    for subscription in subscriptions:
        print(f"Processing subscription for user: {subscription.user.username}")
        print(f"Subscription type: {subscription.subscription_type}")
        print(f"Last token allocation date: {subscription.last_token_allocation_date}")

        # Check if 30 days have passed since the last token allocation
        if subscription.last_token_allocation_date is None or (
            timezone.now() - subscription.last_token_allocation_date >= timedelta(days=30)
        ):
            tokens_to_add = TOKEN_ALLOCATION_MAP.get(subscription.subscription_type, 0)
            print(f"Tokens to add for subscription type {subscription.subscription_type}: {tokens_to_add}")

            if tokens_to_add > 0:
                user_token, created = UserToken.objects.get_or_create(user=subscription.user)
                print(f"Previous token balance: {user_token.token_balance}")

                user_token.token_balance += tokens_to_add
                user_token.save()
                print(f"New token balance: {user_token.token_balance}")

                # Update last_token_allocation_date
                subscription.last_token_allocation_date = timezone.now()
                subscription.save()
                print(f"Updated last_token_allocation_date to {subscription.last_token_allocation_date}")
            else:
                print(f"No tokens to allocate for subscription type: {subscription.subscription_type}")
        else:
            days_since_last_allocation = (timezone.now() - subscription.last_token_allocation_date).days
            print(f"No allocation needed; only {days_since_last_allocation} days since last allocation.")
