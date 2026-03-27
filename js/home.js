document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('assets/recipes.json');
        const recipes = await response.json();

        // Función para obtener N elementos aleatorios
        function getRandomRecipes(recipes, count) {
            const shuffled = [...recipes].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, Math.min(count, shuffled.length));
        }

        const randomRecipes = getRandomRecipes(recipes, 5);
        const recipeGrid = document.getElementById('featured-recipe-grid');
        const messageBox = document.getElementById('no-results-message');

        if (randomRecipes.length > 0) {
            messageBox.style.display = 'none';
            recipeGrid.innerHTML = randomRecipes.map(recipe => `
                <div class="recipe-card">
                    <input type="hidden" class="recipe-id" value="${recipe.id}">
                    <div class="recipe-card-content">
                        <h3 class="recipe-title"><a href="pages/recipe.html?search=${recipe.id}">${recipe.title}</a></h3>
                    </div>
                    <img src="${recipe.image}" alt="${recipe.title}" class="recipe-card-image">
                </div>
            `).join('');
        } else {
            messageBox.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading recipes:', error);
    }
});

