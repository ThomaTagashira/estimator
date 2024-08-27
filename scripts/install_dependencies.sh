#!/bin/bash

# Update package list
echo "Updating package list..."
sudo apt-get update

# Install Python 3.12 and related packages
echo "Installing Python 3.12 and related packages..."
sudo apt-get install -y python3.12 python3.12-venv python3.12-dev

# Install Node.js
echo "Installing Node.js..."
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
echo "Installing Nginx..."
sudo apt-get install -y nginx

# Install Certbot and Certbot Nginx plugin
echo "Installing Certbot and Certbot Nginx plugin..."
sudo apt-get install -y certbot python3-certbot-nginx

# Define the base directory (default to /home/ubuntu/djangoReact if not set)
BASE_DIR="${BASE_DIR:-/home/ubuntu/djangoReact}"

# Navigate to project directory
cd "$BASE_DIR"

# Set up Python virtual environment using Python 3.12.5
echo "Setting up Python virtual environment with Python 3.12.5..."
python3.12 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Install Gunicorn
echo "Installing Gunicorn..."
pip install gunicorn

# Create logs directory
echo "Creating logs directory..."
mkdir -p "$BASE_DIR/logs"

# Create Gunicorn configuration file
echo "Creating Gunicorn configuration file..."
cat > "$BASE_DIR/gunicorn_config.py" <<EOF
# Gunicorn configuration file

bind = "unix:$BASE_DIR/gunicorn.sock"
workers = 3
worker_class = "sync"
accesslog = "$BASE_DIR/logs/gunicorn-access.log"
errorlog = "$BASE_DIR/logs/gunicorn-error.log"
loglevel = "info"
timeout = 120
pidfile = "$BASE_DIR/gunicorn.pid"
EOF

# Create Gunicorn systemd service file
echo "Creating Gunicorn systemd service file..."
sudo tee /etc/systemd/system/gunicorn.service > /dev/null <<EOF
[Unit]
Description=gunicorn daemon
After=network.target

[Service]
User=${USER}
Group=www-data
WorkingDirectory=$BASE_DIR
ExecStart=$BASE_DIR/venv/bin/gunicorn --config $BASE_DIR/gunicorn_config.py EndPoint.wsgi:application

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd to recognize the Gunicorn service
echo "Reloading systemd..."
sudo systemctl daemon-reload

# Enable Gunicorn service to start on boot
echo "Enabling Gunicorn service to start on boot..."
sudo systemctl enable gunicorn

# Create initial Nginx configuration file (without SSL)
echo "Creating initial Nginx configuration file..."
mkdir -p "$BASE_DIR/config/nginx"
cat > "$BASE_DIR/config/nginx/myproject_nginx.conf" <<EOF
server {
    listen 80;
    server_name thomatagashira.com www.thomatagashira.com;

    location / {
        proxy_pass http://unix:$BASE_DIR/gunicorn.sock;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /static/ {
        alias $BASE_DIR/staticfiles/;
    }

    location /media/ {
        alias $BASE_DIR/media/;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Content-Security-Policy "default-src 'self';";
}
EOF

# Copy Nginx config and enable site
echo "Configuring Nginx..."
sudo cp "$BASE_DIR/config/nginx/myproject_nginx.conf" /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/myproject_nginx.conf /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "Testing Nginx configuration..."
if sudo nginx -t; then
    echo "Nginx configuration is valid."
else
    echo "Nginx configuration is invalid. Check the configuration and try again." >&2
    exit 1
fi

# Restart Nginx
echo "Restarting Nginx..."
sudo systemctl restart nginx

# Obtain SSL certificates using Certbot in standalone mode
echo "Obtaining SSL certificate for thomatagashira.com..."
if sudo certbot certonly --standalone -d thomatagashira.com -d www.thomatagashira.com --non-interactive --agree-tos --email your-email@example.com; then
    echo "SSL certificate obtained successfully."
else
    echo "Failed to obtain SSL certificate. Check Certbot logs for more information." >&2
    exit 1
fi

# Enable SSL in Nginx configuration after obtaining certificates
echo "Enabling SSL in Nginx configuration..."
cat > "$BASE_DIR/config/nginx/myproject_nginx.conf" <<EOF
server {
    listen 80;
    server_name thomatagashira.com www.thomatagashira.com;

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name thomatagashira.com www.thomatagashira.com;

    ssl_certificate /etc/letsencrypt/live/thomatagashira.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thomatagashira.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://unix:$BASE_DIR/gunicorn.sock;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /static/ {
        alias $BASE_DIR/staticfiles/;
    }

    location /media/ {
        alias $BASE_DIR/media/;
    }

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Content-Security-Policy "default-src 'self';";
}
EOF

# Copy updated Nginx config
sudo cp "$BASE_DIR/config/nginx/myproject_nginx.conf" /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/myproject_nginx.conf /etc/nginx/sites-enabled/

# Test Nginx configuration again
echo "Testing Nginx configuration after enabling SSL..."
if sudo nginx -t; then
    echo "Nginx configuration with SSL is valid."
else
    echo "Nginx configuration with SSL is invalid. Check the configuration and try again." >&2
    exit 1
fi

# Restart Nginx to apply SSL changes
echo "Restarting Nginx with SSL..."
sudo systemctl restart nginx

# Set up automatic renewal of SSL certificates
echo "Setting up automatic SSL certificate renewal..."
sudo crontab -l | { cat; echo "0 0,12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -

echo "Dependency installation and configuration complete."
