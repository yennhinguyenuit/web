<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Product;
use App\Support\TrafficTelemetry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Throwable;

class TrackingController extends Controller
{
    public function productClick(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'source_url' => ['nullable', 'string', 'max:2048'],
            'target_url' => ['nullable', 'string', 'max:2048'],
        ]);

        try {
            $product = Product::with('category')->find($data['product_id']);

            ActivityLog::create([
                'user_id' => $request->user()?->id,
                'action' => 'product_click',
                'ip_address' => $request->ip(),
                'data' => [
                    ...TrafficTelemetry::requestData($request),
                    'product_id' => $product?->id,
                    'product_name' => $product?->name,
                    'product_slug' => $product?->slug,
                    'category' => $product?->category?->name,
                    'source_url' => Str::limit($data['source_url'] ?? '', 2048, ''),
                    'target_url' => Str::limit($data['target_url'] ?? '', 2048, ''),
                ],
            ]);
        } catch (Throwable $exception) {
            report($exception);
        }

        return response()->json(['ok' => true]);
    }
}
