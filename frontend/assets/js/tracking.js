(() => {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    const endpoint = '/track/product-click';

    function trackProductClick(link) {
        if (!csrfToken || !link?.dataset?.productId) return;

        const payload = new FormData();
        payload.append('_token', csrfToken);
        payload.append('product_id', link.dataset.productId);
        payload.append('source_url', window.location.href);
        payload.append('target_url', link.href);

        if (navigator.sendBeacon) {
            navigator.sendBeacon(endpoint, payload);
            return;
        }

        fetch(endpoint, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
                Accept: 'application/json',
            },
            body: payload,
            credentials: 'same-origin',
            keepalive: true,
        }).catch(() => {});
    }

    document.addEventListener('click', (event) => {
        const link = event.target.closest('[data-track-product-click]');
        if (link) trackProductClick(link);
    }, { capture: true });
})();
