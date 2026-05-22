@extends('layouts.frontend')

@section('title', $title)

@section('content')
<section class="luxe-static-hero">
    <div class="luxe-container">
        <p class="luxe-eyebrow">{{ $title }}</p>
        <h1 class="luxe-section-title text-white">{{ $heading }}</h1>
        <p class="luxe-section-desc text-white-50">{{ $body }}</p>
    </div>
</section>
<section class="luxe-section luxe-section-soft">
    <div class="luxe-container">
        <div class="admin-card">
            <h2 class="h4 fw-bold mb-3">{{ $heading }}</h2>
            <p class="text-muted mb-0">{{ $body }}</p>
        </div>
    </div>
</section>
@endsection
