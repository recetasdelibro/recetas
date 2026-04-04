document.addEventListener('DOMContentLoaded', async () => {
    try {
        const params = new URLSearchParams(window.location.search);
        const recipeId = parseInt(params.get('search')) || null;

        // Elements
        const recipeContent = document.getElementById('recipe-content');
        const messageBox = document.getElementById('no-results-message');

        const response = await fetch('/recetas/assets/recipes.json');
        const recipes = await response.json();

        // Find recipe by id
        const recipe = recipes.find(r => r.id === recipeId);
        
        // Conditional Rendering
        if (recipe) {
            // Hide "No results" and show content
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
            
            // Add libro information before footer if it exists
            if (recipe.libro) {
                const libroElement = document.createElement('div');
                libroElement.innerHTML = `<p><em>Fuente: ${recipe.libro}</em></p>`;
                libroElement.className = 'recipe-source-container';
                
                // Insert before the footer
                const footer = document.querySelector('footer');
                if (footer) {
                    footer.parentNode.insertBefore(libroElement, footer);
                }
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

