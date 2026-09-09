#!/usr/bin/env bash
# POST a HealthIngestPayload to /api/health/ingest.
# Usage:
#   HEALTH_SITE_URL=https://… HEALTH_INGEST_SECRET=… ./scripts/health/post-ingest.sh [payload.json]
set -euo pipefail

SITE="${HEALTH_SITE_URL:?set HEALTH_SITE_URL to the deployed origin}"
SECRET="${HEALTH_INGEST_SECRET:?set HEALTH_INGEST_SECRET (same as Vercel)}"
FILE="${1:-$(cd "$(dirname "$0")" && pwd)/example-coros-ingest.json}"

if [[ ! -f "$FILE" ]]; then
  echo "payload not found: $FILE" >&2
  exit 1
fi

curl -sS -X POST "${SITE%/}/api/health/ingest" \
  -H "Authorization: Bearer ${SECRET}" \
  -H "Content-Type: application/json" \
  --data-binary @"$FILE"
echo
