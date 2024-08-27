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

# Check and Stop Nginx if running
if sudo systemctl is-active --quiet nginx; then
    echo "Stopping Nginx to free up port 80 for Certbot..."
    sudo systemctl stop nginx
fi

# Ensure port 80 is free
if sudo lsof -i :80 | grep LISTEN; then
    echo "Port 80 is still in use. Exiting..." >&2
    exit 1
fi

# Obtain SSL certificate
echo "Obtaining SSL certificate..."
if sudo certbot certonly --standalone -d thomatagashira.com -d www.thomatagashira.com --non-interactive --agree-tos --email thoma.tagashira@gmail.com; then
    echo "SSL certificate obtained successfully."
else
    echo "Failed to obtain SSL certificate. Check Certbot logs for more information." >&2
    exit 1
fi

# Start Nginx again after obtaining SSL certificate
echo "Starting Nginx..."
if sudo systemctl start nginx; then
    echo "Nginx started successfully."
else
    echo "Failed to start Nginx." >&2
    exit 1
fi

# Validate Nginx configuration
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
