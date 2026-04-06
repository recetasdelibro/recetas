document.addEventListener('DOMContentLoaded', async () => {
    try {
        const params = new URLSearchParams(window.location.search);
        const searchTerm = params.get('search')?.toLowerCase() || "";
        const category = params.get('category')?.toLowerCase() || "";

        // Get current page to determine which functionality to use
        const currentPage = window.location.pathname;
        const isRecipeListPage = currentPage.includes('recipe_list.html');
        const isRecipePage = currentPage.includes('recipe.html') && !isRecipeListPage;

        const response = await fetch('/recetas/assets/recipes.json');
        const recipes = await response.json();

        // Category filtering function
        const filterByCategory = (recipe, category) => {
            if (!category) return true;
            
            if (category === 'entradas') {
                return recipe.tags && recipe.tags.some(tag => 
                    tag.toLowerCase() === 'entrada' || 
                    tag.toLowerCase() === 'pan' ||
                    tag.toLowerCase() === 'ensalada'
                );
            } else if (category === 'postres') {
                return recipe.tags && recipe.tags.some(tag => 
                    tag.toLowerCase() === 'postre'
                );
            } else if (category === 'principales') {
                return recipe.tags && recipe.tags.some(tag =>
                    tag.toLowerCase() === 'principal'
                );
            } else if (category === 'parrilla') {
                return recipe.tags && recipe.tags.some(tag =>
                    tag.toLowerCase() === 'parrilla'
                );
            }

            return true;
        };

        // Search filtering function
        const filterBySearch = (recipe, searchTerm) => {
            if (searchTerm.length < 3) return true;
            
            const titleMatch = recipe.title.toLowerCase().includes(searchTerm);
            const ingredientMatch = recipe.ingredients.some(i =>
                i.name.toLowerCase().includes(searchTerm)
            );
            return titleMatch || ingredientMatch;
        };

        if (isRecipeListPage) {
            // RECIPE LIST PAGE - Fill recipe-grid with filtered results
            const recipeGrid = document.getElementById('recipe-grid');
            const messageBox = document.getElementById('no-results-message');

            // Filter recipes using separated functions
            const filteredRecipes = recipes.filter(r => {
                const categoryMatch = filterByCategory(r, category);
                const searchMatch = filterBySearch(r, searchTerm);
                return categoryMatch && searchMatch;
            });

            // Display results
            if (filteredRecipes.length > 0) {
                messageBox.style.display = 'none';
                recipeGrid.innerHTML = filteredRecipes.map(recipe => `
                    <a href="recipe.html?search=${recipe.id}" class="recipe-card ${recipe.tags && recipe.tags.includes('parrilla') ? 'parrilla' : ''}" aria-label="Ver receta de ${recipe.title}">
                        <input type="hidden" class="recipe-id" value="${recipe.id}">
                        <div class="recipe-card-content">
                            <h3 class="recipe-title">${recipe.title}</h3>
                            ${recipe.flag ? `<img src="${recipe.flag}" alt="Flag" class="recipe-flag">` : ''}
                        </div>
                        <img src="${recipe.image}" alt="${recipe.title}" class="recipe-card-image">
                    </a>
                `).join('');
            } else {
                recipeGrid.innerHTML = '';
                messageBox.textContent = category || searchTerm 
                    ? `No se encontraron recetas${category ? ` para la categoría "${category}"` : ''}${searchTerm && category ? ' ' : ''}${searchTerm ? `con "${searchTerm}"` : ''}`
                    : 'No se encontraron recetas.';
                messageBox.style.display = 'block';
            }

        } else if (isRecipePage) {
            // INDIVIDUAL RECIPE PAGE - Original functionality
            const recipeContent = document.getElementById('recipe-content');
            const messageBox = document.getElementById('no-results-message');

            const recipe = recipes.find(r => {
                const categoryMatch = filterByCategory(r, category);
                const searchMatch = filterBySearch(r, searchTerm);
                return categoryMatch && searchMatch;
            });

            if (recipe) {
                if (messageBox) messageBox.style.display = 'none';
                if (recipeContent) recipeContent.style.display = 'block';

                document.getElementById('recipe-title').textContent = recipe.title;
                document.getElementById('recipe-image').src = recipe.image;

                const ingredientsList = document.getElementById('ingredients-list');
                ingredientsList.innerHTML = recipe.ingredients.map(i => {
                    const qty = i.quantity ? `${i.quantity} ` : '';
                    const unit = i.unit ? `${i.unit} ` : '';
                    const notes = i.notes ? ` (${i.notes})` : '';
                    return `<li>${qty}${unit}${i.name}${notes}</li>`;
                }).join('');

                const procedureList = document.getElementById('procedure-list');
                procedureList.innerHTML = recipe.procedure
                    .map(step => `<li>${step}</li>`)
                    .join('');
            } else {
                if (recipeContent) recipeContent.style.display = 'none';
                if (messageBox) {
                    messageBox.textContent = `No se encontraron recetas para "${searchTerm}"`;
                    messageBox.style.display = 'block';
                }
            }
        }

    } catch (error) {
        console.error('Error loading recipes:', error);
    }
});
