#!/bin/bash
# Update and install system dependencies
sudo apt-get update
sudo apt-get install -y python3-pip python3-dev libpq-dev nginx curl

# Navigate to your project directory
cd /home/ubuntu/reactDjango

# Install Python virtual environment and dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Install npm and build tools if not already installed
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
