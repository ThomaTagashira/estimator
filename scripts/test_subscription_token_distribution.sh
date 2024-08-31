# test_subscription_token_distribution.sh

# Exit immediately if a command exits with a non-zero status.
set -e

# Print commands and their arguments as they are executed.
set -x

# Run Django migrations (if needed)
python manage.py migrate

# Load environment variables (if using .env)
export $(cat .env | xargs)

# Run the allocate_monthly_tokens function
python manage.py shell << END
from api.tasks import allocate_monthly_tokens
allocate_monthly_tokens()
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