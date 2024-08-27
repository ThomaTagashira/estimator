#build_frontend.sh

BASE_DIR="${BASE_DIR:-/home/ubuntu/djangoReact}"

cd "$BASE_DIR/frontend"

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
