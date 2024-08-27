#start_server.sh

# Apply database migrations
if python manage.py migrate; then
    echo "Database migrations applied successfully."
else
    echo "Failed to apply database migrations." >&2
    exit 1
fi

# Collect static files
if python manage.py collectstatic --noinput; then
    echo "Static files collected successfully."
else
    echo "Failed to collect static files." >&2
    exit 1
fi

# Start Gunicorn service
if sudo systemctl start gunicorn; then
    echo "Gunicorn service started successfully."
else
    echo "Failed to start Gunicorn service." >&2
    exit 1
fi

# Restart Nginx to apply any configuration changes
if sudo systemctl restart nginx; then
    echo "Nginx restarted successfully."
else
    echo "Failed to restart Nginx." >&2
    exit 1
fi