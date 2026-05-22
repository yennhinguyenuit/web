@extends('layouts.admin')

@section('title', 'Chat người bán')

@section('content')
<div class="row g-4">
    <div class="col-lg-4">
        <div class="admin-card p-0 overflow-hidden">
            <div id="admin-chat-customers" class="list-group list-group-flush">
                @forelse($customers as $customer)
                    <button type="button" class="list-group-item list-group-item-action admin-chat-customer" data-customer-id="{{ $customer->id }}">
                        <strong>{{ $customer->name }}</strong>
                        <div class="small text-muted">{{ $customer->email }}</div>
                    </button>
                @empty
                    <div class="p-4 text-muted">Chưa có hội thoại.</div>
                @endforelse
            </div>
        </div>
    </div>
    <div class="col-lg-8">
        <div class="admin-card">
            <div class="d-flex justify-content-between align-items-start mb-3">
                <div><h2 id="admin-chat-title" class="h5 mb-1">Chưa chọn khách hàng</h2><div id="admin-chat-subtitle" class="text-muted small">Tin nhắn sẽ hiển thị tại đây.</div></div>
                <span class="luxe-badge luxe-badge-dark">Live chat</span>
            </div>
            <div id="admin-chat-log" class="seller-chat-log" style="height:430px"></div>
            <form id="admin-chat-form" class="seller-chat-form">
                <input id="admin-chat-message" class="luxe-input" placeholder="Nhập phản hồi cho khách hàng..." disabled>
                <button id="admin-chat-submit" class="luxe-btn" disabled>Gửi</button>
            </form>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="{{ asset('assets/js/admin-chats.js') }}"></script>
@endpush
