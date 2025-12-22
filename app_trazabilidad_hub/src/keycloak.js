import Keycloak from 'keycloak-js';

const keycloakConfig = {
    url: import.meta.env.VITE_APP_URL_OAUTH,
    realm: import.meta.env.VITE_APP_REALM,
    clientId: import.meta.env.VITE_APP_CLIENT_ID,
    publicClient: true,
    sslRequired: 'external',
    confidentialPort: 0,
};

const _keycloak = new Keycloak(keycloakConfig);
await _keycloak.init({
    onLoad: 'check-sso',
    checkLoginIframe: false,
    pkceMethod: 'S256'
});

export default {
    
    authenticated: () => _keycloak.authenticated,
    async idAuth(){
        return _keycloak.authenticated;
    },
    
    async loginIfRequired() {
        if (!_keycloak.authenticated) {
            try {
                await _keycloak.login();
            } catch (error) {
                console.error("Error during Keycloak login:", error);
            }
        }
    },

    
    getAccessToken() {
        try {
            console.log("starting getAccessToken.....")
            console.log("isTokenExpired: ", _keycloak.isTokenExpired())
            return _keycloak.token;
        } catch (error) {
            return null; 
        }
    },

    
    logout() {
        _keycloak.logout();
    }
};
