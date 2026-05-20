import { useEffect, useMemo, useState } from 'react';
import { adminAPI, productAPI } from '../../services/api';

const emptyForm = {
  name: '',
  slug: '',
  price: '',
  stock: '',
  categoryId: '',
  image: '',
  imagesText: '',
  colorsText: '',
  sizesText: '',
  description: '',
  isActive: true,
};

const statusOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'visible', label: 'Đang hiển thị' },
  { value: 'hidden', label: 'Đang ẩn' },
  { value: 'deleted', label: 'Đã xóa' },
];

const splitList = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const toSlug = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getProducts();
     setProducts(res.data || res || []);
      setError('');
    } catch (error) {
      console.error(error);
      setError(error.message || 'Không tải được sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await productAPI.getCategories();
      setCategories(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const stats = useMemo(() => {
    const visible = products.filter((product) => !product.isDeleted && product.isActive).length;
    const hidden = products.filter((product) => !product.isDeleted && !product.isActive).length;
    const deleted = products.filter((product) => product.isDeleted).length;
    return {
      total: products.length,
      visible,
      hidden,
      deleted,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const kw = keyword.trim().toLowerCase();

    return products.filter((product) => {
      const matchesKeyword = !kw || [product.name, product.slug, product.category?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(kw));

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'deleted'
            ? Boolean(product.isDeleted)
            : statusFilter === 'visible'
              ? !product.isDeleted && Boolean(product.isActive)
              : !product.isDeleted && !product.isActive;

      return matchesKeyword && matchesStatus;
    });
  }, [keyword, products, statusFilter]);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (product) => {
    if (product.isDeleted) return;

    setEditingProduct(product);
    setForm({
      name: product.name || '',
      slug: product.slug || '',
      price: product.price || '',
      stock: product.stock || '',
      categoryId: product.categoryId || product.category?.id || '',
      image: product.image || product.images?.[0] || '',
      imagesText: Array.isArray(product.images) ? product.images.join(', ') : '',
      colorsText: Array.isArray(product.colors) ? product.colors.join(', ') : '',
      sizesText: Array.isArray(product.sizes) ? product.sizes.join(', ') : '',
      description: product.description || '',
      isActive: Boolean(product.isActive),
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNameBlur = () => {
    if (!editingProduct && !form.slug.trim()) {
      handleChange('slug', toSlug(form.name));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    const images = splitList(form.imagesText);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      categoryId: form.categoryId || undefined,
      image: form.image.trim(),
      images: images.length ? images : form.image.trim() ? [form.image.trim()] : [],
      colors: splitList(form.colorsText),
      sizes: splitList(form.sizesText),
      description: form.description,
      isActive: Boolean(form.isActive),
    };

    try {
      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct.id, payload);
      } else {
        await adminAPI.createProduct(payload);
      }

      await loadProducts();
      closeForm();
    } catch (error) {
      console.error(error);
      alert(error.message || 'Không thể lưu sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (product) => {
    if (product.isDeleted) return;

    const nextValue = !product.isActive;
    const confirmed = window.confirm(
      nextValue
        ? `Hiện lại sản phẩm "${product.name}"?`
        : `Ẩn sản phẩm "${product.name}"?`
    );
    if (!confirmed) return;

    setActionId(product.id);
    try {
      await adminAPI.toggleProductVisibility(product.id, nextValue);
      await loadProducts();
    } catch (error) {
      console.error(error);
      alert(error.message || 'Không thể cập nhật trạng thái hiển thị');
    } finally {
      setActionId('');
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(`Xóa sản phẩm "${product.name}"? Sản phẩm sẽ được đánh dấu đã xóa.`);
    if (!confirmed) return;

    setActionId(product.id);
    try {
      await adminAPI.deleteProduct(product.id);
      await loadProducts();
    } catch (error) {
      console.error(error);
      alert(error.message || 'Không thể xóa sản phẩm');
    } finally {
      setActionId('');
    }
  };

  if (loading) {
    return <div className="text-neutral-500">Đang tải sản phẩm...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-lg bg-white border border-neutral-200 shadow-sm p-5">
          <p className="text-sm text-neutral-500">Tổng sản phẩm</p>
          <p className="mt-2 text-3xl font-bold text-neutral-950">{stats.total}</p>
        </div>
        <div className="rounded-lg bg-white border border-neutral-200 shadow-sm p-5">
          <p className="text-sm text-neutral-500">Đang hiển thị</p>
          <p className="mt-2 text-3xl font-bold text-neutral-950">{stats.visible}</p>
        </div>
        <div className="rounded-lg bg-white border border-neutral-200 shadow-sm p-5">
          <p className="text-sm text-neutral-500">Đang ẩn</p>
          <p className="mt-2 text-3xl font-bold text-neutral-700">{stats.hidden}</p>
        </div>
        <div className="rounded-lg bg-white border border-neutral-200 shadow-sm p-5">
          <p className="text-sm text-neutral-500">Đã xóa</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{stats.deleted}</p>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow-sm border border-neutral-200 p-6 flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm tên, slug, danh mục..."
            className="border border-neutral-300 rounded-lg px-4 py-3 w-full sm:w-80 focus:border-neutral-950 focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-neutral-300 rounded-lg px-4 py-3 w-full sm:w-56 focus:border-neutral-950 focus:outline-none"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={loadProducts}
            className="rounded-lg border border-neutral-300 px-5 py-3 font-medium text-neutral-800 hover:bg-neutral-100"
          >
            Làm mới
          </button>
          <button
            onClick={openCreate}
            className="rounded-lg bg-neutral-950 text-white px-5 py-3 font-medium hover:bg-neutral-800"
          >
            + Thêm sản phẩm
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4">
        {filteredProducts.map((product) => {
          const isBusy = actionId === product.id;
          const isDeleted = Boolean(product.isDeleted);
          const isHidden = !isDeleted && !product.isActive;

          return (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm border border-neutral-200 p-5 grid md:grid-cols-[110px_1fr_auto] gap-4 items-center transition hover:border-neutral-300 hover:bg-neutral-50/60"
            >
              <img
                src={product.image || product.images?.[0] || 'https://via.placeholder.com/110'}
                alt={product.name}
                className="w-28 h-28 rounded-lg object-cover border border-neutral-200 bg-neutral-100"
              />

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-lg text-neutral-950">{product.name}</h3>
                  {isDeleted ? (
                    <span className="rounded-full px-3 py-1 text-xs font-medium bg-red-100 text-red-700">
                      Đã xóa
                    </span>
                  ) : isHidden ? (
                    <span className="rounded-full px-3 py-1 text-xs font-medium bg-neutral-100 text-neutral-700">
                      Đang ẩn
                    </span>
                  ) : (
                    <span className="rounded-full px-3 py-1 text-xs font-medium bg-neutral-950 text-white">
                      Đang hiển thị
                    </span>
                  )}
                </div>

                <p className="text-neutral-950 font-semibold text-lg">{formatCurrency(product.price)}</p>
                <div className="grid md:grid-cols-2 gap-2 text-sm text-neutral-600">
                  <p><span className="font-medium text-neutral-800">Slug:</span> {product.slug || '---'}</p>
                  <p><span className="font-medium text-neutral-800">Tồn kho:</span> {product.stock ?? 0}</p>
                  <p><span className="font-medium text-neutral-800">Danh mục:</span> {product.category?.name || 'Chưa có'}</p>
                  <p><span className="font-medium text-neutral-800">Màu:</span> {product.colors?.join(', ') || '---'}</p>
                  <p><span className="font-medium text-neutral-800">Size:</span> {product.sizes?.join(', ') || '---'}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => openEdit(product)}
                  disabled={isBusy || isDeleted}
                  className="rounded-lg border border-neutral-300 px-4 py-2 hover:bg-neutral-100 disabled:opacity-50"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleToggleVisibility(product)}
                  disabled={isBusy || isDeleted}
                  className="rounded-lg bg-neutral-950 text-white px-4 py-2 hover:bg-neutral-800 disabled:opacity-50"
                >
                  {isBusy ? 'Đang xử lý...' : product.isActive ? 'Ẩn sản phẩm' : 'Hiện sản phẩm'}
                </button>
                <button
                  onClick={() => handleDelete(product)}
                  disabled={isBusy || isDeleted}
                  className="rounded-lg bg-red-600 text-white px-4 py-2 hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleted ? 'Đã xóa' : 'Xóa sản phẩm'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!filteredProducts.length ? (
        <div className="rounded-lg bg-white shadow-sm border border-neutral-200 p-6 text-neutral-500">
          Không có sản phẩm phù hợp.
        </div>
      ) : null}

      {showForm ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-lg bg-white shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-neutral-950">
                {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
              </h2>
              <button onClick={closeForm} className="text-neutral-500 hover:text-neutral-950">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <input
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={handleNameBlur}
                placeholder="Tên sản phẩm"
                className="border border-neutral-300 rounded-lg px-4 py-3 focus:border-neutral-950 focus:outline-none"
                required
              />

              <input
                value={form.slug}
                onChange={(e) => handleChange('slug', toSlug(e.target.value))}
                placeholder="Slug"
                className="border border-neutral-300 rounded-lg px-4 py-3 focus:border-neutral-950 focus:outline-none"
                required
              />

              <input
                value={form.price}
                onChange={(e) => handleChange('price', e.target.value)}
                placeholder="Giá"
                type="number"
                min="0"
                className="border border-neutral-300 rounded-lg px-4 py-3 focus:border-neutral-950 focus:outline-none"
                required
              />

              <input
                value={form.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                placeholder="Tồn kho"
                type="number"
                min="0"
                className="border border-neutral-300 rounded-lg px-4 py-3 focus:border-neutral-950 focus:outline-none"
              />

              <select
                value={form.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                className="border border-neutral-300 rounded-lg px-4 py-3 md:col-span-2 focus:border-neutral-950 focus:outline-none"
                required
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <input
                value={form.image}
                onChange={(e) => handleChange('image', e.target.value)}
                placeholder="Ảnh chính"
                className="border border-neutral-300 rounded-lg px-4 py-3 md:col-span-2 focus:border-neutral-950 focus:outline-none"
              />

              <input
                value={form.imagesText}
                onChange={(e) => handleChange('imagesText', e.target.value)}
                placeholder="Danh sách ảnh, cách nhau bằng dấu phẩy"
                className="border border-neutral-300 rounded-lg px-4 py-3 md:col-span-2 focus:border-neutral-950 focus:outline-none"
              />

              <input
                value={form.colorsText}
                onChange={(e) => handleChange('colorsText', e.target.value)}
                placeholder="Màu sắc, cách nhau bằng dấu phẩy"
                className="border border-neutral-300 rounded-lg px-4 py-3 focus:border-neutral-950 focus:outline-none"
              />

              <input
                value={form.sizesText}
                onChange={(e) => handleChange('sizesText', e.target.value)}
                placeholder="Kích thước, cách nhau bằng dấu phẩy"
                className="border border-neutral-300 rounded-lg px-4 py-3 focus:border-neutral-950 focus:outline-none"
              />

              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Mô tả chi tiết"
                rows={5}
                className="border border-neutral-300 rounded-lg px-4 py-3 md:col-span-2 focus:border-neutral-950 focus:outline-none"
              />

              <label className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                />
                <span className="text-neutral-700">Hiển thị sản phẩm</span>
              </label>

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-neutral-300 px-5 py-3 hover:bg-neutral-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-neutral-950 text-white px-5 py-3 hover:bg-neutral-800 disabled:opacity-60"
                >
                  {saving ? 'Đang lưu...' : editingProduct ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
