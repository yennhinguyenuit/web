<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
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
        $categories = Category::withCount('products')->orderBy('name')->get();
        $products = Product::with('category')
            ->when($categoryId, fn ($query) => $query->where('category_id', $categoryId))
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return view('admin.products.index', [
            'products' => $products,
            'categories' => $categories,
            'selectedCategoryId' => $categoryId,
            'selectedCategory' => $categoryId ? $categories->firstWhere('id', $categoryId) : null,
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
        $data['slug'] = ($data['slug'] ?? null) ?: Str::slug($data['name']);
        $data['image'] = $this->resolveProductImage($request, $data['image'] ?? null);
        unset($data['image_file']);

        $product = Product::create($data)->load('category');

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'message' => 'Đã thêm sản phẩm.', 'product' => $product], 201);
        }

        return redirect()->route('admin.products.index')->with('success', 'Đã thêm sản phẩm.');
    }

    public function edit(Product $product): View
    {
        return view('admin.products.edit', [
            'product' => $product,
            'categories' => Category::orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Product $product): JsonResponse|RedirectResponse
    {
        $data = $this->validated($request, $product);
        $data['slug'] = ($data['slug'] ?? null) ?: Str::slug($data['name']);
        $data['image'] = $this->resolveProductImage($request, $data['image'] ?? $product->image);
        unset($data['image_file']);
        $product->update($data);
        $product->load('category');

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'message' => 'Đã cập nhật sản phẩm.', 'product' => $product]);
        }

        return redirect()->route('admin.products.index')->with('success', 'Đã cập nhật sản phẩm.');
    }

    public function hide(Request $request, Product $product): JsonResponse|RedirectResponse
    {
        $product->update(['is_active' => false]);

        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'message' => 'Đã ẩn sản phẩm.']);
        }

        return back()->with('success', 'Đã ẩn sản phẩm.');
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
        ]);
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
