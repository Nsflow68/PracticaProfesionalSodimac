import { defineStore } from 'pinia';

const TOKEN_KEY = 'traza_hub_backend_token';

const readFromStorage = () => {
    if (typeof window === 'undefined') return null;
    try {
        return window.localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

const writeToStorage = (value) => {
    if (typeof window === 'undefined') return;
    try {
        if (value) {
            window.localStorage.setItem(TOKEN_KEY, value);
        } else {
            window.localStorage.removeItem(TOKEN_KEY);
        }
    } catch {
        
    }
};

export const useAuthTokenStore = defineStore('authToken', {
    state: () => ({
        token: readFromStorage(),
    }),
    getters: {
        hasToken: (state) => Boolean(state.token),
    },
    actions: {
        setToken(value) {
            this.token = value || null;
            writeToStorage(this.token);
        },
        clearToken() {
            this.setToken(null);
        },
    },
});
