#start_server.sh

cd "$BASE_DIR"
source venv/bin/activate

# Apply database migrations
echo "Applying database migrations..."
if python manage.py migrate; then
    echo "Database migrations applied successfully."
else
    echo "Failed to apply database migrations." >&2
    exit 1
fi

# Collect static files
echo "Collecting static files..."
if python manage.py collectstatic --noinput; then
    echo "Static files collected successfully."
else
    echo "Failed to collect static files." >&2
    exit 1
fi

# Start Gunicorn service
echo "Restarting Gunicorn service..."
if sudo systemctl restart gunicorn; then
    echo "Gunicorn service restarted successfully."
else
    echo "Failed to restart Gunicorn service." >&2
    exit 1
fi

# Test Nginx configuration
echo "Testing Nginx configuration..."
if sudo nginx -t; then
    echo "Nginx configuration test passed."
else
    echo "Nginx configuration test failed." >&2
    exit 1
fi

# Restart Nginx to apply any configuration changes
echo "Restarting Nginx service..."
if sudo systemctl restart nginx; then
    echo "Nginx restarted successfully."
else
    echo "Failed to restart Nginx." >&2
    exit 1
fi