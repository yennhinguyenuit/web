<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TrafficTelemetry
{
    public static function deviceType(?string $userAgent): string
    {
        $agent = Str::lower($userAgent ?? '');

        if ($agent === '') {
            return 'unknown';
        }

        if (str_contains($agent, 'ipad') || str_contains($agent, 'tablet')) {
            return 'tablet';
        }

        if (
            str_contains($agent, 'mobi')
            || str_contains($agent, 'iphone')
            || str_contains($agent, 'android')
            || str_contains($agent, 'phone')
        ) {
            return 'mobile';
        }

        return 'desktop';
    }

    public static function deviceLabel(?string $deviceType): string
    {
        return match ($deviceType) {
            'mobile' => 'Điện thoại',
            'tablet' => 'Tablet',
            'desktop' => 'Laptop/PC',
            default => 'Không rõ',
        };
    }

    public static function requestData(Request $request): array
    {
        $userAgent = $request->userAgent() ?? '';

        return [
            'device_type' => self::deviceType($userAgent),
            'user_agent' => Str::limit($userAgent, 500, ''),
            'session_id' => $request->hasSession() ? $request->session()->getId() : null,
        ];
    }
}
