# test_subscription_token_distribution.sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Print commands and their arguments as they are executed.
set -x

# Run Django migrations (if needed)
python manage.py migrate

# Set up test data for token distribution
python manage.py shell << END
from django.utils import timezone
from datetime import timedelta
from api.models import Subscription, UserToken
from django.contrib.auth.models import User

# Create a test user
user, created = User.objects.get_or_create(username='testuser')
user.set_password('password123')
user.save()

# Create a test subscription for the user
subscription, created = Subscription.objects.get_or_create(user=user)
subscription.is_active = True
subscription.subscription_type = 'Basic'

# Set the last_token_allocation_date to 31 days ago
allocation_date = timezone.now() - timedelta(days=31)
subscription.last_token_allocation_date = allocation_date
subscription.save()

print(f"Set last_token_allocation_date to: {allocation_date}")
print(f"Current date: {timezone.now()}")
print(f"Days since last token allocation: {(timezone.now() - allocation_date).days}")

# Ensure there is a corresponding UserToken entry
user_token, created = UserToken.objects.get_or_create(user=user)
user_token.token_balance = 0
user_token.save()

print("Test data setup completed.")
END


# Perform validation: Check if token distribution succeeded
# You can use a Django management command or a database query to verify.
# Example validation command to count non-zero token balances:
TOKEN_COUNT=$(python manage.py shell << END
from django.db.models import Sum
from api.models import UserToken
print(UserToken.objects.aggregate(Sum('token_balance'))['token_balance__sum'] or 0)
END
)

# Check if TOKEN_COUNT is greater than 0, indicating tokens were allocated.
if [ "$TOKEN_COUNT" -gt 0 ]; then
    echo "Token distribution test completed successfully."
else
    echo "Token distribution test failed: No tokens allocated." >&2
    exit 1
fi