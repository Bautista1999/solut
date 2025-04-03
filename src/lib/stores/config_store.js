import { writable, derived } from 'svelte/store';

// Load environment variables or use defaults
const CURRENCY_SYMBOL = import.meta.env.VITE_CURRENCY_SYMBOL || 'ICP';
const CURRENCY_DECIMALS = parseInt(import.meta.env.VITE_CURRENCY_DECIMALS || '8');
const CURRENCY_NAME = import.meta.env.VITE_CURRENCY_NAME || 'Internet Computer';

// Create the configuration store
export const config = writable({
    currency: {
        symbol: CURRENCY_SYMBOL,
        name: CURRENCY_NAME,
        decimals: CURRENCY_DECIMALS
    }
});

// Derived store for formatted currency values
export const formatCurrency = derived(config, ($config) => {
    return (value, options = {}) => {
        const decimals = options.decimals ?? $config.currency.decimals;
        const showSymbol = options.showSymbol ?? true;
        const formatted = Number(value).toFixed(decimals);
        return showSymbol ? `${formatted} ${$config.currency.symbol}` : formatted;
    };
});

// Helper function to update currency settings
export function updateCurrencySettings(settings) {
    config.update(c => ({
        ...c,
        currency: {
            ...c.currency,
            ...settings
        }
    }));
} 