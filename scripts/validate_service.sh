# validate_service.sh

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$ENVIRONMENT" == "Dev" ] || [ "$CURRENT_BRANCH" == "Tokens" ]; then
    URL="http://localhost"
else
    URL="https://fairbuildapp.com"
fi

echo "Validating service at $URL..."

# Perform the validation
if curl -f $URL; then
    echo "Service is running successfully."
else
    echo "Service validation failed at $URL." >&2
    exit 1
fi
