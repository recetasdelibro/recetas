// Generate or get existing user identifier from cookie
function getOrCreateUserId() {
    const cookieName = 'recipe_user_id';
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === cookieName) {
            return value;
        }
    }
    
    // Generate new UUID if not exists
    const newUserId = crypto.randomUUID();
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1); // 1 year expiration
    
    document.cookie = `${cookieName}=${newUserId}; expires=${expires.toUTCString()}; path=/`;
    return newUserId;
}
