document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize Supabase client
        const { createClient } = window.supabase;
        const supabaseClient = createClient(
            'https://hazeaoafnztxidkgdwsn.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhemVhb2Fmbnp0eGlka2dkd3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NjEyOTEsImV4cCI6MjA5MjAzNzI5MX0.baG-JMojvCC7xEqRdUFcNSIt30lUOrNwvHqSYZM5nhk'
        );

        const params = new URLSearchParams(window.location.search);
        const searchTerm = params.get('search')?.toLowerCase() || "";
        const category = params.get('category')?.toLowerCase() || "";
        const countriesParam = params.get('countries') || "";
        const selectedCountries = countriesParam ? countriesParam.split(',').map(id => parseInt(id)) : [];
        const booksParam = params.get('books') || "";
        const selectedBooks = booksParam ? booksParam.split(',').map(id => parseInt(id)) : [];

        // Get current page to determine which functionality to use
        const currentPage = window.location.pathname;
        const isRecipeListPage = currentPage.includes('recipe_list.html');
        const isRecipePage = currentPage.includes('recipe.html') && !isRecipeListPage;

        const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhemVhb2Fmbnp0eGlka2dkd3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NjEyOTEsImV4cCI6MjA5MjAzNzI5MX0.baG-JMojvCC7xEqRdUFcNSIt30lUOrNwvHqSYZM5nhk';
        
        let recipes;
        
        if (searchTerm && searchTerm.length >= 3) {
            // Use Supabase RPC fuzzy search for text search
            const { data, error } = await supabaseClient.rpc('buscar_recetas_fuzzy', { 
                search_term: searchTerm 
            });
            
            if (error) {
                console.error('Error en búsqueda fuzzy:', error);
                recipes = [];
            } else {
                recipes = data || [];
            }
        } else {
            // Regular fetch for no search or short search terms
            const response = await fetch(`https://hazeaoafnztxidkgdwsn.supabase.co/rest/v1/recetas?select=*&apikey=${API_KEY}`);
            recipes = await response.json();
        }

        // Fetch likes for all recipes
        const likesResponse = await fetch(`https://hazeaoafnztxidkgdwsn.supabase.co/rest/v1/likes?select=id_recipe,count&apikey=${API_KEY}`);
        const likesData = await likesResponse.json();
        
        // Create a map of recipe_id to likes count
        const likesMap = {};
        likesData.forEach(like => {
            likesMap[like.id_recipe] = like.count || 0;
        });

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
            } else if (category === 'salsas') {
                return recipe.tags && recipe.tags.some(tag =>
                    tag.toLowerCase() === 'salsa'
                );
            } else if (category === 'pastas') {
                return recipe.tags && recipe.tags.some(tag =>
                    tag.toLowerCase() === 'pasta'
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

        // Country filtering function
        const filterByCountry = (recipe, selectedCountries) => {
            if (selectedCountries.length === 0) return true;

            // Check if recipe id_country matches any selected country ID
            if (recipe.id_country) {
                return selectedCountries.includes(recipe.id_country);
            }
            return false;
        };

        // Book filtering function
        const filterByBook = (recipe, selectedBooks) => {
            if (selectedBooks.length === 0) return true;

            // Check if recipe id_book matches any selected book ID
            if (recipe.id_book) {
                return selectedBooks.includes(recipe.id_book);
            }
            return false;
        };

        if (isRecipeListPage) {
            // Update page title based on category
            const categoryTitles = {
                'principales': 'Principales',
                'entradas': 'Entradas', 
                'postres': 'Postres',
                'parrilla': 'Parrilla',
                'salsas': 'Salsas',
                'pastas': 'Pastas'
            };
            
            if (category) {
                document.title = categoryTitles[category] || `Categoría: ${category}`;
                const categoryTitleElement = document.getElementById('category-title');
                if (categoryTitleElement) {
                    categoryTitleElement.textContent = categoryTitles[category] || `Categoría: ${category}`;
                }
            } else {
                document.title = 'Recetas';
                const categoryTitleElement = document.getElementById('category-title');
                if (categoryTitleElement) {
                    categoryTitleElement.textContent = 'Recetas';
                }
            }

            // RECIPE LIST PAGE - Fill recipe-grid with filtered results
            const recipeGrid = document.getElementById('recipe-grid');
            const messageBox = document.getElementById('no-results-message');

            // Filter recipes - skip text search if using fuzzy search results
            const filteredRecipes = recipes.filter(r => {
                const categoryMatch = filterByCategory(r, category);
                // If we used fuzzy search, don't apply text search filter again
                const searchMatch = (searchTerm && searchTerm.length >= 3) ? true : filterBySearch(r, searchTerm);
                const countryMatch = filterByCountry(r, selectedCountries);
                const bookMatch = filterByBook(r, selectedBooks);
                return categoryMatch && searchMatch && countryMatch && bookMatch;
            });

            // Pagination setup
            const itemsPerPage = 8;
            const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);
            let currentPage = parseInt(params.get('page')) || 1;
            if (currentPage < 1) currentPage = 1;
            if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;

            // Get current page items
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex);

            // Display results
            if (filteredRecipes.length > 0) {
                messageBox.style.display = 'none';
                recipeGrid.innerHTML = paginatedRecipes.map(recipe => `
                    <a href="recipe.html?search=${recipe.id}" class="recipe-card ${recipe.tags && recipe.tags.includes('parrilla') ? 'parrilla' : ''}" aria-label="Ver receta de ${recipe.title}">
                        <input type="hidden" class="recipe-id" value="${recipe.id}">
                        <div class="recipe-card-content">
                            <h3 class="recipe-title">${recipe.title}</h3>
                            <div class="recipe-card-meta">
                                ${recipe.flag ? `<img src="${recipe.flag}" alt="Flag" class="recipe-flag">` : ''}
                                <div class="recipe-likes">
                                    <svg class="heart-icon-small" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e74c3c" stroke="#e74c3c" stroke-width="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                    <span class="likes-count">${likesMap[recipe.id] || 0}</span>
                                </div>
                            </div>
                        </div>
                        <img src="${recipe.image}" alt="${recipe.title}" class="recipe-card-image" loading="lazy">
                    </a>
                `).join('');

                // Add pagination controls
                if (totalPages > 1) {
                    const paginationContainer = document.createElement('div');
                    paginationContainer.className = 'pagination-container';
                    paginationContainer.innerHTML = `
                        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">← Anterior</button>
                        <span class="pagination-info">${currentPage}/${totalPages}</span>
                        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">Siguiente →</button>
                    `;
                    recipeGrid.parentNode.insertBefore(paginationContainer, recipeGrid.nextSibling);

                    // Add click handlers for pagination buttons
                    paginationContainer.querySelectorAll('.pagination-btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const newPage = parseInt(btn.dataset.page);
                            const newParams = new URLSearchParams(window.location.search);
                            newParams.set('page', newPage);
                            window.location.search = newParams.toString();
                        });
                    });
                }
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
                // If we used fuzzy search, don't apply text search filter again
                const searchMatch = (searchTerm && searchTerm.length >= 3) ? true : filterBySearch(r, searchTerm);
                const countryMatch = filterByCountry(r, selectedCountries);
                const bookMatch = filterByBook(r, selectedBooks);
                return categoryMatch && searchMatch && countryMatch && bookMatch;
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
