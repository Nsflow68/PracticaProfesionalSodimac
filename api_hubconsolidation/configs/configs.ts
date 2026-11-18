import configServer from "./../config.json";

export class URLservicesProvider {
    static prod = process.env.URLSERVER_PROD ?? '';
    static test = process.env.URLSERVER_TEST ?? '';
    static dev = process.env.URLSERVER_DEV ?? 'http://localhost';
    static venv = process.env.URLSERVER ?? 'http://localhost';
}

export class ConfigServer {
    static port: string = configServer.portApp;
}