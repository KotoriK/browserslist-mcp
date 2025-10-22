#!/bin/bash
# Demo script for testing the Cloudflare Worker locally

echo "🚀 Cloudflare Worker Demo"
echo "========================="
echo ""
echo "Starting worker dev server..."
echo ""

# Start the worker in the background
pnpm worker:dev &
WORKER_PID=$!

# Wait for the worker to start
echo "Waiting for worker to be ready..."
sleep 8

echo ""
echo "🧪 Testing Endpoints"
echo "===================="
echo ""

echo "1️⃣  Root Endpoint (/):"
curl -s http://localhost:8787/ | jq '{name, version, description}' 2>/dev/null || echo "❌ Failed"
echo ""

echo "2️⃣  Health Check (/health):"
curl -s http://localhost:8787/health | jq '{status, service, timestamp}' 2>/dev/null || echo "❌ Failed"
echo ""

echo "3️⃣  Query Browsers - 'last 2 versions':"
curl -s -X POST http://localhost:8787/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "last 2 versions"}' | jq '{count, query, browsers: .browsers[:5]}' 2>/dev/null || echo "❌ Failed"
echo ""

echo "4️⃣  Get Defaults:"
curl -s http://localhost:8787/api/defaults | jq '{defaults}' 2>/dev/null || echo "❌ Failed"
echo ""

echo "5️⃣  Get Coverage:"
curl -s -X POST http://localhost:8787/api/coverage \
  -H "Content-Type: application/json" \
  -d '{"browsers": ["chrome 90", "firefox 88"]}' | jq '{coverage}' 2>/dev/null || echo "❌ Failed"
echo ""

echo "6️⃣  Get Examples:"
curl -s http://localhost:8787/api/examples | jq '.[0]' 2>/dev/null || echo "❌ Failed"
echo ""

# Stop the worker
echo ""
echo "Stopping worker..."
kill $WORKER_PID 2>/dev/null

echo ""
echo "✅ Demo complete!"
echo ""
echo "To start the worker manually:"
echo "  $ pnpm worker:dev"
echo ""
echo "To deploy to production:"
echo "  $ npx wrangler login"
echo "  $ pnpm worker:deploy"
