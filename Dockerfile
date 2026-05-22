FROM php:8.4-apache

RUN apt-get update && apt-get install -y \
    git unzip curl \
    libpq-dev libzip-dev libicu-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo_pgsql pgsql mbstring zip intl bcmath opcache \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . /var/www

ENV COMPOSER_MEMORY_LIMIT=-1

RUN cd /var/www/backend \
    && composer install --no-dev --optimize-autoloader --no-interaction --no-scripts --prefer-dist \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwx storage bootstrap/cache

RUN sed -ri -e 's!/var/www/html!/var/www/backend/public!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf \
    && echo "ServerName localhost" >> /etc/apache2/apache2.conf \
    && echo "Listen 8080" > /etc/apache2/ports.conf \
    && sed -ri -e 's!<VirtualHost \*:80>!<VirtualHost *:8080>!g' /etc/apache2/sites-available/000-default.conf

COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

EXPOSE 8080

CMD ["start.sh"]