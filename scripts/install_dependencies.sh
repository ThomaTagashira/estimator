#install_dependencies.sh

echo "Updating package list..."
sudo apt-get update


echo "Adding deadsnakes PPA for Python 3.12..."
if sudo add-apt-repository ppa:deadsnakes/ppa -y; then
    echo "PPA added successfully."
else
    echo "Failed to add deadsnakes PPA. Exiting." >&2
    exit 1
fi


echo "Updating package list after adding deadsnakes PPA..."
if sudo apt-get update; then
    echo "Package list updated successfully."
else
    echo "Failed to update package list. Exiting." >&2
    exit 1
fi


echo "Checking availability of Python 3.12..."
if apt-cache search python3.12; then
    echo "Python 3.12 is available in the package list."
else
    echo "Python 3.12 is not available. Exiting." >&2
    exit 1
fi


echo "Installing Python 3.12 and related packages..."
if sudo apt-get install -y python3.12 python3.12-venv python3.12-dev; then
    echo "Python 3.12 installed successfully."
else
    echo "Failed to install Python 3.12. Exiting." >&2
    exit 1
fi


echo "Installing Node.js..."
curl -sL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs


echo "Installing Nginx..."
sudo apt-get install -y nginx


echo "Installing Certbot and Certbot Nginx plugin..."
sudo apt-get install -y certbot python3-certbot-nginx


BASE_DIR="${BASE_DIR:-/home/ubuntu/djangoReact}"


cd "$BASE_DIR"


echo "Setting up Python virtual environment with Python 3.12.5..."
python3.12 -m venv venv
source venv/bin/activate


echo "Installing Python dependencies..."
pip install -r requirements.txt


echo "Installing Gunicorn..."
pip install gunicorn


echo "Creating logs directory..."
mkdir -p "$BASE_DIR/logs"


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


echo "Reloading systemd..."
sudo systemctl daemon-reload


echo "Enabling Gunicorn service to start on boot..."
sudo systemctl enable gunicorn


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


echo "Configuring Nginx..."
sudo cp "$BASE_DIR/config/nginx/myproject_nginx.conf" /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/myproject_nginx.conf /etc/nginx/sites-enabled/


echo "Testing Nginx configuration..."
if sudo nginx -t; then
    echo "Nginx configuration is valid."
else
    echo "Nginx configuration is invalid. Check the configuration and try again." >&2
    exit 1
fi


echo "Restarting Nginx..."
sudo systemctl restart nginx


echo "Obtaining SSL certificate for thomatagashira.com..."
if sudo certbot certonly --standalone -d thomatagashira.com -d www.thomatagashira.com --non-interactive --agree-tos --email thoma.tagashira@gmail.com; then
    echo "SSL certificate obtained successfully."
else
    echo "Failed to obtain SSL certificate. Check Certbot logs for more information." >&2
    exit 1
fi


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


s# Check if the Nginx config copy was successful
echo "Configuring Nginx..."
if sudo cp "$BASE_DIR/config/nginx/myproject_nginx.conf" /etc/nginx/sites-available/; then
    echo "Nginx configuration copied successfully."
else
    echo "Failed to copy Nginx configuration." >&2
    exit 1
fi

# Create a symbolic link to sites-enabled
sudo ln -sf /etc/nginx/sites-available/myproject_nginx.conf /etc/nginx/sites-enabled/

# Ensure Nginx is enabled
sudo systemctl enable nginx

echo "Stopping Nginx to free up port 80 for Certbot..."
sudo systemctl stop nginx

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

# Set up automatic SSL certificate renewal
echo "Setting up automatic SSL certificate renewal..."
sudo crontab -l | { cat; echo "0 0,12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -

echo "Dependency installation and configuration complete."