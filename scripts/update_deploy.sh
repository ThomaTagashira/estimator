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

echo "⚙️ Checking for Python dependency updates..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "🧹 Cleaning old Node.js dependencies..."
rm -rf frontend/node_modules frontend/package-lock.json
npm cache clean --force

echo "⚙️ Checking for Node.js dependency updates..."
cd frontend
npm install --omit=dev
npm run build
cd ..

echo "📁 Ensuring static directory exists..."
mkdir -p static/

echo "⚡ Running Django collectstatic..."
python manage.py collectstatic --noinput

echo "📦 Copying frontend static files..."
cp -r frontend/build/static/* static/

echo "⚡ Running Django migrations..."
python manage.py migrate

# ✅ S3 BUCKET INTEGRATION: DOWNLOAD & EXTRACT TEMPLATES
S3_BUCKET="fairbuildapp-templates"
TEMPLATES_DIR="/var/www/templates"
ZIP_FILE="templates.zip"

echo "📥 Downloading latest templates from S3..."
aws s3 cp s3://$S3_BUCKET/$ZIP_FILE /home/ubuntu/$ZIP_FILE

echo "📂 Ensuring template directory exists..."
mkdir -p $TEMPLATES_DIR

echo "📦 Extracting templates..."
unzip -o /home/ubuntu/$ZIP_FILE -d $TEMPLATES_DIR

# Clean up
rm /home/ubuntu/$ZIP_FILE

echo "✅ Templates updated successfully!"

echo "🚀 Restarting services..."
sudo systemctl restart gunicorn
sudo systemctl restart nginx

echo "✅ Update deployment complete!"
