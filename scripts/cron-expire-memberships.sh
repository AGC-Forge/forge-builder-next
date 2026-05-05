#!/bin/bash

APP_URL="http://localhost:3000"
CRON_SECRET="${CRON_SECRET:-your-secret-key}"
LOG_FILE="/var/log/snapland/cron-memberships.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

mkdir -p "$(dirname "$LOG_FILE")"

echo "[$TIMESTAMP] Starting expire-memberships job..." >> "$LOG_FILE"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$APP_URL/api/cron/expire-memberships" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "[$TIMESTAMP] ✅ Success: $BODY" >> "$LOG_FILE"
else
    echo "[$TIMESTAMP] ❌ Failed (HTTP $HTTP_CODE): $BODY" >> "$LOG_FILE"
fi

echo "[$TIMESTAMP] Job completed" >> "$LOG_FILE"
echo "---" >> "$LOG_FILE"
