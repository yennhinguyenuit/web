<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FlashSale;
use App\Models\Product;
use App\Services\FlashSaleScheduleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class FlashSaleController extends Controller
{
    public function index(FlashSaleScheduleService $flashSaleSchedule): View
    {
        $newAutoCampaigns = $flashSaleSchedule->sync();

        return view('admin.flash-sales.index', [
            'flashSales' => FlashSale::with('products')->latest()->paginate(10),
            'products' => Product::where('is_active', true)->orderBy('name')->get(),
            'newAutoCampaigns' => $newAutoCampaigns,
        ]);
    }

    public function create(FlashSaleScheduleService $flashSaleSchedule): View
    {
        return $this->index($flashSaleSchedule);
    }

    public function edit(FlashSale $flashSale, FlashSaleScheduleService $flashSaleSchedule): View
    {
        return $this->index($flashSaleSchedule);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $productIds = $data['product_ids'] ?? [];
        unset($data['product_ids']);

        $flashSale = FlashSale::create($data);
        $flashSale->products()->sync($productIds);

        return back()->with('success', 'Đã tạo flash sale.');
    }

    public function update(Request $request, FlashSale $flashSale): RedirectResponse
    {
        $data = $this->validated($request);
        $productIds = $data['product_ids'] ?? [];
        unset($data['product_ids']);
        $flashSale->update($data);
        $flashSale->products()->sync($productIds);

        return back()->with('success', 'Đã cập nhật flash sale.');
    }

    public function destroy(FlashSale $flashSale): RedirectResponse
    {
        $flashSale->update(['is_active' => false]);

        return back()->with('success', 'Đã tắt flash sale.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'discount_percent' => ['required', 'numeric', 'min:1', 'max:100'],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after:start_at'],
            'is_active' => ['nullable', 'boolean'],
            'product_ids' => ['nullable', 'array'],
            'product_ids.*' => ['integer', Rule::exists('products', 'id')],
        ]) + ['is_active' => false];
    }
}

