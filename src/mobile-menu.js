document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mainNav.classList.toggle('mobile-open');
            mobileMenuBtn.textContent = mainNav.classList.contains('mobile-open') ? '✕' : '☰';
        });
    }
    
    // Mobile dropdown functionality
    const categoryBtn = document.getElementById('category-btn');
    const categoryDropdown = document.getElementById('category-dropdown');
    
    if (categoryBtn && categoryDropdown) {
        // Check if we're on mobile
        function isMobile() {
            return window.innerWidth <= 768;
        }
        
        categoryBtn.addEventListener('click', function(e) {
            if (isMobile()) {
                e.preventDefault();
                e.stopPropagation();
                
                // Toggle dropdown
                const isVisible = categoryDropdown.classList.contains('show');
                
                // Close all other dropdowns
                document.querySelectorAll('.dropdown-content.show').forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
                
                // Toggle this dropdown
                if (!isVisible) {
                    categoryDropdown.classList.add('show');
                }
            }
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (isMobile() && !e.target.closest('.dropdown')) {
                categoryDropdown.classList.remove('show');
            }
        });
        
        // Close dropdown when clicking on a link
        categoryDropdown.addEventListener('click', function(e) {
            if (isMobile() && e.target.tagName === 'A') {
                categoryDropdown.classList.remove('show');
            }
        });
    }
});
