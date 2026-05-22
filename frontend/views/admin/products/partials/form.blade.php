<div class="col-md-6"><label class="form-label">Tên sản phẩm</label><input class="form-control" name="name" value="{{ old('name', $product->name ?? '') }}" required></div>
<div class="col-md-3"><label class="form-label">Slug</label><input class="form-control" name="slug" value="{{ old('slug', $product->slug ?? '') }}"></div>
<div class="col-md-3"><label class="form-label">SKU</label><input class="form-control" name="sku" value="{{ old('sku', $product->sku ?? '') }}"></div>
<div class="col-md-4"><label class="form-label">Danh mục</label><select class="form-select" name="category_id" required>@foreach($categories as $category)<option value="{{ $category->id }}" @selected(old('category_id', $product->category_id ?? '') == $category->id)>{{ $category->name }}</option>@endforeach</select></div>
<div class="col-md-4"><label class="form-label">Giá</label><input class="form-control" type="number" name="price" value="{{ old('price', $product->price ?? '') }}" required></div>
<div class="col-md-4"><label class="form-label">Giá gốc</label><input class="form-control" type="number" name="original_price" value="{{ old('original_price', $product->original_price ?? '') }}"></div>
<div class="col-md-4"><label class="form-label">Tồn kho</label><input class="form-control" type="number" name="stock" value="{{ old('stock', $product->stock ?? 0) }}" required></div>
<div class="col-md-4">
    <label class="form-label">Màu sắc</label>
    <div class="product-color-input">
        <input class="form-control form-control-color" type="color" name="color" value="{{ old('color', $product->color ?? '#800020') }}">
        <span>Chọn màu sản phẩm</span>
    </div>
</div>
<div class="col-md-8"><label class="form-label">URL ảnh</label><input class="form-control" name="image" value="{{ old('image', $product->image ?? '') }}" data-image-url-input></div>
<div class="col-12">
    <label class="form-label">Ảnh sản phẩm</label>
    <label class="product-upload-dropzone">
        <input type="file" name="image_file" accept="image/*" data-product-image-file>
        <img data-product-image-preview src="{{ old('image', $product->image ?? '') ?: 'https://placehold.co/180x220?text=Luxe' }}" alt="Xem trước ảnh">
        <span>
            <strong>Kéo thả ảnh vào đây hoặc bấm để chọn tệp</strong>
            <small>Hỗ trợ JPG, PNG, WEBP. Có thể dùng URL ảnh hoặc tải tệp lên.</small>
        </span>
    </label>
</div>
<div class="col-12"><label class="form-label">Mô tả</label><textarea class="form-control" name="description" rows="4">{{ old('description', $product->description ?? '') }}</textarea></div>
<input type="hidden" name="is_active" value="0">
<div class="col-12"><label class="form-check"><input class="form-check-input" type="checkbox" name="is_active" value="1" @checked(old('is_active', $product->is_active ?? true))> <span class="form-check-label">Đang hiển thị</span></label></div>
