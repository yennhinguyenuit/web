<div class="col-md-6">
    <label class="form-label">Tên sản phẩm</label>
    <input class="form-control" name="name" value="{{ old('name', $product->name ?? '') }}" required>
</div>
<div class="col-md-3">
    <label class="form-label">Slug</label>
    <input class="form-control" name="slug" value="{{ old('slug', $product->slug ?? '') }}">
</div>
<div class="col-md-3">
    <label class="form-label">SKU</label>
    <input class="form-control" name="sku" value="{{ old('sku', $product->sku ?? '') }}">
</div>
<div class="col-md-4">
    <label class="form-label">Danh mục</label>
    <select class="form-select" name="category_id" required>
        @foreach($categories as $category)
            <option value="{{ $category->id }}" @selected(old('category_id', $product->category_id ?? '') == $category->id)>{{ $category->name }}</option>
        @endforeach
    </select>
</div>
<div class="col-md-4">
    <label class="form-label">Giá</label>
    <input class="form-control" type="number" name="price" value="{{ old('price', $product->price ?? '') }}" required>
</div>
<div class="col-md-4">
    <label class="form-label">Giá gốc</label>
    <input class="form-control" type="number" name="original_price" value="{{ old('original_price', $product->original_price ?? '') }}">
</div>
<div class="col-md-4">
    <label class="form-label">Tồn kho tổng</label>
    <input class="form-control" type="number" name="stock" value="{{ old('stock', $product->stock ?? 0) }}" required>
</div>
<div class="col-md-4">
    <label class="form-label">Màu mặc định</label>
    <div class="product-color-input">
        <input class="form-control form-control-color" type="color" name="color" value="{{ old('color', $product->color ?? '#800020') }}">
        <span>Dùng khi sản phẩm chưa có biến thể</span>
    </div>
</div>
<div class="col-md-8">
    <label class="form-label">URL ảnh mặc định</label>
    <input class="form-control" name="image" value="{{ old('image', $product->image ?? '') }}" data-image-url-input>
</div>
<div class="col-12">
    <label class="form-label">Ảnh sản phẩm mặc định</label>
    <label class="product-upload-dropzone">
        <input type="file" name="image_file" accept="image/*" data-product-image-file>
        <img data-product-image-preview src="{{ old('image', $product->image ?? '') ?: 'https://placehold.co/180x220?text=Luxe' }}" alt="Xem trước ảnh">
        <span>
            <strong>Kéo thả ảnh vào đây hoặc bấm để chọn tệp</strong>
            <small>Hỗ trợ JPG, PNG, WEBP. Có thể dùng URL ảnh hoặc tải tệp lên.</small>
        </span>
    </label>
</div>

@php
    $variantRows = collect(old('variants', isset($product) ? $product->variants->map(fn ($variant) => [
        'id' => $variant->id,
        'name' => $variant->name,
        'sku' => $variant->sku,
        'color_name' => $variant->color_name,
        'color_hex' => $variant->color_hex,
        'image' => $variant->image,
        'stock' => $variant->stock,
        'is_active' => $variant->is_active,
    ])->values()->all() : []));

    while ($variantRows->count() < 5) {
        $variantRows->push([
            'id' => null,
            'name' => null,
            'sku' => null,
            'color_name' => null,
            'color_hex' => '#800020',
            'image' => null,
            'stock' => 0,
            'is_active' => true,
        ]);
    }
@endphp
<div class="col-12">
    <div class="variant-editor">
        <div class="variant-editor-head">
            <div>
                <h3>Biến thể màu</h3>
                <p>Mỗi dòng là một màu/biến thể. URL ảnh riêng sẽ được dùng khi khách chọn màu đó.</p>
            </div>
        </div>
        <div class="variant-editor-grid">
            @foreach($variantRows as $index => $variant)
                <div class="variant-row">
                    <input type="hidden" name="variants[{{ $index }}][id]" value="{{ $variant['id'] ?? '' }}">
                    <div>
                        <label class="form-label">Tên màu</label>
                        <input class="form-control" name="variants[{{ $index }}][color_name]" value="{{ $variant['color_name'] ?? '' }}" placeholder="Đen, Trắng, Be...">
                    </div>
                    <div>
                        <label class="form-label">Mã màu</label>
                        <input class="form-control form-control-color" type="color" name="variants[{{ $index }}][color_hex]" value="{{ $variant['color_hex'] ?: '#800020' }}">
                    </div>
                    <div>
                        <label class="form-label">SKU biến thể</label>
                        <input class="form-control" name="variants[{{ $index }}][sku]" value="{{ $variant['sku'] ?? '' }}">
                    </div>
                    <div>
                        <label class="form-label">Tồn kho</label>
                        <input class="form-control" type="number" min="0" name="variants[{{ $index }}][stock]" value="{{ $variant['stock'] ?? 0 }}">
                    </div>
                    <div class="variant-image-field">
                        <label class="form-label">URL ảnh riêng</label>
                        <input class="form-control" name="variants[{{ $index }}][image]" value="{{ $variant['image'] ?? '' }}" placeholder="/uploads/products/black.webp hoặc https://...">
                    </div>
                    <label class="form-check variant-active-check">
                        <input type="hidden" name="variants[{{ $index }}][is_active]" value="0">
                        <input class="form-check-input" type="checkbox" name="variants[{{ $index }}][is_active]" value="1" @checked($variant['is_active'] ?? true)>
                        <span class="form-check-label">Bật</span>
                    </label>
                </div>
            @endforeach
        </div>
    </div>
</div>

<div class="col-12">
    <label class="form-label">Mô tả</label>
    <textarea class="form-control" name="description" rows="4">{{ old('description', $product->description ?? '') }}</textarea>
</div>
<input type="hidden" name="is_active" value="0">
<div class="col-12">
    <label class="form-check">
        <input class="form-check-input" type="checkbox" name="is_active" value="1" @checked(old('is_active', $product->is_active ?? true))>
        <span class="form-check-label">Đang hiển thị</span>
    </label>
</div>
