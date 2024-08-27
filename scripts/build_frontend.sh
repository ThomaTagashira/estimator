#build_frontend.sh

cd /home/ubuntu/reactDjango/frontend

if npm install; then
    echo "NPM dependencies installed successfully."
else
    echo "Failed to install NPM dependencies." >&2
    exit 1
fi

if npm run build; then
    echo "Frontend built successfully."
else
    echo "Failed to build the frontend." >&2
    exit 1
fi