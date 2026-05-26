<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class ProductController extends Controller
{
    public function index(Request $request): View
    {
        $categoryId = $request->integer('category_id') ?: null;
        $statusFilter = $request->query('status');
        $statusFilter = in_array($statusFilter, ['active', 'hidden', 'low_stock'], true) ? $statusFilter : null;
        $statusLabels = [
            'active' => 'Sản phẩm đang hiển thị',
            'hidden' => 'Sản phẩm đang ẩn',
            'low_stock' => 'Sản phẩm tồn kho thấp',
        ];
        $categories = Category::withCount('products')->orderBy('name')->get();
        $products = Product::with('category')
            ->when($categoryId, fn ($query) => $query->where('category_id', $categoryId))
            ->when($statusFilter === 'active', fn ($query) => $query->where('is_active', true))
            ->when($statusFilter === 'hidden', fn ($query) => $query->where('is_active', false))
            ->when($statusFilter === 'low_stock', fn ($query) => $query->where('stock', '<=', 5))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return view('admin.products.index', [
            'products' => $products,
            'categories' => $categories,
            'selectedCategoryId' => $categoryId,
            'selectedCategory' => $categoryId ? $categories->firstWhere('id', $categoryId) : null,
            'statusFilter' => $statusFilter,
            'statusLabel' => $statusFilter ? $statusLabels[$statusFilter] : 'Tất cả sản phẩm',
            'totalProducts' => Product::count(),
            'activeProducts' => Product::where('is_active', true)->count(),
            'hiddenProducts' => Product::where('is_active', false)->count(),
            'lowStockProducts' => Product::where('stock', '<=', 5)->count(),
        ]);
    }

    public function create(): View
    {
        return view('admin.products.create', ['categories' => Category::orderBy('name')->get()]);
    }

    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $data = $this->validated($request);
        $variants = $data['variants'] ?? [];
        unset($data['variants']);
        $data['slug'] = ($data['slug'] ?? null) ?: Str::slug($data['name']);
        $data['image'] = $this->resolveProductImage($request, $data['image'] ?? null);
        unset($data['image_file']);

        $product = Product::create($data)->load('category');
        $this->syncVariants($product, $variants);

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'message' => 'Đã thêm sản phẩm.', 'product' => $product], 201);
        }

        return redirect()->route('admin.products.index')->with('success', 'Đã thêm sản phẩm.');
    }

    public function edit(Product $product): View
    {
        return view('admin.products.edit', [
            'product' => $product->load('variants'),
            'categories' => Category::orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Product $product): JsonResponse|RedirectResponse
    {
        $data = $this->validated($request, $product);
        $variants = $data['variants'] ?? [];
        unset($data['variants']);
        $data['slug'] = ($data['slug'] ?? null) ?: Str::slug($data['name']);
        $data['image'] = $this->resolveProductImage($request, $data['image'] ?? $product->image);
        unset($data['image_file']);
        $product->update($data);
        $this->syncVariants($product, $variants);
        $product->load('category');

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'message' => 'Đã cập nhật sản phẩm.', 'product' => $product]);
        }

        return redirect()->route('admin.products.index')->with('success', 'Đã cập nhật sản phẩm.');
    }

    public function hide(Request $request, Product $product): JsonResponse|RedirectResponse
    {
        $product->update(['is_active' => false]);
        $product->load('category');

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'message' => 'Đã ẩn sản phẩm.', 'product' => $product]);
        }

        return back()->with('success', 'Đã ẩn sản phẩm.');
    }

    public function activate(Request $request, Product $product): JsonResponse|RedirectResponse
    {
        $product->update(['is_active' => true]);
        $product->load('category');

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'message' => 'Đã hiện sản phẩm.', 'product' => $product]);
        }

        return back()->with('success', 'Đã hiện sản phẩm.');
    }

    public function destroy(Request $request, Product $product): JsonResponse|RedirectResponse
    {
        $product->cartItems()->delete();
        $product->update(['is_active' => false]);
        $product->delete();

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'message' => 'Đã xóa sản phẩm khỏi danh sách.']);
        }

        return back()->with('success', 'Đã xóa sản phẩm khỏi danh sách.');
    }

    private function validated(Request $request, ?Product $product = null): array
    {
        return $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('products')->ignore($product?->id)],
            'sku' => ['nullable', 'string', 'max:100', Rule::unique('products')->ignore($product?->id)],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'original_price' => ['nullable', 'numeric', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'color' => ['nullable', 'string', 'max:32'],
            'image' => ['nullable', 'string', 'max:1000'],
            'image_file' => ['nullable', 'image', 'max:4096'],
            'is_active' => ['nullable', 'boolean'],
            'variants' => ['nullable', 'array'],
            'variants.*.id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'variants.*.name' => ['nullable', 'string', 'max:255'],
            'variants.*.sku' => ['nullable', 'string', 'max:100'],
            'variants.*.color_name' => ['nullable', 'string', 'max:80'],
            'variants.*.color_hex' => ['nullable', 'string', 'max:32'],
            'variants.*.image' => ['nullable', 'string', 'max:1000'],
            'variants.*.stock' => ['nullable', 'integer', 'min:0'],
            'variants.*.is_active' => ['nullable', 'boolean'],
        ]);
    }

    private function syncVariants(Product $product, array $variants): void
    {
        $keptVariantIds = [];
        $seenColors = [];
        $sortOrder = 0;

        foreach ($variants as $variantData) {
            if (! $this->variantRowHasData($variantData)) {
                continue;
            }

            $payload = [
                'name' => $this->blankToNull($variantData['name'] ?? null),
                'sku' => $this->blankToNull($variantData['sku'] ?? null),
                'color_name' => $this->blankToNull($variantData['color_name'] ?? null),
                'color_hex' => $this->blankToNull($variantData['color_hex'] ?? null),
                'image' => $this->blankToNull($variantData['image'] ?? null),
                'stock' => (int) ($variantData['stock'] ?? 0),
                'sort_order' => $sortOrder++,
                'is_active' => (bool) ($variantData['is_active'] ?? false),
            ];

            if ($payload['color_hex'] && in_array($payload['color_hex'], $seenColors, true)) {
                continue;
            }
            if ($payload['color_hex']) {
                $seenColors[] = $payload['color_hex'];
            }

            $variant = isset($variantData['id'])
                ? $product->variants()->whereKey($variantData['id'])->first()
                : null;

            if ($variant) {
                $variant->update($payload);
            } else {
                $variant = $product->variants()->create($payload);
            }

            $keptVariantIds[] = $variant->id;
        }

        if ($keptVariantIds !== []) {
            $product->variants()->whereNotIn('id', $keptVariantIds)->update(['is_active' => false]);
            $product->updateQuietly(['stock' => $product->variants()->where('is_active', true)->sum('stock')]);
        }
    }

    private function blankToNull(?string $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    private function variantRowHasData(array $variantData): bool
    {
        if (filled($variantData['id'] ?? null)) {
            return true;
        }

        if ((int) ($variantData['stock'] ?? 0) > 0) {
            return true;
        }

        foreach (['name', 'sku', 'color_name', 'image'] as $field) {
            if (filled($variantData[$field] ?? null)) {
                return true;
            }
        }

        $colorHex = $this->blankToNull($variantData['color_hex'] ?? null);

        return $colorHex !== null && $colorHex !== '#800020';
    }

    private function resolveProductImage(Request $request, ?string $currentImage): ?string
    {
        if (! $request->hasFile('image_file')) {
            return $currentImage;
        }

        $directory = public_path('uploads/products');
        File::ensureDirectoryExists($directory);

        $file = $request->file('image_file');
        $filename = now()->format('YmdHis').'-'.Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        $filename .= '.'.$file->getClientOriginalExtension();
        $file->move($directory, $filename);

        return '/uploads/products/'.$filename;
    }
}
