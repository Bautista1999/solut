import { writable } from 'svelte/store';

// Check if localStorage is available (for SSR compatibility)
const isBrowser = typeof window !== 'undefined';

// Get initial theme from localStorage or default to 'light'
const storedTheme = isBrowser && localStorage.getItem('theme') || 'light';

// Create a writable store with the initial value
export const theme = writable(storedTheme);

// Subscribe to theme changes and update localStorage and document
if (isBrowser) {
    theme.subscribe(value => {
        // Update localStorage
        localStorage.setItem('theme', value);
        
        // Update document theme
        if (value === 'dark') {
            document.documentElement.classList.add('dark-theme');
        } else {
            document.documentElement.classList.remove('dark-theme');
        }
    });
}

// Toggle theme function
export function toggleTheme() {
    theme.update(current => current === 'light' ? 'dark' : 'light');
} 