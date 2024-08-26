#!/bin/bash
# Check if the Django server is running
curl -f http://localhost/ || exit 1
