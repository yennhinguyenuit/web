# Backend Laravel

Thu muc nay chua ung dung Laravel chinh cua Luxe Store. Blade views duoc cau hinh doc them tu:

```php
dirname(base_path()).'/frontend/views'
```

## Chay local

```bash
php composer.phar install
copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Khong dung `migrate:fresh` voi database da co du lieu.

## Cau hinh database

```env
DB_CONNECTION=pgsql
DB_HOST=
DB_PORT=5432
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
```

## Cau hinh email

Project gui mail qua Laravel Mail va Resend API:

```env
MAIL_MAILER=resend
RESEND_API_KEY=
MAIL_FROM_ADDRESS=noreply@luxe.id.vn
MAIL_FROM_NAME=Luxe
QUEUE_CONNECTION=sync
```

## Lenh kiem tra

```bash
php artisan route:list
php artisan test
```
