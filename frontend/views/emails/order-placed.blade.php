<div style="font-family:Arial,sans-serif;color:#111;line-height:1.6">
    <h2 style="margin:0 0 12px;color:#800020">Hóa đơn đặt hàng Luxe Store</h2>
    <p>Xin chào <strong>{{ $order->customer_name }}</strong>,</p>
    <p>Đơn hàng <strong>{{ $order->order_code }}</strong> đã được tạo thành công lúc {{ $order->placedAtLabel() }}.</p>

    <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;margin:16px 0">
        <thead>
            <tr style="background:#800020;color:#fff">
                <th align="left">Sản phẩm</th>
                <th align="center">SL</th>
                <th align="right">Đơn giá</th>
                <th align="right">Tạm tính</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
                <tr>
                    <td style="border-bottom:1px solid #eee">
                        <strong>{{ $item->product_name }}</strong>
                        @if($item->selected_size || $item->selected_color_name)
                            <br><small>
                                @if($item->selected_size) Size {{ $item->selected_size }} @endif
                                @if($item->selected_color_name) - Màu {{ $item->selected_color_name }} @endif
                            </small>
                        @endif
                    </td>
                    <td align="center" style="border-bottom:1px solid #eee">{{ $item->quantity }}</td>
                    <td align="right" style="border-bottom:1px solid #eee">{{ number_format($item->unit_price) }}đ</td>
                    <td align="right" style="border-bottom:1px solid #eee">{{ number_format($item->subtotal) }}đ</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table width="100%" cellpadding="6" cellspacing="0" style="max-width:420px;margin-left:auto">
        <tr><td>Tạm tính</td><td align="right"><strong>{{ number_format($order->subtotal) }}đ</strong></td></tr>
        <tr><td>Phí vận chuyển</td><td align="right"><strong>{{ number_format($order->shipping_fee) }}đ</strong></td></tr>
        @if((float) $order->product_discount > 0)
            <tr><td>Giảm sản phẩm {{ $order->product_coupon_code ? '('.$order->product_coupon_code.')' : '' }}</td><td align="right">-{{ number_format($order->product_discount) }}đ</td></tr>
        @endif
        @if((float) $order->shipping_discount > 0)
            <tr><td>Giảm phí ship {{ $order->shipping_coupon_code ? '('.$order->shipping_coupon_code.')' : '' }}</td><td align="right">-{{ number_format($order->shipping_discount) }}đ</td></tr>
        @endif
        <tr style="font-size:18px"><td><strong>Tổng thanh toán</strong></td><td align="right"><strong>{{ number_format($order->total) }}đ</strong></td></tr>
    </table>

    <p><strong>Người nhận:</strong> {{ $order->customer_name }} - {{ $order->customer_phone }}</p>
    <p><strong>Địa chỉ:</strong> {{ $order->customer_address }}</p>
    <p><strong>Vận chuyển:</strong> {{ $order->shippingMethodLabel() }}</p>
    <p><strong>Thanh toán:</strong> {{ $order->payment_method === 'payos' ? 'PayOS' : 'Thanh toán khi nhận hàng' }} - {{ $order->paymentStatusLabel() }}</p>
    <p>Trạng thái đơn hàng hiện tại: <strong>{{ $order->statusLabel() }}</strong>.</p>
</div>
