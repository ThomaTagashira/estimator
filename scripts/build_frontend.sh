#!/bin/bash
# Navigate to the frontend directory
cd /home/ubuntu/reactDjango/frontend

# Install npm dependencies and build the frontend
npm install
npm run build

# Move built files to Django static directory
cp -R build/* /home/ubuntu/reactDjango/static/
