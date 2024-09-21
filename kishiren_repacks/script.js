function searchRepack() {
    // Get the search input value
    const input = document.getElementById('searchInput').value.toLowerCase();

    // Get all posts
    const posts = document.querySelectorAll('.post');

    // Loop through each post
    posts.forEach(post => {
        // If the post contains the search term, display it; otherwise, hide it
        if (post.textContent.toLowerCase().includes(input)) {
            post.style.display = 'block';
        } else {
            post.style.display = 'none';
        }
    });
}

// Event listener for "Enter" key
document.getElementById('searchInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        searchRepack();
    }
});
