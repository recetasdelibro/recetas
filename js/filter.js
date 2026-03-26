document.addEventListener('DOMContentLoaded', async () => {
    try {
        const params = new URLSearchParams(window.location.search);
        const searchTerm = params.get('search')?.toLowerCase() || "";

        // Get current page to determine which functionality to use
        const currentPage = window.location.pathname;
        const isRecipeListPage = currentPage.includes('recipe_list.html');
        const isRecipePage = currentPage.includes('recipe.html') && !isRecipeListPage;

        const response = await fetch('/recetas/assets/recipes.json');
        const recipes = await response.json();

        if (isRecipeListPage) {
            // RECIPE LIST PAGE - Fill recipe-grid with filtered results
            const recipeGrid = document.getElementById('recipe-grid');
            const messageBox = document.getElementById('no-results-message');

            // Filter recipes based on search term (minimum 3 letters)
            const filteredRecipes = recipes.filter(r => {
                // If search term has less than 3 letters, show all recipes
                if (searchTerm.length < 3) return true;

                const titleMatch = r.title.toLowerCase().includes(searchTerm);
                const ingredientMatch = r.ingredients.some(i =>
                    i.name.toLowerCase().includes(searchTerm)
                );
                return titleMatch || ingredientMatch;
            });

            // Display results
            if (filteredRecipes.length > 0) {
                messageBox.style.display = 'none';
                recipeGrid.innerHTML = filteredRecipes.map(recipe => `
                    <div class="recipe-card">
                        <input type="hidden" class="recipe-id" value="${recipe.id}">
                        <div class="recipe-card-content">
                            <h3 class="recipe-title"><a href="recipe.html?search=${recipe.id}">${recipe.title}</a></h3>
                        </div>
                        <img src="${recipe.image}" alt="${recipe.title}" class="recipe-card-image">
                    </div>
                `).join('');
            } else {
                recipeGrid.innerHTML = '';
                messageBox.textContent = searchTerm 
                    ? `No se encontraron recetas para "${searchTerm}"`
                    : 'No se encontraron recetas.';
                messageBox.style.display = 'block';
            }

        } else if (isRecipePage) {
            // INDIVIDUAL RECIPE PAGE - Original functionality
            const recipeContent = document.getElementById('recipe-content');
            const messageBox = document.getElementById('no-results-message');

            const recipe = recipes.find(r => {
                const titleMatch = r.title.toLowerCase().includes(searchTerm);
                const ingredientMatch = r.ingredients.some(i =>
                    i.name.toLowerCase().includes(searchTerm)
                );
                return titleMatch || (searchTerm && ingredientMatch);
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