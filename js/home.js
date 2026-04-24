document.addEventListener('DOMContentLoaded', async () => {
    try {
        const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhemVhb2Fmbnp0eGlka2dkd3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NjEyOTEsImV4cCI6MjA5MjAzNzI5MX0.baG-JMojvCC7xEqRdUFcNSIt30lUOrNwvHqSYZM5nhk';
        
        // Fetch only 8 recipes with essential fields to minimize data transfer
        const response = await fetch('https://hazeaoafnztxidkgdwsn.supabase.co/rest/v1/recetas?select=id,title,image,flag,tags&limit=8&apikey=' + API_KEY);
        const recipes = await response.json();
        
        // Get 8 random recipes from the limited set
        function getRandomRecipes(recipes, count) {
            const shuffled = [...recipes].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, Math.min(count, shuffled.length));
        }

        const randomRecipes = getRandomRecipes(recipes, 8);
        const recipeGrid = document.getElementById('featured-recipe-grid');
        const messageBox = document.getElementById('no-results-message');

        if (randomRecipes.length > 0) {
            messageBox.style.display = 'none';
            recipeGrid.innerHTML = randomRecipes.map(recipe => `
                <a href="pages/recipe.html?search=${recipe.id}" class="recipe-card ${recipe.tags && recipe.tags.includes('parrilla') ? 'parrilla' : ''}" aria-label="Ver receta de ${recipe.title}">
                    <input type="hidden" class="recipe-id" value="${recipe.id}">
                    <div class="recipe-card-content">
                        <h3 class="recipe-title">${recipe.title}</h3>
                        ${recipe.flag ? `<img src="${recipe.flag}" alt="Flag" class="recipe-flag">` : ''}
                    </div>
                    <img src="${recipe.image}" alt="${recipe.title}" class="recipe-card-image" loading="lazy">
                </a>
            `).join('');
        } else {
            messageBox.style.display = 'block';
        }

        // Modal functionality
        const filtrosBtn = document.getElementById('filtros-btn');
        const modal = document.getElementById('filtros-modal');
        const closeBtn = document.querySelector('.close-btn');
        const filtrarBtn = document.getElementById('filtrar-btn');
        const countriesContainer = document.getElementById('countries-container');

        // Dynamically generate country checkboxes
        const countriesResponse = await fetch('https://hazeaoafnztxidkgdwsn.supabase.co/rest/v1/countries?select=id,name&apikey=' + API_KEY);
        const countries = await countriesResponse.json();

        if (!countries || countries.length === 0) {
            return;
        }

        countries.forEach(country => {
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'country-checkbox';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `country-${country.name.toLowerCase()}`;
        checkbox.value = country.name;
        checkbox.name = 'country';

        const label = document.createElement('label');
        label.htmlFor = `country-${country.name.toLowerCase()}`;
        label.textContent = country.name;

        checkboxDiv.appendChild(checkbox);
        checkboxDiv.appendChild(label);
        countriesContainer.appendChild(checkboxDiv);
    });

    // Open modal
    filtrosBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Close modal with X button
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal with filtrar button and navigate to recipe_list
    filtrarBtn.addEventListener('click', () => {
        const checkedCountries = Array.from(document.querySelectorAll('input[name="country"]:checked'))
            .map(checkbox => checkbox.value);

        if (checkedCountries.length > 0) {
            const countriesParam = checkedCountries.join(',');
            window.location.href = `pages/recipe_list.html?countries=${encodeURIComponent(countriesParam)}`;
        } else {
            modal.style.display = 'none';
        }
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    } catch (error) {
        console.error('Error loading recipes:', error);
    }
});

