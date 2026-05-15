#!/bin/sh
set -e

if [ "${RUN_INGEST_ON_START:-true}" = "true" ]; then
  echo "Running initial RSS ingest..."
  node src/scripts/ingestOnce.js || echo "Ingest skipped or failed (API will still start)."
fi

exec "$@"
