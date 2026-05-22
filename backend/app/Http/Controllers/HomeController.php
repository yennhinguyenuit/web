<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\FlashSale;
use App\Models\Product;
use Illuminate\View\View;

class HomeController extends Controller
{
    public function index(): View
    {
        return view('customer.home', [
            'categories' => Category::withCount('products')->get(),
            'latestProducts' => Product::with('category')->where('is_active', true)->latest()->take(8)->get(),
            'flashSale' => FlashSale::with('products')
                ->where('is_active', true)
                ->where('start_at', '<=', now())
                ->where('end_at', '>=', now())
                ->latest()
                ->first(),
        ]);
    }
}

