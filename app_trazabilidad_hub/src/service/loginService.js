import httpSerivices from './HttpService'

const UsuariosService = {
    async login(rut, password) {
        const cargaUtil = {rut, password};
        return await httpSerivices.Server.login(cargaUtil);
    },
    async campLogin(token) {
        return await httpSerivices.Server.campLogin(token);
    },
    async fetchBackendJwt() {
        return await httpSerivices.Server.fetchBackendJwt();
    }
};
export default UsuariosService;
