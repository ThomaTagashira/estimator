#validate_service.sh

if curl -f http://localhost; then
    echo "Service is running successfully."
else
    echo "Service validation failed." >&2
    exit 1
fi
