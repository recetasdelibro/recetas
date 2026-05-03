document.addEventListener('DOMContentLoaded', async () => {
    try {
        const params = new URLSearchParams(window.location.search);
        const recipeId = parseInt(params.get('search')) || null;
        const userId = getOrCreateUserId();

        // Elements
        const recipeContent = document.getElementById('recipe-content');
        const messageBox = document.getElementById('no-results-message');

        const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhemVhb2Fmbnp0eGlka2dkd3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NjEyOTEsImV4cCI6MjA5MjAzNzI5MX0.baG-JMojvCC7xEqRdUFcNSIt30lUOrNwvHqSYZM5nhk';
        
        // Fetch recipe
        const response = await fetch(`https://hazeaoafnztxidkgdwsn.supabase.co/rest/v1/recetas?id=eq.${recipeId}&select=*,books(name)&apikey=${API_KEY}`);
        const recipes = await response.json();
        const recipe = recipes.find(r => r.id === recipeId);
        
        // Find recipe by id
        if (recipe) {
            // Hide "No results" and show content
            if (messageBox) messageBox.style.display = 'none';
            if (recipeContent) recipeContent.style.display = 'block';

            document.getElementById('recipe-title').textContent = recipe.title;
            document.getElementById('recipe-image').src = recipe.image;

            // Display servings if it exists
            const servingsElement = document.getElementById('recipe-servings');
            if (recipe.servings) {
                servingsElement.innerHTML = `<em>Porciones: ${recipe.servings}</em>`;
            } else {
                servingsElement.style.display = 'none';
            }

            const ingredientsList = document.getElementById('ingredients-list');
            ingredientsList.innerHTML = recipe.ingredients.map(i => {
                const qty = i.quantity ? `${i.quantity} ` : '';
                const unit = i.unit ? `${i.unit} ` : '';
                const notes = i.notes ? ` (${i.notes})` : '';
                
                // Check if ingredient has id_recipe property and create link if it does
                let ingredientName = i.name;
                if (i.id_recipe) {
                    ingredientName = `<a href="recipe.html?search=${i.id_recipe}" class="ingredient-link">${i.name}</a>`;
                }
                
                return `<li>${qty}${unit}${ingredientName}${notes}</li>`;
            }).join('');

            const procedureList = document.getElementById('procedure-list');
            procedureList.innerHTML = recipe.procedure
                .map(step => `<li>${step}</li>`)
                .join('');
            
            // Add book information before footer if it exists
            if (recipe.books && recipe.books.name) {
                const bookElement = document.createElement('div');
                bookElement.innerHTML = `<p><em>Fuente: ${recipe.books.name}</em></p>`;
                bookElement.className = 'recipe-source-container';
                
                // Insert before the footer
                const footer = document.querySelector('footer');
                if (footer) {
                    footer.parentNode.insertBefore(bookElement, footer);
                }
            }

            // Fetch likes count from likes table
            const likesResponse = await fetch(`https://hazeaoafnztxidkgdwsn.supabase.co/rest/v1/likes?id_recipe=eq.${recipeId}&select=count&apikey=${API_KEY}`);
            const likesData = await likesResponse.json();
            console.log('Likes data for recipe', recipeId, ':', likesData);
            let likesCount = likesData.length > 0 ? (likesData[0].count || 0) : 0;
            
            const likeCountElement = document.getElementById('like-count');
            likeCountElement.textContent = likesCount;

            // Check if user has already liked
            const likeCheckResponse = await fetch(
                `https://hazeaoafnztxidkgdwsn.supabase.co/rest/v1/recipe_likes?recipe_id=eq.${recipeId}&user_identifier=eq.${userId}&select=id&apikey=${API_KEY}`
            );
            const existingLikes = await likeCheckResponse.json();
            const hasLiked = existingLikes.length > 0;

            const heartIcon = document.getElementById('heart-icon');
            if (hasLiked) {
                heartIcon.classList.add('liked');
            }

            // Handle like button click
            const likeBtn = document.getElementById('like-btn');
            if (likeBtn && heartIcon) {
                likeBtn.addEventListener('click', async () => {
                    // Check current like status before each click
                    const likeCheckResponse = await fetch(
                        `https://hazeaoafnztxidkgdwsn.supabase.co/rest/v1/recipe_likes?recipe_id=eq.${recipeId}&user_identifier=eq.${userId}&select=id&apikey=${API_KEY}`
                    );
                    const existingLikes = await likeCheckResponse.json();
                    const currentlyLiked = existingLikes.length > 0;

                    if (currentlyLiked) {
                        // Unlike - delete from recipe_likes and decrement count
                        await fetch(
                            `https://hazeaoafnztxidkgdwsn.supabase.co/rest/v1/recipe_likes?recipe_id=eq.${recipeId}&user_identifier=eq.${userId}&apikey=${API_KEY}`,
                            { method: 'DELETE' }
                        );
                        
                        // Decrement likes count in likes table
                        likesCount = Math.max(0, likesCount - 1);
                        await fetch(
                            `https://hazeaoafnztxidkgdwsn.supabase.co/rest/v1/likes?id_recipe=eq.${recipeId}&apikey=${API_KEY}`,
                            {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ count: likesCount })
                            }
                        );
                        
                        heartIcon.classList.remove('liked');
                        likeCountElement.textContent = likesCount;
                    } else {
                        // Like - insert into recipe_likes and increment count
                        await fetch(
                            `https://hazeaoafnztxidkgdwsn.supabase.co/rest/v1/recipe_likes?apikey=${API_KEY}`,
                            {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    recipe_id: recipeId,
                                    user_identifier: userId
                                })
                            }
                        );
                        
                        // Increment likes count in likes table
                        likesCount = likesCount + 1;
                        await fetch(
                            `https://hazeaoafnztxidkgdwsn.supabase.co/rest/v1/likes?id_recipe=eq.${recipeId}&apikey=${API_KEY}`,
                            {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ count: likesCount })
                            }
                        );
                        
                        heartIcon.classList.add('liked');
                        likeCountElement.textContent = likesCount;
                    }
                });
            }
        } else {
            // Handle "Nothing found"
            if (recipeContent) recipeContent.style.display = 'none';
            if (messageBox) {
                messageBox.textContent = recipeId 
                    ? `No se encontró la receta solicitada.`
                    : 'No se especificó una receta.';
                messageBox.style.display = 'block';
            }
        }

    } catch (error) {
        console.error('Error loading recipe:', error);
    }
});

