function previewProductImage(file, preview) {
    if (!file || !preview) return;

    const reader = new FileReader();
    reader.onload = () => {
        preview.src = String(reader.result);
    };
    reader.readAsDataURL(file);
}

function setProductDropzoneFile(input, file) {
    if (!input || !file) return;

    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
}

function initProductUpload(scope = document) {
    scope.querySelectorAll('.product-upload-dropzone').forEach((dropzone) => {
        const input = dropzone.querySelector('[data-product-image-file]');
        const preview = dropzone.querySelector('[data-product-image-preview]');
        const urlInput = dropzone.closest('form')?.querySelector('[data-image-url-input]');

        input?.addEventListener('change', () => {
            previewProductImage(input.files?.[0], preview);
        });

        urlInput?.addEventListener('input', () => {
            if (!input?.files?.length && urlInput.value.trim()) {
                preview.src = urlInput.value.trim();
            }
        });

        ['dragenter', 'dragover'].forEach((eventName) => {
            dropzone.addEventListener(eventName, (event) => {
                event.preventDefault();
                dropzone.classList.add('is-dragging');
            });
        });

        ['dragleave', 'drop'].forEach((eventName) => {
            dropzone.addEventListener(eventName, () => {
                dropzone.classList.remove('is-dragging');
            });
        });

        dropzone.addEventListener('drop', (event) => {
            event.preventDefault();
            const file = event.dataTransfer?.files?.[0];
            if (file) {
                setProductDropzoneFile(input, file);
            }
        });
    });
}

window.initProductUpload = initProductUpload;
window.previewProductImage = previewProductImage;

initProductUpload();
