import httpSerivices from './HttpService'

export default class StoreService {
    async getStores(){
        return httpSerivices.Server.getStores();
    }
}