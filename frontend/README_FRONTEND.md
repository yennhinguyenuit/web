# Frontend

Thư mục này chứa giao diện của đồ án Laravel.

- `views/`: Blade templates.
- `views/layouts/frontend.blade.php`: layout khách hàng.
- `views/layouts/admin.blade.php`: layout quản trị.
- `views/customer/`: trang khách hàng.
- `views/admin/`: trang admin.
- `views/auth/`: đăng nhập, đăng ký.
- `assets/css/`: CSS source.
- `assets/js/`: JavaScript source dùng AJAX/fetch.
- `assets/images/`: hình ảnh giao diện.

Không dùng React, Vite hoặc npm. Laravel đọc view từ thư mục này qua `backend/config/view.php`.
