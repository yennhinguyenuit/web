<?php

namespace App\Http\Middleware;

use App\Models\ActivityLog;
use App\Support\TrafficTelemetry;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class TrackPageVisit
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($this->shouldTrack($request, $response)) {
            try {
                ActivityLog::create([
                    'user_id' => $request->user()?->id,
                    'action' => 'page_view',
                    'ip_address' => $request->ip(),
                    'data' => [
                        ...TrafficTelemetry::requestData($request),
                        'url' => $request->fullUrl(),
                        'path' => '/'.ltrim($request->path(), '/'),
                        'route' => $request->route()?->getName(),
                        'referer' => $request->headers->get('referer'),
                    ],
                ]);
            } catch (Throwable $exception) {
                report($exception);
            }
        }

        return $response;
    }

    private function shouldTrack(Request $request, Response $response): bool
    {
        if (! $request->isMethod('GET') || $response->getStatusCode() >= 400) {
            return false;
        }

        if ($request->expectsJson() || $request->ajax()) {
            return false;
        }

        return ! $request->is(
            'admin',
            'admin/*',
            'api/*',
            'assets/*',
            'storage/*',
            'track/*',
            'favicon.ico',
            'up'
        );
    }
}
