<div style="font-family:Arial,sans-serif;color:#111;line-height:1.6">
    <h2 style="margin:0 0 12px;color:#800020">Cập nhật đơn hàng Luxe Store</h2>
    <p>Xin chào <strong>{{ $order->customer_name }}</strong>,</p>
    <p>Đơn hàng <strong>{{ $order->order_code }}</strong> vừa được cập nhật.</p>

    <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;margin:16px 0;width:100%;max-width:520px">
        <tr>
            <td style="border-bottom:1px solid #eee">Trạng thái đơn hàng</td>
            <td align="right" style="border-bottom:1px solid #eee"><strong>{{ $order->statusLabel() }}</strong></td>
        </tr>
        <tr>
            <td style="border-bottom:1px solid #eee">Trạng thái thanh toán</td>
            <td align="right" style="border-bottom:1px solid #eee"><strong>{{ $order->paymentStatusLabel() }}</strong></td>
        </tr>
        <tr>
            <td style="border-bottom:1px solid #eee">Tổng thanh toán</td>
            <td align="right" style="border-bottom:1px solid #eee"><strong>{{ number_format($order->total) }}đ</strong></td>
        </tr>
    </table>

    <p>Shop sẽ tiếp tục xử lý đơn theo trạng thái mới. Bạn có thể đăng nhập Luxe Store để xem chi tiết đơn hàng và phản hồi sau khi đơn hoàn tất.</p>
</div>
