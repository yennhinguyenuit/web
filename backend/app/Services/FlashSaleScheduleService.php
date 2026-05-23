<?php

namespace App\Services;

use App\Models\FlashSale;
use App\Models\Product;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class FlashSaleScheduleService
{
    public function sync(int $fromYear = 0, int $yearsAhead = 1): int
    {
        $fromYear = $fromYear > 0 ? $fromYear : now()->year;
        $productIds = $this->defaultProductIds();
        $synced = 0;

        for ($year = $fromYear; $year <= $fromYear + $yearsAhead; $year++) {
            foreach ($this->campaignsForYear($year) as $campaign) {
                $flashSale = FlashSale::firstOrNew([
                    'name' => $campaign['name'],
                ]);

                if (! $flashSale->exists) {
                    $flashSale->fill([
                        'discount_percent' => $campaign['discount_percent'],
                        'start_at' => $campaign['start_at'],
                        'end_at' => $campaign['end_at'],
                        'is_active' => true,
                    ])->save();
                    $synced++;
                } elseif ($flashSale->is_active) {
                    $flashSale->fill([
                        'discount_percent' => $campaign['discount_percent'],
                        'start_at' => $campaign['start_at'],
                        'end_at' => $campaign['end_at'],
                    ]);

                    if ($flashSale->isDirty(['discount_percent', 'start_at', 'end_at'])) {
                        $flashSale->save();
                    }
                }

                if ($productIds->isNotEmpty() && $flashSale->products()->count() === 0) {
                    $flashSale->products()->sync($productIds);
                }
            }
        }

        return $synced;
    }

    public function current(): ?FlashSale
    {
        $this->sync();

        return FlashSale::with('products.category')
            ->where('is_active', true)
            ->where('start_at', '<=', now())
            ->where('end_at', '>=', now())
            ->latest('start_at')
            ->first();
    }

    public function campaignsForYear(int $year): array
    {
        $campaigns = [];

        for ($month = 1; $month <= 12; $month++) {
            $date = Carbon::create($year, $month, $month, 0, 0, 0);
            $label = sprintf('%d.%d', $month, $month);

            $campaigns[] = [
                'name' => "Luxe {$label} Sale {$year}",
                'discount_percent' => $month === 12 ? 30 : 15,
                'start_at' => $date->copy()->startOfDay(),
                'end_at' => $date->copy()->endOfDay(),
            ];
        }

        $blackFriday = $this->blackFriday($year);
        $campaigns[] = [
            'name' => "Luxe Black Friday {$year}",
            'discount_percent' => 40,
            'start_at' => $blackFriday->copy()->startOfDay(),
            'end_at' => $blackFriday->copy()->addDays(2)->endOfDay(),
        ];

        return $campaigns;
    }

    private function defaultProductIds(): Collection
    {
        return Product::where('is_active', true)
            ->where('stock', '>', 0)
            ->latest()
            ->take(8)
            ->pluck('id');
    }

    private function blackFriday(int $year): Carbon
    {
        $date = Carbon::create($year, 11, 1)->startOfDay();

        while ($date->dayOfWeek !== Carbon::THURSDAY) {
            $date->addDay();
        }

        return $date->addWeeks(3)->addDay();
    }
}
