#!/usr/bin/env bash
# Confirm GET /api/health is warehouse-backed, not fixtures.
# Usage: HEALTH_SITE_URL=https://… ./scripts/health/verify-source.sh
set -euo pipefail

SITE="${HEALTH_SITE_URL:?set HEALTH_SITE_URL to the deployed origin}"
URL="${SITE%/}/api/health"
BODY="$(mktemp)"
trap 'rm -f "$BODY"' EXIT

HEADERS="$(curl -sS -D - -o "$BODY" "$URL")"
HEADER_SOURCE="$(printf '%s\n' "$HEADERS" | awk 'tolower($1)=="x-health-source:" {print $2}' | tr -d '\r' | tail -n1)"
JSON_SOURCE="$(python3 -c "import json; print(json.load(open('$BODY')).get('source',''))")"

echo "X-Health-Source: ${HEADER_SOURCE:-missing}"
echo "json.source: ${JSON_SOURCE:-missing}"

if [[ "$JSON_SOURCE" != "supabase" ]]; then
  echo "expected source=supabase (warehouse live). still on fixtures or the body is unexpected." >&2
  exit 1
fi
if [[ -n "$HEADER_SOURCE" && "$HEADER_SOURCE" != "supabase" ]]; then
  echo "header X-Health-Source=$HEADER_SOURCE does not match json.source=supabase" >&2
  exit 1
fi
