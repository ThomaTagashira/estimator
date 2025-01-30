set -e  

echo "🔻 Stopping services..."
sudo systemctl stop gunicorn
sudo systemctl stop nginx

echo "Starting SSH agent and adding key..."
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

cd /home/ubuntu/estimator
git pull origin main

# ✅ MOVE TEMPLATE DEPLOYMENT UP
S3_BUCKET="fairbuildapp-templates"
TEMPLATES_DIR="/var/www/fairbuildapp"
ZIP_FILE="Template.zip"

echo "📥 Downloading latest templates from S3..."
aws s3 cp s3://$S3_BUCKET/$ZIP_FILE /home/ubuntu/$ZIP_FILE

echo "📂 Ensuring template directory exists..."
sudo rm -rf /var/www/fairbuildapp
sudo mkdir -p $TEMPLATES_DIR
sudo chown -R ubuntu:ubuntu $TEMPLATES_DIR

echo "📦 Extracting templates..."
unzip -o /home/ubuntu/$ZIP_FILE -d /home/ubuntu/tmp_templates
sudo mv /home/ubuntu/tmp_templates/Template/* $TEMPLATES_DIR/
rm -rf /home/ubuntu/tmp_templates

# Clean up
rm /home/ubuntu/$ZIP_FILE

echo "✅ Templates updated successfully!"

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

echo "Deletiong old estimator/static directory..."
sudo rm -rf static/

echo "📁 Ensuring static directory exists..."
mkdir -p static/

echo "⚡ Running Django collectstatic..."
python manage.py collectstatic --noinput


echo "⚡ Running Django migrations..."
python manage.py migrate

echo "🚀 Restarting services..."
sudo systemctl restart gunicorn
sudo systemctl restart nginx

echo "✅ Update deployment complete!"
