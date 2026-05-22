<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class CartController extends Controller
{
    public function index(): View
    {
        return view('customer.cart.index', ['cart' => $this->cart()]);
    }

    public function add(Request $request): JsonResponse|RedirectResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'size' => ['nullable', Rule::in(['XS', 'S', 'M', 'L', 'XL', 'XXL'])],
            'color' => ['nullable', 'string', 'max:32'],
        ]);

        $product = Product::where('is_active', true)->findOrFail($data['product_id']);
        $selectedSize = $data['size'] ?? 'M';
        $selectedColor = $data['color'] ?? ($product->color ?: '#800020');
        $selectedColorOption = collect($product->colorOptions())->firstWhere('hex', $selectedColor);
        $selectedColorName = $selectedColorOption['name'] ?? $product->colorName($selectedColor);
        $cart = $this->cart();
        $item = $cart->items()
            ->where('product_id', $product->id)
            ->where('selected_size', $selectedSize)
            ->where('selected_color', $selectedColor)
            ->first();
        $nextQuantity = $data['quantity'] + ($item?->quantity ?? 0);

        if ($nextQuantity > $product->stock) {
            return $this->fail($request, 'Số lượng vượt quá tồn kho.');
        }

        $cart->items()->updateOrCreate(
            [
                'product_id' => $product->id,
                'selected_size' => $selectedSize,
                'selected_color' => $selectedColor,
            ],
            [
                'quantity' => $nextQuantity,
                'unit_price' => $product->price,
                'selected_color_name' => $selectedColorName,
            ]
        );

        $redirect = $request->filled('buy_now') ? route('checkout.index') : route('cart.index');

        return $this->ok($request, 'Đã thêm sản phẩm vào giỏ hàng.', $redirect);
    }

    public function update(Request $request, CartItem $item): JsonResponse|RedirectResponse
    {
        $this->authorizeCartItem($item);
        $data = $request->validate(['quantity' => ['required', 'integer', 'min:1']]);

        if ($data['quantity'] > $item->product->stock) {
            return $this->fail($request, 'Số lượng vượt quá tồn kho.');
        }

        $item->update(['quantity' => $data['quantity']]);

        return $this->ok($request, 'Đã cập nhật giỏ hàng.', route('cart.index'));
    }

    public function destroy(Request $request, CartItem $item): JsonResponse|RedirectResponse
    {
        $this->authorizeCartItem($item);
        $item->delete();

        return $this->ok($request, 'Đã xóa sản phẩm khỏi giỏ hàng.', route('cart.index'));
    }

    public function clear(Request $request): RedirectResponse
    {
        $this->cart()->items()->delete();

        return redirect()->route('cart.index')->with('success', 'Đã xóa giỏ hàng.');
    }

    private function cart(): Cart
    {
        return Cart::firstOrCreate(['user_id' => Auth::id()])->load('items.product');
    }

    private function authorizeCartItem(CartItem $item): void
    {
        abort_unless($item->cart->user_id === Auth::id(), 403);
        $item->loadMissing('product');
    }

    private function ok(Request $request, string $message, string $redirect): JsonResponse|RedirectResponse
    {
        if ($request->expectsJson()) {
            return response()->json(['success' => true, 'message' => $message]);
        }

        return redirect($redirect)->with('success', $message);
    }

    private function fail(Request $request, string $message): JsonResponse|RedirectResponse
    {
        if ($request->expectsJson()) {
            return response()->json(['success' => false, 'message' => $message], 422);
        }

        return back()->withErrors(['cart' => $message]);
    }
}

