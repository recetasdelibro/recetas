document.addEventListener('DOMContentLoaded', async () => {
    try {
        const params = new URLSearchParams(window.location.search);
        const searchTerm = params.get('search')?.toLowerCase() || "";

        // Get current page to determine which functionality to use
        const currentPage = window.location.pathname;
        const isReviewListPage = currentPage.includes('review_list.html');
        const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhemVhb2Fmbnp0eGlka2dkd3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NjEyOTEsImV4cCI6MjA5MjAzNzI5MX0.baG-JMojvCC7xEqRdUFcNSIt30lUOrNwvHqSYZM5nhk';        const isReviewPage = currentPage.includes('review.html') && !isReviewListPage;

        // Build different queries for list page vs individual review page
        let supabaseQuery;
        if (isReviewListPage) {
            // For list page, fetch all reviews (will be filtered client-side)
            supabaseQuery = `https://hazeaoafnztxidkgdwsn.supabase.co/rest/v1/reviews?select=*&apikey=${API_KEY}`;
        } else {
            // For individual review page, filter by ID
            supabaseQuery = `https://hazeaoafnztxidkgdwsn.supabase.co/rest/v1/reviews?id=eq.${searchTerm}&apikey=${API_KEY}`;
        }
        
        const response = await fetch(supabaseQuery);
        const reviews = await response.json();

        // Search filtering function
        const filterBySearch = (review, searchTerm) => {
            if (searchTerm.length < 3) return true;
            
            const titleMatch = review.title.toLowerCase().includes(searchTerm);
            const reviewMatch = review.review && review.review.some(line => 
                line.toLowerCase().includes(searchTerm)
            );
            return titleMatch || reviewMatch;
        };

        if (isReviewListPage) {
            // Update page title
            document.title = 'Reseñas';
            const categoryTitleElement = document.getElementById('category-title');
            if (categoryTitleElement) {
                categoryTitleElement.textContent = 'Reseñas';
            }

            // REVIEW LIST PAGE - Fill recipe-grid with filtered results
            const recipeGrid = document.getElementById('recipe-grid');
            const messageBox = document.getElementById('no-results-message');

            // Filter reviews using search function
            const filteredReviews = reviews.filter(r => {
                const searchMatch = filterBySearch(r, searchTerm);
                return searchMatch;
            });

            // Display results
            if (filteredReviews.length > 0) {
                messageBox.style.display = 'none';
                recipeGrid.innerHTML = filteredReviews.map(review => `
                    <a href="review.html?search=${review.id}" class="recipe-card" aria-label="Ver reseña de ${review.title}">
                        <input type="hidden" class="recipe-id" value="${review.id}">
                        <div class="recipe-card-content">
                            <h3 class="recipe-title">${review.title}</h3>
                        </div>
                        <img src="${review.image}" alt="${review.title}" class="recipe-card-image">
                    </a>
                `).join('');
            } else {
                recipeGrid.innerHTML = '';
                messageBox.textContent = searchTerm 
                    ? `No se encontraron reseñas con "${searchTerm}"`
                    : 'No se encontraron reseñas.';
                messageBox.style.display = 'block';
            }

        } else if (isReviewPage) {
            // INDIVIDUAL REVIEW PAGE
            const reviewContent = document.querySelector('article.recipe');
            const messageBox = document.getElementById('no-results-message');

            // Find review by ID (from search parameter)
            const reviewId = parseInt(searchTerm);
            const review = reviews.find(r => r.id === reviewId);

            if (review) {
                if (messageBox) messageBox.style.display = 'none';
                if (reviewContent) reviewContent.style.display = 'block';

                document.getElementById('recipe-title').textContent = review.title;
                document.getElementById('recipe-image').src = review.image;

                const reviewText = document.getElementById('review-text');
                if (review.review && Array.isArray(review.review)) {
                    reviewText.innerHTML = review.review.map(line => `<p>${line}</p>`).join('');
                } else {
                    reviewText.innerHTML = '<p>No hay contenido de reseña disponible.</p>';
                }
            } else {
                if (reviewContent) reviewContent.style.display = 'none';
                if (messageBox) {
                    messageBox.textContent = `No se encontró la reseña con ID "${reviewId}"`;
                    messageBox.style.display = 'block';
                }
            }
        }

    } catch (error) {
        console.error('Error loading reviews:', error);
    }
});
