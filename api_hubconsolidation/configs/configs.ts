import configServer from "./../config.json";

export class URLservicesProvider {
    static prod = 'https://hansolo.dda.sodimac.cl';
    static test = 'https://thanos.dda.sodimac.cl';
    static dev = 'http://localhost';
    static venv = process.env.URLSERVER ?? 'http://localhost';
}

export class ConfigServer{
    static port: string = configServer.portApp;
}