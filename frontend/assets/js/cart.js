document.querySelectorAll('.cart-quantity-form').forEach((form) => {
    const input = form.querySelector('input[name="quantity"]');

    form.querySelectorAll('[data-cart-delta]').forEach((button) => {
        button.addEventListener('click', () => {
            const delta = Number(button.dataset.cartDelta || 0);
            const min = Number(input.min || 1);
            const max = Number(input.max || 9999);
            const next = Math.min(max, Math.max(min, Number(input.value || min) + delta));

            if (next !== Number(input.value)) {
                input.value = String(next);
                form.submit();
            }
        });
    });
});
