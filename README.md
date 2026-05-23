# Luxe Store

Luxe Store la website thuong mai dien tu thoi trang duoc xay dung bang Laravel, Blade va PostgreSQL. Project tach ro phan backend Laravel va Blade views, phu hop chay local va deploy tren Render voi Supabase PostgreSQL.

## Cong nghe

- PHP 8.3+
- Laravel 13
- Blade template
- PostgreSQL / Supabase
- Bootstrap 5
- Resend API cho email
- Docker + Apache tren Render

## Cau truc thu muc

```text
web-git/
|-- backend/                  # Laravel application
|   |-- app/                  # Controllers, Models, Services
|   |-- config/               # Cau hinh app, database, mail, services
|   |-- database/             # Migrations, factories, seeders
|   |-- public/assets/        # CSS, JS, image public
|   `-- routes/               # Web, admin, api routes
|-- frontend/
|   |-- views/                # Blade views
|   `-- assets/               # Source copy cua public assets
|-- Dockerfile                # Build image deploy Render
`-- start.sh                  # Start script cho Render
```

## Chuc nang chinh

- Dang ky, dang nhap, dang xuat.
- Xem san pham, loc theo danh muc, tim kiem, loc gia.
- Gio hang, checkout, ma giam gia, phi van chuyen.
- Dat hang COD hoac PayOS.
- Theo doi trang thai don hang.
- Huy don va yeu cau shop duyet huy.
- Danh gia san pham sau khi don hang hoan thanh.
- Trang quan tri san pham, danh muc, khach hang, don hang, coupon, flash sale, feedback, bao cao.
- Chat giua khach hang va shop.
- Chatbot ho tro mua hang.
- Gui email xac nhan don hang va cap nhat trang thai qua Laravel Mail voi Resend.

## Chay local

Yeu cau may da co PHP, PostgreSQL va Composer hoac `composer.phar`.

```bash
cd backend
php composer.phar install
copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Neu dung Composer global:

```bash
composer install
```

Khong chay `migrate:fresh` tren database dang co du lieu.

## Bien moi truong quan trong

```env
APP_NAME=Luxe
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=pgsql
DB_HOST=
DB_PORT=5432
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

MAIL_MAILER=resend
RESEND_API_KEY=
MAIL_FROM_ADDRESS=noreply@luxe.id.vn
MAIL_FROM_NAME=Luxe

QUEUE_CONNECTION=sync
```

## Deploy Render

Project da co `Dockerfile` va `start.sh`. Render build tu root repository va public document root tro ve:

```text
backend/public
```

Env production can set tren Render:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://www.luxe.id.vn

DB_CONNECTION=pgsql
DB_HOST=
DB_PORT=5432
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=

MAIL_MAILER=resend
RESEND_API_KEY=
MAIL_FROM_ADDRESS=noreply@luxe.id.vn
MAIL_FROM_NAME=Luxe

QUEUE_CONNECTION=sync
SESSION_SECURE_COOKIE=true
```

`start.sh` se chay:

```bash
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

## Email voi Resend

Project dung Laravel Mail binh thuong. Mailer production la Resend:

```env
MAIL_MAILER=resend
RESEND_API_KEY=<resend_api_key>
MAIL_FROM_ADDRESS=noreply@luxe.id.vn
MAIL_FROM_NAME=Luxe
```

Test gui mail:

```bash
php artisan tinker --execute="Illuminate\Support\Facades\Mail::raw('Test mail from Luxe', function ($m) { $m->to('email@example.com')->subject('Luxe mail test'); });"
```

## Route chinh

- `/login`
- `/products`
- `/cart`
- `/checkout`
- `/orders`
- `/contact`
- `/admin`
- `/admin/orders`
- `/admin/chats`

## Kiem tra

```bash
cd backend
php artisan route:list
php artisan test
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```

## Luu y khi nop bai

- Khong commit `.env`.
- Khong commit `vendor/`.
- Khong commit `composer.phar`.
- Khong reset database production.
- Khong chay `php artisan migrate:fresh` tren Supabase.
