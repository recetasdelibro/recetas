// ../js/search.js
document.addEventListener('DOMContentLoaded', function () {
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function () {
            const query = searchInput.value;
            // Use absolute path from site root
            window.location.href = `/recetas/pages/recipe.html?id=1&q=${encodeURIComponent(query)}`;
        });
    }
});