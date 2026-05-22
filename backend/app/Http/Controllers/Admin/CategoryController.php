<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class CategoryController extends Controller
{
    public function index(): View
    {
        return view('admin.categories.index', [
            'categories' => Category::withCount('products')->orderBy('name')->get(),
        ]);
    }

    public function create(): View
    {
        return $this->index();
    }

    public function edit(Category $category): View
    {
        return $this->index();
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:categories,slug'],
            'description' => ['nullable', 'string'],
        ]);
        $data['slug'] = $data['slug'] ?: Str::slug($data['name']);
        Category::create($data);

        return back()->with('success', 'Đã thêm danh mục.');
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('categories')->ignore($category->id)],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('categories')->ignore($category->id)],
            'description' => ['nullable', 'string'],
        ]);
        $data['slug'] = $data['slug'] ?: Str::slug($data['name']);
        $category->update($data);

        return back()->with('success', 'Đã cập nhật danh mục.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->products()->exists()) {
            return back()->withErrors(['category' => 'Không thể xóa danh mục đang có sản phẩm.']);
        }

        $category->delete();

        return back()->with('success', 'Đã xóa danh mục.');
    }
}

