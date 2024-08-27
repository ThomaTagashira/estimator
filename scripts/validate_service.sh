if curl -f https://thomatagashira.com; then
    echo "Service is running successfully."
else
    echo "Service validation failed." >&2
    exit 1
fi
