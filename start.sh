#!/bin/bash
set -e

# Start Python backend in background
echo "Starting Python backend on port 8000..."
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Give backend a moment to start
sleep 5

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "ERROR: Python backend failed to start!"
    exit 1
fi

echo "Python backend started successfully (PID: $BACKEND_PID)"
echo "Starting Caddy web server..."

# Start Caddy (this runs in foreground)
exec caddy run --config Caddyfile --adapter caddyfile
