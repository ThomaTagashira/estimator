#install_dependencies.sh

# Update package list and install dependencies
echo "Updating package list and installing dependencies..."
sudo apt-get update
sudo apt-get install -y python3-pip python3-dev libpq-dev nginx curl

# Install Node.js
echo "Installing Node.js..."
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs

# Navigate to project directory
cd /home/ubuntu/reactDjango

# Set up Python virtual environment
echo "Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Install Gunicorn
echo "Installing Gunicorn..."
pip install gunicorn

# Create logs directory
echo "Creating logs directory..."
mkdir -p /home/ubuntu/djangoReact/logs

# Create Gunicorn configuration file
echo "Creating Gunicorn configuration file..."
cat > /home/ubuntu/djangoReact/gunicorn_config.py <<EOF
# Gunicorn configuration file

bind = "unix:/home/ubuntu/djangoReact/gunicorn.sock"
workers = 3
worker_class = "sync"
accesslog = "/home/ubuntu/djangoReact/logs/gunicorn-access.log"
errorlog = "/home/ubuntu/djangoReact/logs/gunicorn-error.log"
loglevel = "info"
timeout = 120
pidfile = "/home/ubuntu/djangoReact/gunicorn.pid"
EOF

# Create Gunicorn systemd service file
echo "Creating Gunicorn systemd service file..."
sudo tee /etc/systemd/system/gunicorn.service > /dev/null <<EOF
[Unit]
Description=gunicorn daemon
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/djangoReact
ExecStart=/home/ubuntu/djangoReact/venv/bin/gunicorn --config /home/ubuntu/djangoReact/gunicorn_config.py EndPoint.wsgi:application

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd to recognize the Gunicorn service
echo "Reloading systemd..."
sudo systemctl daemon-reload

# Enable Gunicorn service to start on boot
echo "Enabling Gunicorn service to start on boot..."
sudo systemctl enable gunicorn

# Create Nginx configuration file
echo "Creating Nginx configuration file..."
cat > /home/ubuntu/djangoReact/config/nginx/myproject_nginx.conf <<EOF
server {
    listen 80;
    server_name thomatagashira.com;

    return 301 https://\$host\$request_uri;
}

server {
    listen 443 ssl;
    server_name thomatagashira.com;

    ssl_certificate /etc/letsencrypt/live/api.thomatagashira.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.thomatagashira.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://unix:/home/ubuntu/djangoReact/gunicorn.sock;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /static/ {
        alias /home/ubuntu/reactDjango/staticfiles/;
    }

    location /media/ {
        alias /home/ubuntu/reactDjango/media/;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Content-Security-Policy "default-src 'self';";
}
EOF

# Check if the Nginx config copy was successful
echo "Configuring Nginx..."
if sudo cp /home/ubuntu/djangoReact/config/nginx/myproject_nginx.conf /etc/nginx/sites-available/; then
    echo "Nginx configuration copied successfully."
else
    echo "Failed to copy Nginx configuration." >&2
    exit 1
fi

# Create a symbolic link to sites-enabled
sudo ln -sf /etc/nginx/sites-available/myproject_nginx.conf /etc/nginx/sites-enabled/

# Ensure Nginx is enabled
sudo systemctl enable nginx

echo "Dependency installation and configuration complete."
