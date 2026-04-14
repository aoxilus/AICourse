#!/bin/bash

echo "🐍 Python Learning Platform Startup"
echo "===================================="

# Check Python installation
echo "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found! Please install Python 3.x"
    echo "Ubuntu/Debian: sudo apt install python3"
    echo "macOS: brew install python3"
    exit 1
fi

echo "✅ Python 3 found!"

# Check Node.js installation
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found! Please install Node.js"
    echo "Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found!"

# Install dependencies
echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed!"

# Create temp directory
mkdir -p temp

echo "🚀 Starting Python Learning Platform..."
echo "Open your browser to: http://localhost:3000"
echo "Press Ctrl+C to stop the server"

npm start
