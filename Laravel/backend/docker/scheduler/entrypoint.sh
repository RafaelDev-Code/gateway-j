#!/bin/bash
# ============================================================
# Scheduler entrypoint - executa artisan schedule:run a cada minuto
# ============================================================

set -e

echo "Iniciando Laravel Scheduler..."

while true; do
    php /var/www/html/artisan schedule:run --no-interaction >> /dev/null 2>&1
    sleep 60
done
