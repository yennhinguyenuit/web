# Backend Laravel

Đây là phần Laravel/PHP MVC chính của project.

## Chạy project

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

## Routes

- `routes/web.php`: route khách hàng và auth.
- `routes/admin.php`: route quản trị.
- `routes/api.php`: để sẵn cho API/AJAX nội bộ nếu cần.

## Database

Sử dụng PostgreSQL/Supabase với Eloquent ORM. Cấu hình trong `.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=ten_database
DB_USERNAME=ten_user
DB_PASSWORD=mat_khau
```

## Frontend views

Laravel được cấu hình đọc Blade views từ:

```php
dirname(base_path()).'/frontend/views'
```
