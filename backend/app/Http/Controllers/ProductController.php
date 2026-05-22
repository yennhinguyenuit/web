<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ProductController extends Controller
{
    public function index(Request $request): View
    {
        $query = Product::with('category')->where('is_active', true);

        if ($request->filled('q')) {
            $query->where('name', 'ilike', '%'.$request->string('q')->trim().'%');
        }

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($category) => $category->where('slug', $request->category));
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float) $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float) $request->max_price);
        }

        return view('customer.products.index', [
            'products' => $query->latest()->paginate(12)->withQueryString(),
            'categories' => Category::orderBy('name')->get(),
            'priceRangeMax' => (int) max(Product::where('is_active', true)->max('price') ?? 1000000, 1000000),
        ]);
    }

    public function show(string $slug): View
    {
        $product = Product::with([
            'category',
            'reviews' => fn ($query) => $query->where('is_visible', true)
                ->with(['user', 'replier'])
                ->latest(),
        ])->where('slug', $slug)->where('is_active', true)->firstOrFail();
        $relatedProducts = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->take(4)
            ->get();

        return view('customer.products.show', compact('product', 'relatedProducts'));
    }
}

