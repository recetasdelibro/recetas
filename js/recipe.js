document.addEventListener('DOMContentLoaded', async () => {
    try {
        const params = new URLSearchParams(window.location.search);
        const recipeId = parseInt(params.get('search')) || null;

        // Elements
        const recipeContent = document.getElementById('recipe-content');
        const messageBox = document.getElementById('no-results-message');

        const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhemVhb2Fmbnp0eGlka2dkd3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NjEyOTEsImV4cCI6MjA5MjAzNzI5MX0.baG-JMojvCC7xEqRdUFcNSIt30lUOrNwvHqSYZM5nhk';
        const response = await fetch(`https://hazeaoafnztxidkgdwsn.supabase.co/rest/v1/recetas?id=eq.${recipeId}&apikey=${API_KEY}`);
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
                return `<li>${qty}${unit}${i.name}${notes}</li>`;
            }).join('');

            const procedureList = document.getElementById('procedure-list');
            procedureList.innerHTML = recipe.procedure
                .map(step => `<li>${step}</li>`)
                .join('');
            
            // Add book information before footer if it exists
            if (recipe.book) {
                const bookElement = document.createElement('div');
                bookElement.innerHTML = `<p><em>Fuente: ${recipe.book}</em></p>`;
                bookElement.className = 'recipe-source-container';
                
                // Insert before the footer
                const footer = document.querySelector('footer');
                if (footer) {
                    footer.parentNode.insertBefore(bookElement, footer);
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

