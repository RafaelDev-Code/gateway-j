FROM php:8.3-cli-alpine AS base

# Instala dependencias do sistema
RUN apk add --no-cache \
    linux-headers \
    $PHPIZE_DEPS \
    libpq-dev \
    libzip-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    icu-dev \
    oniguruma-dev \
    curl \
    bash \
    shadow

# Instala extensoes PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo \
        pdo_pgsql \
        pgsql \
        zip \
        gd \
        intl \
        mbstring \
        pcntl \
        bcmath \
        opcache

# Instala Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Instala Swoole para Octane
RUN pecl install swoole && docker-php-ext-enable swoole

# Limpa cache de build
RUN apk del $PHPIZE_DEPS && rm -rf /tmp/pear

# Copia configuracoes PHP customizadas
COPY docker/php/php.ini /usr/local/etc/php/conf.d/99-gateway.ini

# Instala Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Configura usuario sem root para seguranca
RUN addgroup -g 1000 gateway && adduser -u 1000 -G gateway -s /bin/bash -D gateway

WORKDIR /var/www/html

# ============================================================
# Stage de producao
# ============================================================
FROM base AS production

COPY --chown=gateway:gateway . .

RUN composer install \
    --no-dev \
    --no-interaction \
    --optimize-autoloader \
    --classmap-authoritative \
    --no-scripts

RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache \
    && php artisan event:cache

USER gateway
