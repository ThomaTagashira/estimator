#stop_services.sh

# Stop Gunicorn
if pkill gunicorn; then
    echo "Gunicorn stopped successfully."
else
    echo "Failed to stop Gunicorn or it wasn't running."
fi

# Stop Nginx
if sudo systemctl stop nginx; then
    echo "Nginx stopped successfully."
else
    echo "Failed to stop Nginx."
fi