@extends('layouts.admin')

@section('title', 'Danh mục')

@section('content')
<div class="row g-4">
    <div class="col-lg-4">
        <div class="admin-card">
            <h2 class="h5 fw-bold mb-3">Thêm danh mục</h2>
            <form method="POST" action="{{ route('admin.categories.store') }}" class="d-grid gap-3">
                @csrf
                <input class="form-control" name="name" placeholder="Tên danh mục" required>
                <input class="form-control" name="slug" placeholder="Slug">
                <textarea class="form-control" name="description" placeholder="Mô tả"></textarea>
                <button class="btn btn-dark">Lưu</button>
            </form>
        </div>
    </div>
    <div class="col-lg-8">
        <div class="admin-card table-responsive">
            <table class="table align-middle mb-0">
                <thead><tr><th>Tên</th><th>Slug</th><th>Sản phẩm</th><th></th></tr></thead>
                <tbody>
                @foreach($categories as $category)
                    <tr>
                        <td class="fw-semibold">{{ $category->name }}</td>
                        <td>{{ $category->slug }}</td>
                        <td>{{ $category->products_count }}</td>
                        <td class="text-end">
                            <form method="POST" action="{{ route('admin.categories.destroy', $category) }}" class="d-inline">@csrf @method('DELETE')<button class="btn btn-sm btn-outline-danger">Xóa</button></form>
                        </td>
                    </tr>
                @endforeach
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
