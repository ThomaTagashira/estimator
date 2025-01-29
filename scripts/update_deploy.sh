set -e  

echo "🔻 Stopping services..."
sudo systemctl stop gunicorn
sudo systemctl stop nginx

echo "Starting SSH agent and adding key..."
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

echo "📥 Pulling latest changes from GitHub..."
cd /home/ubuntu/estimator
git pull origin main

# ✅ Install Python dependencies
echo "⚙️ Checking for Python dependency updates..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# ✅ Clean & reinstall Node.js dependencies
echo "🧹 Cleaning old Node.js dependencies..."
rm -rf frontend/node_modules frontend/package-lock.json
npm cache clean --force

echo "⚙️ Checking for Node.js dependency updates..."
cd frontend
npm install --omit=dev
npm run build
cd ..

# ✅ Ensure the static directory exists before collecting files
echo "📁 Ensuring static directory exists..."
mkdir -p static/

# ✅ Run Django collectstatic FIRST
echo "⚡ Running Django collectstatic..."
python manage.py collectstatic --noinput

# ✅ Copy React static files AFTER collectstatic
echo "📦 Copying frontend static files..."
cp -r frontend/build/static/* static/

# ✅ Run Django migrations
echo "⚡ Running Django migrations..."
python manage.py migrate

echo "🚀 Restarting services..."
sudo systemctl restart gunicorn
sudo systemctl restart nginx

echo "✅ Update deployment complete!"
