const productForm = document.getElementById('product-form');
const productAlert = document.getElementById('product-alert');
const productReset = document.getElementById('product-reset');
const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
const productsList = document.getElementById('products-list');

if ((productForm || productsList) && !csrfToken) {
    console.error('Admin products CSRF token is missing.');
}

function showProductAlert(message, type = 'success') {
    if (!productAlert) {
        window.alert(message);
        return;
    }

    productAlert.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

function productPayload(product) {
    return JSON.stringify(product).replace(/'/g, '&#39;');
}

function productRow(product) {
    const price = new Intl.NumberFormat('vi-VN').format(product.price) + 'đ';
    const activeText = product.is_active ? 'Đang hiển thị' : 'Đang ẩn';
    const activeClass = product.is_active ? 'active' : 'muted';
    const image = product.image || 'https://via.placeholder.com/110';
    const color = product.color || '#800020';

    return `
        <div class="admin-product-row" id="product-row-${product.id}">
            <img src="${image}" alt="${product.name || ''}">
            <div>
                <div class="d-flex flex-wrap align-items-center gap-2">
                    <h3 class="admin-product-title product-name">${product.name || ''}</h3>
                    <span class="product-status"><span class="admin-status-pill ${activeClass}">${activeText}</span></span>
                </div>
                <p class="admin-product-price product-price">${price}</p>
                <div class="admin-product-meta">
                    <p class="mb-0"><strong>SKU:</strong> ${product.sku || '---'}</p>
                    <p class="mb-0"><strong>Tồn kho:</strong> <span class="product-stock">${product.stock || 0}</span></p>
                    <p class="mb-0"><strong>Màu:</strong> <span class="product-color-dot" style="--product-color: ${color}"></span> <span class="product-color-text">${color}</span></p>
                    <p class="mb-0"><strong>Slug:</strong> ${product.slug || ''}</p>
                    <p class="mb-0"><strong>Danh mục:</strong> <span class="product-category">${product.category?.name || 'Chưa có'}</span></p>
                </div>
            </div>
            <div class="admin-product-actions">
                <button class="btn btn-outline-dark product-edit" data-product='${productPayload(product)}'>Sửa</button>
                <button class="btn btn-dark product-hide" data-id="${product.id}" ${product.is_active ? '' : 'disabled'}>${product.is_active ? 'Ẩn sản phẩm' : 'Đã ẩn'}</button>
                <button class="btn btn-outline-danger product-delete" data-id="${product.id}">Xóa</button>
            </div>
        </div>`;
}

function fillProductForm(product) {
    document.getElementById('product-id').value = product.id;
    productForm.name.value = product.name || '';
    productForm.sku.value = product.sku || '';
    productForm.category_id.value = product.category_id || '';
    productForm.price.value = product.price || 0;
    productForm.stock.value = product.stock || 0;
    productForm.color.value = product.color || '#800020';
    productForm.image.value = product.image || '';
    if (productForm.image_file) {
        productForm.image_file.value = '';
    }
    const preview = productForm.querySelector('[data-product-image-preview]');
    if (preview) {
        preview.src = product.image || 'https://placehold.co/120x150?text=Luxe';
    }
    productForm.description.value = product.description || '';
    productForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function bindProductButtons(scope = document) {
    scope.querySelectorAll('.product-edit').forEach((button) => {
        button.onclick = () => fillProductForm(JSON.parse(button.dataset.product));
    });

    scope.querySelectorAll('.product-hide').forEach((button) => {
        button.onclick = async () => {
            if (!confirm('Ẩn sản phẩm này?')) return;
            const response = await fetch(`/admin/products/${button.dataset.id}/hide`, {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });
            const payload = await response.json();
            if (!response.ok) return showProductAlert(payload.message || 'Không thể ẩn sản phẩm.', 'danger');

            const row = document.getElementById(`product-row-${button.dataset.id}`);
            row.querySelector('.product-status').innerHTML = '<span class="admin-status-pill muted">Đang ẩn</span>';
            button.textContent = 'Đã ẩn';
            button.disabled = true;
            showProductAlert(payload.message || 'Đã ẩn sản phẩm.');
        };
    });

    scope.querySelectorAll('.product-delete').forEach((button) => {
        button.onclick = async () => {
            if (!confirm('Xóa sản phẩm khỏi danh sách quản trị?')) return;
            const response = await fetch(`/admin/products/${button.dataset.id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });
            const payload = await response.json();
            if (!response.ok) return showProductAlert(payload.message || 'Không thể xóa sản phẩm.', 'danger');

            document.getElementById(`product-row-${button.dataset.id}`)?.remove();
            showProductAlert(payload.message || 'Đã xóa sản phẩm khỏi danh sách.');
        };
    });
}

productForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const productId = document.getElementById('product-id').value;
    const data = new FormData(productForm);
    const url = productId ? `/admin/products/${productId}` : '/admin/products';
    if (productId) {
        data.append('_method', 'PUT');
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: data,
    });
    const payload = await response.json();
    if (!response.ok) return showProductAlert(payload.message || Object.values(payload.errors || {}).flat().join('<br>'), 'danger');

    const row = document.getElementById(`product-row-${payload.product.id}`);
    const currentCategory = productsList?.dataset.currentCategory;
    const productMatchesFilter = !currentCategory || Number(currentCategory) === Number(payload.product.category_id);

    if (row) {
        if (productMatchesFilter) {
            row.outerHTML = productRow(payload.product);
            bindProductButtons(document.getElementById(`product-row-${payload.product.id}`));
        } else {
            row.remove();
        }
    } else if (productMatchesFilter && productsList) {
        productsList.querySelector('.admin-empty-state')?.remove();
        productsList.insertAdjacentHTML('afterbegin', productRow(payload.product));
        bindProductButtons(document.getElementById(`product-row-${payload.product.id}`));
    }

    productForm.reset();
    document.getElementById('product-id').value = '';
    const preview = productForm.querySelector('[data-product-image-preview]');
    if (preview) {
        preview.src = 'https://placehold.co/120x150?text=Luxe';
    }
    showProductAlert(payload.message || 'Đã lưu sản phẩm.');
});

productReset?.addEventListener('click', () => {
    productForm.reset();
    document.getElementById('product-id').value = '';
    const preview = productForm.querySelector('[data-product-image-preview]');
    if (preview) {
        preview.src = 'https://placehold.co/120x150?text=Luxe';
    }
});

bindProductButtons();
