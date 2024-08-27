#!/bin/bash
# Activate the virtual environment
cd /home/ubuntu/reactDjango
source venv/bin/activate

# Apply Django migrations
python manage.py migrate

# Collect static files for Django
python manage.py collectstatic --noinput

# Restart Gunicorn and Nginx services
sudo systemctl restart gunicorn
sudo systemctl restart nginx
