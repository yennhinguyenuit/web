const applyCouponButton = document.getElementById('apply-coupon-btn');
const couponInput = document.getElementById('coupon-code');
const couponMessage = document.getElementById('coupon-message');
const checkoutProductDiscount = document.getElementById('checkout-product-discount');
const checkoutShippingDiscount = document.getElementById('checkout-shipping-discount');
const checkoutDiscount = document.getElementById('checkout-discount');
const checkoutTotal = document.getElementById('checkout-total');
const checkoutProductCouponCode = document.getElementById('checkout-product-coupon-code');
const checkoutShippingCouponCode = document.getElementById('checkout-shipping-coupon-code');
const checkoutSubtotal = document.getElementById('checkout-subtotal');
const checkoutShippingFee = document.getElementById('checkout-shipping-fee');
const couponAppliedList = document.getElementById('coupon-applied-list');
const productCouponLabel = document.getElementById('product-coupon-label');
const shippingCouponLabel = document.getElementById('shipping-coupon-label');
const shippingMethodInputs = document.querySelectorAll('input[name="shipping_method"]');
const checkoutCsrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
let currentProductDiscount = 0;
let currentShippingDiscount = 0;

if ((applyCouponButton || couponInput) && !checkoutCsrfToken) {
    console.error('Checkout CSRF token is missing.');
}

function money(value) {
    return new Intl.NumberFormat('vi-VN').format(Number(value || 0)) + 'đ';
}

function selectedShippingMethod() {
    return document.querySelector('input[name="shipping_method"]:checked')?.value || 'standard';
}

function selectedShippingFee() {
    const selected = document.querySelector('input[name="shipping_method"]:checked');
    return Number(selected?.dataset.fee || 0);
}

function totalDiscount() {
    return currentProductDiscount + currentShippingDiscount;
}

function updateAppliedCoupons(productCoupon, shippingCoupon) {
    if (productCouponLabel) {
        productCouponLabel.hidden = !productCoupon;
        productCouponLabel.textContent = productCoupon ? `Sản phẩm: ${productCoupon.code}` : '';
    }

    if (shippingCouponLabel) {
        shippingCouponLabel.hidden = !shippingCoupon;
        shippingCouponLabel.textContent = shippingCoupon ? `Freeship: ${shippingCoupon.code}` : '';
    }

    if (couponAppliedList) {
        couponAppliedList.hidden = !productCoupon && !shippingCoupon;
    }
}

function updateCheckoutTotal(serverTotal = null) {
    const subtotal = Number(checkoutSubtotal?.dataset.value || 0);
    const shippingFee = selectedShippingFee();

    if (checkoutShippingFee) {
        checkoutShippingFee.dataset.value = String(shippingFee);
        checkoutShippingFee.textContent = money(shippingFee);
    }

    if (checkoutProductDiscount) {
        checkoutProductDiscount.textContent = money(currentProductDiscount);
    }

    if (checkoutShippingDiscount) {
        checkoutShippingDiscount.textContent = money(currentShippingDiscount);
    }

    if (checkoutDiscount) {
        checkoutDiscount.textContent = money(totalDiscount());
    }

    if (checkoutTotal) {
        const total = serverTotal ?? Math.max(subtotal + shippingFee - totalDiscount(), 0);
        checkoutTotal.textContent = money(total);
    }
}

async function applyCoupon(code = null, silent = false) {
    if (!couponMessage || !checkoutTotal) {
        return;
    }

    const typedCode = code ?? couponInput?.value ?? '';
    const hasAppliedCoupon = checkoutProductCouponCode?.value || checkoutShippingCouponCode?.value;

    if (!typedCode.trim() && !hasAppliedCoupon) {
        couponMessage.className = 'small mt-2 text-danger';
        couponMessage.textContent = 'Vui lòng nhập hoặc chọn mã giảm giá.';
        return;
    }

    if (!silent) {
        couponMessage.textContent = '';
    }

    if (!checkoutCsrfToken) {
        console.error('Checkout CSRF token is missing.');
        couponMessage.className = 'small mt-2 text-danger';
        couponMessage.textContent = 'Thiếu CSRF token. Vui lòng tải lại trang rồi thử lại.';
        return;
    }

    const response = await fetch('/checkout/apply-coupon', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': checkoutCsrfToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
            coupon_code: typedCode,
            product_coupon_code: checkoutProductCouponCode?.value || null,
            shipping_coupon_code: checkoutShippingCouponCode?.value || null,
            shipping_method: selectedShippingMethod(),
        }),
    });
    const payload = await response.json();
    if (!response.ok) {
        couponMessage.className = 'small mt-2 text-danger';
        couponMessage.textContent = payload.message || Object.values(payload.errors || {}).flat().join(' ');
        return;
    }

    currentProductDiscount = Number(payload.product_discount || 0);
    currentShippingDiscount = Number(payload.shipping_discount || 0);

    if (checkoutProductCouponCode) {
        checkoutProductCouponCode.value = payload.product_coupon?.code || '';
    }

    if (checkoutShippingCouponCode) {
        checkoutShippingCouponCode.value = payload.shipping_coupon?.code || '';
    }

    if (typeof payload.shipping_fee !== 'undefined' && checkoutShippingFee) {
        checkoutShippingFee.dataset.value = String(payload.shipping_fee);
        checkoutShippingFee.textContent = money(Number(payload.shipping_fee));
    }

    updateAppliedCoupons(payload.product_coupon, payload.shipping_coupon);
    updateCheckoutTotal(payload.total);

    couponMessage.className = 'small mt-2 text-success';
    couponMessage.textContent = payload.message;

    if (couponInput) {
        couponInput.value = '';
    }
}

shippingMethodInputs.forEach((input) => {
    input.addEventListener('change', () => {
        if (checkoutProductCouponCode?.value || checkoutShippingCouponCode?.value) {
            applyCoupon(null, true);
            return;
        }

        updateCheckoutTotal();
    });
});

applyCouponButton?.addEventListener('click', () => applyCoupon());

document.querySelectorAll('.coupon-suggestion').forEach((button) => {
    button.addEventListener('click', () => {
        const code = button.dataset.code || '';
        if (couponInput) {
            couponInput.value = code;
        }
        applyCoupon(code);
    });
});

updateCheckoutTotal();
