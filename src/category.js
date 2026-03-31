document.addEventListener('DOMContentLoaded', function () {
    const categoryBtn = document.getElementById('category-btn');
    const categoryDropdown = document.getElementById('category-dropdown');
    
    if (categoryBtn && categoryDropdown) {
        // Handle category clicks
        const categoryLinks = categoryDropdown.querySelectorAll('a');
        categoryLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const category = this.getAttribute('data-category');
                
                // Redirect to recipe list page with category filter
                window.location.href = `/recetas/pages/recipe_list.html?category=${encodeURIComponent(category)}`;
            });
        });
    }
});
