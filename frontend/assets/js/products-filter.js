const minRange = document.getElementById('min-price-range');
const maxRange = document.getElementById('max-price-range');
const minValue = document.getElementById('min-price-value');
const maxValue = document.getElementById('max-price-value');
const minLabel = document.getElementById('min-price-label');
const maxLabel = document.getElementById('max-price-label');
const priceRangeFilter = document.querySelector('.price-range-filter');

function formatPrice(value) {
    return new Intl.NumberFormat('vi-VN').format(Number(value)) + 'đ';
}

function syncPriceRange(changedInput) {
    if (!minRange || !maxRange) return;

    let min = Number(minRange.value);
    let max = Number(maxRange.value);

    if (min > max) {
        if (changedInput === minRange) {
            max = min;
            maxRange.value = String(max);
        } else {
            min = max;
            minRange.value = String(min);
        }
    }

    minValue.value = String(min);
    maxValue.value = String(max);
    minLabel.textContent = formatPrice(min);
    maxLabel.textContent = formatPrice(max);

    const rangeMax = Number(maxRange.max || 1);
    priceRangeFilter?.style.setProperty('--range-start', `${(min / rangeMax) * 100}%`);
    priceRangeFilter?.style.setProperty('--range-end', `${(max / rangeMax) * 100}%`);
}

[minRange, maxRange].forEach((input) => {
    input?.addEventListener('input', () => syncPriceRange(input));
});

syncPriceRange();
