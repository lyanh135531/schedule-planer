#!/bin/sh

# Load .env.local if present
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Use CRON_SECRET from environment or prompt
SECRET=${CRON_SECRET:-"your_secret_key"}
URL="http://localhost:3000/api/cron/register"

echo "Triggering automated registration at $URL..."
curl -X POST "$URL" \
  -H "Authorization: Bearer $SECRET" \
  -H "Content-Type: application/json" \
  -d '{}'

echo "\nDone."
