<?php

use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

// Webhook PayOS đặt ở api routes để không bị chặn CSRF.
Route::post('/payments/payos/webhook', [PaymentController::class, 'payosWebhook'])
    ->name('api.payments.payos.webhook');
