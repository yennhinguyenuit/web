<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Services\FlashSaleScheduleService;
use Illuminate\View\View;

class HomeController extends Controller
{
    public function index(FlashSaleScheduleService $flashSaleSchedule): View
    {
        return view('customer.home', [
            'categories' => Category::withCount('products')->get(),
            'latestProducts' => Product::with('category')->where('is_active', true)->latest()->take(8)->get(),
            'heroProducts' => Product::where('is_active', true)
                ->whereNotNull('image')
                ->where('image', '!=', '')
                ->latest()
                ->take(6)
                ->get(['name', 'image']),
            'flashSale' => $flashSaleSchedule->current(),
        ]);
    }
}

