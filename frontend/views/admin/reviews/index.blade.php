@extends('layouts.admin')

@section('title', 'Quản lý feedback')

@section('content')
<div class="admin-card table-responsive">
    <table class="table align-middle mb-0">
        <thead>
        <tr>
            <th>Khách hàng</th>
            <th>Sản phẩm</th>
            <th>Feedback</th>
            <th>Phản hồi của shop</th>
            <th>Hiển thị</th>
            <th></th>
        </tr>
        </thead>
        <tbody>
        @forelse($reviews as $review)
            <tr>
                <td>
                    <div class="fw-semibold">{{ $review->user->name ?? 'Khách hàng' }}</div>
                    <div class="small text-muted">{{ $review->created_at->format('d/m/Y H:i') }}</div>
                    <div class="small">Đơn: {{ $review->order->order_code ?? '#' }}</div>
                </td>
                <td>
                    <div class="fw-semibold">{{ $review->product->name ?? 'Sản phẩm' }}</div>
                    <div class="text-warning fw-bold">{{ str_repeat('★', (int) $review->rating) }}{{ str_repeat('☆', 5 - (int) $review->rating) }}</div>
                </td>
                <td style="min-width:260px">{{ $review->comment ?: 'Khách không nhập nội dung.' }}</td>
                <td style="min-width:320px">
                    @if($review->shop_reply)
                        <div class="border rounded-3 p-2 mb-2 bg-light">
                            {{ $review->shop_reply }}
                            <div class="small text-muted mt-1">
                                {{ $review->replier->name ?? 'Shop' }} · {{ optional($review->replied_at)->format('d/m/Y H:i') }}
                            </div>
                        </div>
                    @endif
                    <form method="POST" action="{{ route('admin.reviews.reply', $review) }}">
                        @csrf
                        @method('PATCH')
                        <textarea name="shop_reply" class="form-control mb-2" rows="3" placeholder="Nhập phản hồi của shop..." required>{{ old('shop_reply', $review->shop_reply) }}</textarea>
                        <label class="form-check mb-2">
                            <input class="form-check-input" type="checkbox" name="is_visible" value="1" @checked($review->is_visible)>
                            <span class="form-check-label">Hiển thị feedback cho người mua</span>
                        </label>
                        <button class="btn btn-sm btn-dark">Lưu phản hồi</button>
                    </form>
                </td>
                <td>
                    <span class="admin-status-pill {{ $review->is_visible ? 'active' : 'muted' }}">
                        {{ $review->is_visible ? 'Đang hiển thị' : 'Đã ẩn' }}
                    </span>
                </td>
                <td class="text-end">
                    <form method="POST" action="{{ route('admin.reviews.visibility', $review) }}">
                        @csrf
                        @method('PATCH')
                        <button class="btn btn-sm btn-outline-dark">{{ $review->is_visible ? 'Ẩn' : 'Hiện' }}</button>
                    </form>
                </td>
            </tr>
        @empty
            <tr><td colspan="6" class="text-center text-muted py-4">Chưa có feedback nào.</td></tr>
        @endforelse
        </tbody>
    </table>
</div>
<div class="mt-3">{{ $reviews->links() }}</div>
@endsection
