#!/usr/bin/env bash
set -e

cd /var/www/backend

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R ug+rwx storage bootstrap/cache

php artisan package:discover --ansi || true

php artisan config:clear || true
php artisan cache:clear || true
php artisan route:clear || true
php artisan view:clear || true

php artisan migrate --force

if [ "${RUN_SEEDER:-false}" = "true" ]; then
  php artisan db:seed --force || true
fi

php artisan config:cache || true
php artisan route:cache || true

exec apache2-foreground