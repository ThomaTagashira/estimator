# validate_service.sh

# Check the environment variable to determine which URL to validate
if [ "$ENVIRONMENT" == "Dev" ]; then
    URL="http://localhost"
else
    URL="https://thomatagashira.com"
fi

echo "Validating service at $URL..."

# Perform the validation
if curl -f $URL; then
    echo "Service is running successfully."
else
    echo "Service validation failed at $URL." >&2
    exit 1
fi
