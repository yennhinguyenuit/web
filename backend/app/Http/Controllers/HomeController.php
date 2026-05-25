<?php

namespace App\Http\Controllers;

use App\Support\StorefrontCache;
use Illuminate\View\View;

class HomeController extends Controller
{
    public function index(): View
    {
        return view('customer.home', [
            'categories' => StorefrontCache::categories(),
            'latestProducts' => StorefrontCache::latestProducts(),
            'heroProducts' => StorefrontCache::heroProducts(),
            'flashSale' => StorefrontCache::currentFlashSale(),
        ]);
    }
}

