document.querySelectorAll('[data-hero-slideshow]').forEach((hero) => {
    const slides = Array.from(hero.querySelectorAll('.luxe-hero-slide'));
    const interval = Number(hero.dataset.heroInterval || 5000);

    if (slides.length <= 1) return;

    let currentIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
    if (currentIndex < 0) currentIndex = 0;

    window.setInterval(() => {
        const nextIndex = (currentIndex + 1) % slides.length;

        slides[currentIndex].classList.remove('is-active');
        slides[nextIndex].classList.add('is-active');
        currentIndex = nextIndex;
    }, Math.max(interval, 1500));
});
