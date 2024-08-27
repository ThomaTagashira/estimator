#start_server.sh

cd "$BASE_DIR"
source venv/bin/activate

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
if sudo systemctl restart gunicorn; then
    echo "Gunicorn service restarted successfully."
else
    echo "Failed to restart Gunicorn service." >&2
    exit 1
fi
echo "Testing Nginx configuration..."
sudo nginx -t
# Restart Nginx to apply any configuration changes
if sudo systemctl restart nginx; then
    echo "Nginx restarted successfully."
else
    echo "Failed to restart Nginx." >&2
    exit 1
fi
# Check Nginx status
sudo systemctl status nginx.service

# View Nginx logs
sudo journalctl -xeu nginx.service