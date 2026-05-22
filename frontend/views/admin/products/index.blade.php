@extends('layouts.admin')

@section('title', 'Quản lý sản phẩm')

@section('content')
<div class="admin-stat-grid">
    <div class="admin-stat"><p class="admin-stat-label">Tổng sản phẩm</p><p class="admin-stat-value">{{ number_format($totalProducts) }}</p></div>
    <div class="admin-stat"><p class="admin-stat-label">Đang hiển thị</p><p class="admin-stat-value">{{ number_format($activeProducts) }}</p></div>
    <div class="admin-stat"><p class="admin-stat-label">Đang ẩn</p><p class="admin-stat-value text-muted">{{ number_format($hiddenProducts) }}</p></div>
    <div class="admin-stat"><p class="admin-stat-label">Tồn kho thấp</p><p class="admin-stat-value text-danger">{{ number_format($lowStockProducts) }}</p></div>
</div>

<div class="admin-card admin-category-filter">
    <div class="admin-category-filter-head">
        <div>
            <h2>Phân loại theo danh mục</h2>
            <p>{{ $selectedCategory ? 'Đang xem: '.$selectedCategory->name : 'Đang xem tất cả sản phẩm' }}</p>
        </div>
        @if($selectedCategoryId)
            <a class="btn btn-outline-dark" href="{{ route('admin.products.index') }}">Xem tất cả</a>
        @endif
    </div>
    <div class="admin-category-tabs">
        <a class="{{ ! $selectedCategoryId ? 'active' : '' }}" href="{{ route('admin.products.index') }}">
            <span>Tất cả</span>
            <strong>{{ number_format($totalProducts) }}</strong>
        </a>
        @foreach($categories as $category)
            <a class="{{ (int) $selectedCategoryId === $category->id ? 'active' : '' }}" href="{{ route('admin.products.index', ['category_id' => $category->id]) }}">
                <span>{{ $category->name }}</span>
                <strong>{{ number_format($category->products_count) }}</strong>
            </a>
        @endforeach
    </div>
</div>

<div class="admin-toolbar mb-4">
    <div class="admin-toolbar-row">
        <div>
            <h2 class="h5 fw-bold mb-1">Thêm/sửa nhanh</h2>
            <p class="text-muted mb-0">Lưu sản phẩm không reload trang.</p>
        </div>
        <div class="d-flex gap-2">
            <a href="{{ route('admin.products.create') }}" class="btn btn-outline-dark">Form đầy đủ</a>
            <button type="button" id="product-reset" class="btn btn-outline-secondary">Làm mới</button>
        </div>
    </div>
    <div id="product-alert"></div>
    <form id="product-form" class="row g-3" enctype="multipart/form-data">
        @csrf
        <input type="hidden" id="product-id">
        <div class="col-md-4"><input class="form-control" name="name" placeholder="Tên sản phẩm" required></div>
        <div class="col-md-2"><input class="form-control" name="sku" placeholder="SKU"></div>
        <div class="col-md-3">
            <select class="form-select" name="category_id" required>
                @foreach($categories as $category)
                    <option value="{{ $category->id }}" @selected((int) $selectedCategoryId === $category->id)>{{ $category->name }}</option>
                @endforeach
            </select>
        </div>
        <div class="col-md-2"><input class="form-control" type="number" name="price" placeholder="Giá" required></div>
        <div class="col-md-1"><input class="form-control" type="number" name="stock" placeholder="Tồn" required></div>
        <div class="col-md-2"><input class="form-control form-control-color w-100" type="color" name="color" value="#800020" title="Màu sắc"></div>
        <div class="col-md-6"><input class="form-control" name="image" placeholder="URL ảnh" data-image-url-input></div>
        <div class="col-md-4"><button class="btn btn-dark w-100">Lưu sản phẩm</button></div>
        <div class="col-12">
            <label class="product-upload-dropzone product-upload-dropzone-compact">
                <input type="file" name="image_file" accept="image/*" data-product-image-file>
                <img data-product-image-preview src="https://placehold.co/120x150?text=Luxe" alt="Xem trước ảnh">
                <span>
                    <strong>Kéo thả ảnh hoặc bấm chọn tệp</strong>
                    <small>Ảnh tải lên sẽ được lưu vào public/uploads/products.</small>
                </span>
            </label>
        </div>
        <div class="col-12"><textarea class="form-control" name="description" placeholder="Mô tả"></textarea></div>
        <input type="hidden" name="is_active" value="1">
    </form>
</div>

<div class="admin-list-head">
    <div>
        <h2>{{ $selectedCategory ? 'Sản phẩm: '.$selectedCategory->name : 'Tất cả sản phẩm' }}</h2>
        <p>{{ number_format($products->total()) }} sản phẩm trong danh sách hiện tại.</p>
    </div>
</div>

<div id="products-list" class="admin-product-list" data-current-category="{{ $selectedCategoryId }}">
    @forelse($products as $product)
        <div class="admin-product-row" id="product-row-{{ $product->id }}">
            <img src="{{ $product->image ?: 'https://via.placeholder.com/110' }}" alt="{{ $product->name }}">
            <div>
                <div class="d-flex flex-wrap align-items-center gap-2">
                    <h3 class="admin-product-title product-name">{{ $product->name }}</h3>
                    <span class="product-status"><span class="admin-status-pill {{ $product->is_active ? 'active' : 'muted' }}">{{ $product->is_active ? 'Đang hiển thị' : 'Đang ẩn' }}</span></span>
                </div>
                <p class="admin-product-price product-price">{{ number_format($product->price) }}đ</p>
                <div class="admin-product-meta">
                    <p class="mb-0"><strong>SKU:</strong> {{ $product->sku ?: '---' }}</p>
                    <p class="mb-0"><strong>Tồn kho:</strong> <span class="product-stock">{{ $product->stock }}</span></p>
                    <p class="mb-0"><strong>Màu:</strong> <span class="product-color-dot" style="--product-color: {{ $product->color ?: '#800020' }}"></span> <span class="product-color-text">{{ $product->color ?: '#800020' }}</span></p>
                    <p class="mb-0"><strong>Slug:</strong> {{ $product->slug }}</p>
                    <p class="mb-0"><strong>Danh mục:</strong> <span class="product-category">{{ $product->category->name ?? 'Chưa có' }}</span></p>
                </div>
            </div>
            <div class="admin-product-actions">
                <button class="btn btn-outline-dark product-edit" data-product='@json($product)'>Sửa</button>
                <button class="btn btn-dark product-hide" data-id="{{ $product->id }}" @disabled(! $product->is_active)>{{ $product->is_active ? 'Ẩn sản phẩm' : 'Đã ẩn' }}</button>
                <button class="btn btn-outline-danger product-delete" data-id="{{ $product->id }}">Xóa</button>
            </div>
        </div>
    @empty
        <div class="admin-empty-state">
            <h3>Chưa có sản phẩm trong danh mục này</h3>
            <p>Chọn danh mục khác hoặc thêm sản phẩm mới bằng form phía trên.</p>
        </div>
    @endforelse
</div>
<div class="mt-3">{{ $products->links() }}</div>
@endsection

@push('scripts')
<script src="{{ asset('assets/js/admin-product-upload.js') }}"></script>
<script src="{{ asset('assets/js/admin-products.js') }}"></script>
@endpush
