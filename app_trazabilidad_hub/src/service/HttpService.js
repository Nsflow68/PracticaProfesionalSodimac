import axios from 'axios';

const apiKey = import.meta.env.VITE_APP_API_KEY;

const makeGetRequest = async (baseUrl, path, params, requestKey) => {
    const header = { "X-API-Key": requestKey };
    const url = new URL(baseUrl + path);
    const searchParams = new URLSearchParams();
    for (const key in params) searchParams.append(key, params[key]);
    url.search = searchParams.toString();

    const response = await fetch(url.toString(), { headers: header, method: "GET" });
    if (response.ok) return response.json();
    console.error("Error en la solicitud:", response.status, response.statusText);
    return [];
};

const parseJwtFromResponse = (payload) => {
    if (!payload || typeof payload !== 'object') return null;
    const directKeys = ['token', 'Token', 'access_token', 'jwt', 'jwtToken'];
    for (const key of directKeys) {
        if (typeof payload[key] === 'string') return payload[key];
    }
    if (payload.data && typeof payload.data === 'object') return parseJwtFromResponse(payload.data);
    return null;
};

const Server = {
    "login": async (datos) => {
        if (!apiKey) throw new Error('VITE_APP_API_KEY no está configurada');
        const params = { rut: String(datos.rut), password: String(datos.password) };
        return makeGetRequest(import.meta.env.VITE_APP_RUTA_LOGIN, '', params, apiKey);
    },
    "campLogin": async (token) => {
        const header = { "authorization": "Bearer " + token };
        const url = import.meta.env.VITE_APP_RUTA_API + '/loginCamp';
        try {
            const response = await axios.post(url, {}, { headers: header });
            return response.data;
        } catch (error) {
            console.error("Error en la solicitud:", error.response?.status, error.response?.statusText);
            return [];
        }
    },
    "getStores": async (country, click) => {
        if (!apiKey) throw new Error('VITE_APP_API_KEY no está configurada');
        const params = { country, click };
        return makeGetRequest(import.meta.env.VITE_APP_RUTA_API_TIENDA, '/stores', params, apiKey);
    },
    "fetchBackendJwt": async () => {
        const url = import.meta.env.VITE_APP_BACKEND_JWT_URL;
        const username = import.meta.env.VITE_APP_BACKEND_JWT_USER;
        const password = import.meta.env.VITE_APP_BACKEND_JWT_PASSWORD;
        const code = import.meta.env.VITE_APP_BACKEND_JWT_CODE;
        if (!url || !username || !password || !code) throw new Error('Configuración de JWT incompleta');

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ username, password, code }),
        });
        if (!response.ok) throw new Error(`Error autenticando JWT: ${response.status}`);
        const token = parseJwtFromResponse(await response.json());
        if (!token) throw new Error('Token JWT no presente en la respuesta');
        return token;
    }
};
export default { Server };