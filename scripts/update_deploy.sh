#!/bin/bash

set -e  

echo "🔻 Stopping services..."
sudo systemctl stop gunicorn
sudo systemctl stop nginx

echo "📥 Pulling latest changes from GitHub..."
cd /home/ubuntu/estimator
git pull origin main

echo "⚙️ Checking for Python dependency updates..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "⚙️ Checking for Node.js dependency updates..."
cd frontend
npm install --production
npm run build
cd ..

echo "📦 Copying frontend static files..."
cp -r frontend/build/static/* static/

echo "⚡ Running Django migrations..."
python manage.py migrate

echo "🚀 Restarting services..."
sudo systemctl restart gunicorn
sudo systemctl restart nginx

echo "✅ Update deployment complete!"
