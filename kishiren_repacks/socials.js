// Get all clickable images
const clickableImages = document.querySelectorAll('.clickable-image');
// Add click event listeners
clickableImages.forEach(image => {
        image.addEventListener('click', () => {
        const url = image.getAttribute('data-url'); // Get URL from data attribute
        window.location.href = url; // Redirect to the URL
    });
});

