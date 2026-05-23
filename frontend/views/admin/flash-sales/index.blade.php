@extends('layouts.admin')

@section('title', 'Flash Sale')

@section('content')
<div class="alert alert-info border-0 shadow-sm">
    Flash sale tự động đã được đồng bộ cho các ngày 1.1, 2.2, 3.3 ... 12.12 và Black Friday. Hệ thống tạo sẵn chiến dịch cho năm hiện tại và năm sau; admin vẫn có thể tạo hoặc tắt chiến dịch thủ công như bình thường.
    @if(($newAutoCampaigns ?? 0) > 0)
        <strong>Vừa tạo mới {{ $newAutoCampaigns }} chiến dịch.</strong>
    @endif
</div>

<div class="row g-4">
    <div class="col-lg-4">
        <div class="admin-card">
            <h2 class="h5 fw-bold mb-3">Tạo chiến dịch</h2>
            <form method="POST" action="{{ route('admin.flash-sales.store') }}" class="d-grid gap-3">
                @csrf
                <input class="form-control" name="name" placeholder="Tên chiến dịch" required>
                <input class="form-control" type="number" name="discount_percent" placeholder="% giảm" min="1" max="100" required>
                <input class="form-control" type="datetime-local" name="start_at" required>
                <input class="form-control" type="datetime-local" name="end_at" required>
                <select class="form-select" name="product_ids[]" multiple size="8">
                    @foreach($products as $product)
                        <option value="{{ $product->id }}">{{ $product->name }}</option>
                    @endforeach
                </select>
                <label class="form-check"><input class="form-check-input" type="checkbox" name="is_active" value="1" checked> <span class="form-check-label">Bật chiến dịch</span></label>
                <button class="btn btn-dark">Lưu flash sale</button>
            </form>
        </div>
    </div>
    <div class="col-lg-8">
        <div class="admin-card table-responsive">
            <table class="table align-middle mb-0">
                <thead><tr><th>Tên</th><th>Giảm</th><th>Thời gian</th><th>Sản phẩm</th><th>Trạng thái</th><th></th></tr></thead>
                <tbody>
                @foreach($flashSales as $flashSale)
                    <tr>
                        <td class="fw-semibold">{{ $flashSale->name }}</td>
                        <td>{{ $flashSale->discount_percent }}%</td>
                        <td>{{ $flashSale->start_at }} - {{ $flashSale->end_at }}</td>
                        <td>{{ $flashSale->products->count() }}</td>
                        <td><span class="admin-status-pill {{ $flashSale->is_active ? 'active' : 'muted' }}">{{ $flashSale->is_active ? 'active' : 'off' }}</span></td>
                        <td class="text-end"><form method="POST" action="{{ route('admin.flash-sales.destroy', $flashSale) }}">@csrf @method('DELETE')<button class="btn btn-sm btn-outline-danger">Tắt</button></form></td>
                    </tr>
                @endforeach
                </tbody>
            </table>
        </div>
        <div class="mt-3">{{ $flashSales->links() }}</div>
    </div>
</div>
@endsection
