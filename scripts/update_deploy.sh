#!/bin/bash
set -e

echo "🔻 Stopping services..."
sudo systemctl stop gunicorn
sudo systemctl stop nginx

echo "🚀 Starting SSH agent and adding key..."
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

cd /home/ubuntu/estimator
echo "📦 Pulling latest code from Git..."
git pull origin main

echo "📂 Ensuring template directory exists..."

TEMPLATES_DIR="/var/www/fairbuildapp/public"

echo "📂 Clearing old landing page files..."
sudo rm -rf $TEMPLATES_DIR/*

echo "🔑 Setting correct permissions for template directory..."
sudo chown -R ubuntu:www-data $TEMPLATES_DIR
sudo chmod -R 775 $TEMPLATES_DIR

echo "📦 Copying landing page templates from repo..."
cp -R /home/ubuntu/estimator/template/landingPage/* $TEMPLATES_DIR/

echo "✅ Templates updated successfully!"

echo "⚙️ Checking for Python dependency updates..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "🧹 Cleaning old Node.js dependencies..."
rm -rf frontend/node_modules frontend/package-lock.json
npm cache clean --force

cd frontend

echo "🧹 Cleaning old build files..."
sudo rm -rf build/

echo "⚙️ Checking for Node.js dependency updates..."
npm install --omit=dev
npm run build

echo "🚀 Moving built React files to /var/www/fairbuildapp/public/app..."
sudo rm -rf /var/www/fairbuildapp/public/app
sudo mv /home/ubuntu/estimator/frontend/build /var/www/fairbuildapp/public/app

cd ..

echo "🛠️ Setting proper permissions for public directory..."
sudo chown -R www-data:www-data /var/www/fairbuildapp/public/
sudo chmod -R 755 /var/www/fairbuildapp/public/

echo "🗑️ Deleting old static files..."
sudo rm -rf static/

echo "📁 Ensuring static directory exists..."
mkdir -p static/

echo "⚡ Running Django collectstatic..."
python manage.py collectstatic --noinput

echo "⚡ Running Django migrations..."
python manage.py migrate

echo "🧹 Clearing Nginx cache..."
sudo rm -rf /var/cache/nginx/*

echo "🚀 Restarting services..."
sudo systemctl restart gunicorn
sudo systemctl restart nginx

echo "✅ Update deployment complete!"
