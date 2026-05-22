<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class CustomerController extends Controller
{
    public function index(): View
    {
        return view('admin.customers.index', [
            'customers' => User::withCount('orders')->where('role', 'customer')->latest()->paginate(12),
        ]);
    }

    public function create(): View
    {
        return view('admin.customers.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $data['password'] = Hash::make($data['password']);
        $data['role'] = 'customer';
        User::create($data);

        return redirect()->route('admin.customers.index')->with('success', 'Đã thêm khách hàng.');
    }

    public function show(User $customer): View
    {
        abort_unless($customer->role === 'customer', 404);

        return view('admin.customers.show', ['customer' => $customer->load('orders.items')]);
    }

    public function edit(User $customer): View
    {
        abort_unless($customer->role === 'customer', 404);

        return view('admin.customers.edit', compact('customer'));
    }

    public function update(Request $request, User $customer): RedirectResponse
    {
        abort_unless($customer->role === 'customer', 404);
        $data = $this->validated($request, $customer);
        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }
        $customer->update($data);

        return redirect()->route('admin.customers.index')->with('success', 'Đã cập nhật khách hàng.');
    }

    public function destroy(User $customer): RedirectResponse
    {
        abort_unless($customer->role === 'customer', 404);
        $customer->update(['status' => 'locked']);

        return back()->with('success', 'Đã khóa khách hàng.');
    }

    private function validated(Request $request, ?User $customer = null): array
    {
        $passwordRule = $customer ? ['nullable', 'confirmed', 'min:6'] : ['required', 'confirmed', 'min:6'];

        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($customer?->id)],
            'password' => $passwordRule,
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', Rule::in(['active', 'locked'])],
            'customer_tier' => ['required', Rule::in(['bronze', 'silver', 'gold', 'vip'])],
        ]);
    }
}

