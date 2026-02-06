#!/bin/bash
set -e

# Start Node.js backend in background
echo "Starting Node.js backend on port 8000..."
node server/index.js &
BACKEND_PID=$!

# Give backend a moment to start
sleep 2

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "ERROR: Node.js backend failed to start!"
    exit 1
fi

echo "Node.js backend started successfully (PID: $BACKEND_PID)"
echo "Starting Caddy web server..."

# Start Caddy (this runs in foreground)
exec caddy run --config Caddyfile --adapter caddyfile
