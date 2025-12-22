import axios from 'axios';

const makeGetRequest = async (baseUrl, path, params, apiKey) => {
    const header = { "X-API-Key": apiKey };
    const url = new URL(baseUrl + path);
    const searchParams = new URLSearchParams();
    for (const key in params) {
        searchParams.append(key, params[key]);
    }
    url.search = searchParams.toString();

    const response = await fetch(url.toString(), {
        headers: header,
        method: "GET",
    });

    if (response.ok) {
        const responseData = await response.json();
        return responseData;
    } else {
        console.error("Error en la solicitud:", response.status, response.statusText);
        return [];
    }
};

const parseJwtFromResponse = (payload) => {
    if (!payload || typeof payload !== 'object') return null;
    const directKeys = ['token', 'Token', 'access_token', 'jwt', 'jwtToken'];
    for (const key of directKeys) {
        if (typeof payload[key] === 'string') {
            return payload[key];
        }
    }
    if (payload.data && typeof payload.data === 'object') {
        return parseJwtFromResponse(payload.data);
    }
    return null;
};

const Server = {
    "login": async (datos) => {
        const params = {
            rut: String(datos.rut),
            password: String(datos.password)
        };
        return makeGetRequest(import.meta.env.VITE_APP_RUTA_LOGIN, '', params, "387ad078e30d8a15af2de99c15e4d899");
    },
    "campLogin": async (token) => {
        const header = { "authorization": "Bearer " + token };
        const url = import.meta.env.VITE_APP_RUTA_API+'/loginCamp';
    
        try {
            const response = await axios.post(url, {}, { headers: header });
            return response.data;
        } catch (error) {
            console.error("Error en la solicitud:", error.response.status, error.response.statusText);
            return [];
        }
    },
    "getStores": async (country, click) => {
        const params = {
            country: country,
            click: click
        };
        return makeGetRequest(import.meta.env.VITE_APP_RUTA_API_TIENDA, '/stores', params, "387ad078e30d8a15af2de99c15e4d899");
    },
    "fetchBackendJwt": async () => {
        const url = import.meta.env.VITE_APP_BACKEND_JWT_URL;
        const username = import.meta.env.VITE_APP_BACKEND_JWT_USER;
        const password = import.meta.env.VITE_APP_BACKEND_JWT_PASSWORD;
        const code = import.meta.env.VITE_APP_BACKEND_JWT_CODE;

        if (!url || !username || !password || !code) {
            throw new Error('Configuración de JWT incompleta');
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ username, password, code }),
        });

        if (!response.ok) {
            throw new Error(`Error autenticando JWT: ${response.status}`);
        }

        const payload = await response.json();
        const token = parseJwtFromResponse(payload);

        if (!token) {
            throw new Error('Token JWT no presente en la respuesta');
        }

        return token;
    }
};
export default { Server };
