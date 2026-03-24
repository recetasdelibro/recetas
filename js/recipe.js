document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get query param (e.g., recipe.html?id=1)
        const params = new URLSearchParams(window.location.search);
        const recipeId = params.get('id');

        // Fetch JSON
        const response = await fetch('/recetas/assets/recipes.json');
        const recipes = await response.json();

        // Find recipe by id
        const recipe = recipes.find(r => r.id == recipeId) || recipes[0];

        // Inject data into HTML
        document.getElementById('recipe-title').textContent = recipe.title;
        document.getElementById('recipe-image').src = recipe.image;

        // Ingredients
        const ingredientsList = document.getElementById('ingredients-list');
        ingredientsList.innerHTML = recipe.ingredients.map(i => {
            const qty = i.quantity ? `${i.quantity} ` : '';
            const unit = i.unit ? `${i.unit} ` : '';
            const notes = i.notes ? ` (${i.notes})` : '';
            return `<li>${qty}${unit}${i.name}${notes}</li>`;
        }).join('');

        // Procedure
        const procedureList = document.getElementById('procedure-list');
        procedureList.innerHTML = recipe.procedure
            .map(step => `<li>${step}</li>`)
            .join('');

    } catch (error) {
        console.error('Error loading recipe:', error);
    }
});