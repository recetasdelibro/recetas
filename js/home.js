document.addEventListener('DOMContentLoaded', async () => {
    try {
        const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhemVhb2Fmbnp0eGlka2dkd3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NjEyOTEsImV4cCI6MjA5MjAzNzI5MX0.baG-JMojvCC7xEqRdUFcNSIt30lUOrNwvHqSYZM5nhk';
        
        // Fetch only 8 recipes with essential fields to minimize data transfer
        const response = await fetch('https://hazeaoafnztxidkgdwsn.supabase.co/rest/v1/recetas?select=id,title,image,flag,tags,likes&limit=8&apikey=' + API_KEY);
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
                        <div class="recipe-card-meta">
                            ${recipe.flag ? `<img src="${recipe.flag}" alt="Flag" class="recipe-flag">` : ''}
                            <div class="recipe-likes">
                                <svg class="heart-icon-small" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e74c3c" stroke="#e74c3c" stroke-width="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                <span class="likes-count">${recipe.likes !== null && recipe.likes !== undefined ? recipe.likes : 0}</span>
                            </div>
                        </div>
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
        const countriesDropdownBtn = document.getElementById('countries-dropdown-btn');
        const countriesDropdown = document.getElementById('countries-dropdown');
        const booksContainer = document.getElementById('books-container');
        const booksDropdownBtn = document.getElementById('books-dropdown-btn');
        const booksDropdown = document.getElementById('books-dropdown');

        // Dynamically generate country checkboxes
        const countriesResponse = await fetch('https://hazeaoafnztxidkgdwsn.supabase.co/rest/v1/countries?select=id,name&apikey=' + API_KEY);
        const countries = await countriesResponse.json();

        if (countries && countries.length > 0) {
            countries.forEach(country => {
                const checkboxDiv = document.createElement('div');
                checkboxDiv.className = 'country-checkbox';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `country-${country.id}`;
                checkbox.value = country.id;
                checkbox.name = 'country';

                const label = document.createElement('label');
                label.htmlFor = `country-${country.id}`;
                label.textContent = country.name;

                checkboxDiv.appendChild(checkbox);
                checkboxDiv.appendChild(label);
                countriesContainer.appendChild(checkboxDiv);
            });
        }

        // Dynamically generate book checkboxes
        const booksResponse = await fetch('https://hazeaoafnztxidkgdwsn.supabase.co/rest/v1/books?select=id,name&apikey=' + API_KEY);
        const books = await booksResponse.json();

        if (books && books.length > 0) {
            books.forEach(book => {
                const checkboxDiv = document.createElement('div');
                checkboxDiv.className = 'book-checkbox';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `book-${book.id}`;
                checkbox.value = book.id;
                checkbox.name = 'book';

                const label = document.createElement('label');
                label.htmlFor = `book-${book.id}`;
                label.textContent = book.name;

                checkboxDiv.appendChild(checkbox);
                checkboxDiv.appendChild(label);
                booksContainer.appendChild(checkboxDiv);
            });
        }

    // Open modal
    filtrosBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Toggle countries dropdown
    countriesDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = countriesDropdownBtn.getBoundingClientRect();
        countriesDropdown.style.top = `${rect.bottom + window.scrollY}px`;
        countriesDropdown.style.left = `${rect.left + window.scrollX}px`;
        countriesDropdown.classList.toggle('show');
        booksDropdown.classList.remove('show');
    });

    // Toggle books dropdown
    booksDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = booksDropdownBtn.getBoundingClientRect();
        booksDropdown.style.top = `${rect.bottom + window.scrollY}px`;
        booksDropdown.style.left = `${rect.left + window.scrollX}px`;
        booksDropdown.classList.toggle('show');
        countriesDropdown.classList.remove('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!countriesDropdownBtn.contains(e.target) && !countriesDropdown.contains(e.target)) {
            countriesDropdown.classList.remove('show');
        }
        if (!booksDropdownBtn.contains(e.target) && !booksDropdown.contains(e.target)) {
            booksDropdown.classList.remove('show');
        }
    });

    // Close modal with X button
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        countriesDropdown.classList.remove('show');
        booksDropdown.classList.remove('show');
    });

    // Close modal with filtrar button and navigate to recipe_list
    filtrarBtn.addEventListener('click', () => {
        const checkedCountries = Array.from(document.querySelectorAll('input[name="country"]:checked'))
            .map(checkbox => checkbox.value);

        const checkedBooks = Array.from(document.querySelectorAll('input[name="book"]:checked'))
            .map(checkbox => checkbox.value);

        const params = new URLSearchParams();
        if (checkedCountries.length > 0) {
            params.append('countries', checkedCountries.join(','));
        }
        if (checkedBooks.length > 0) {
            params.append('books', checkedBooks.join(','));
        }

        if (params.toString()) {
            window.location.href = `pages/recipe_list.html?${params.toString()}`;
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

