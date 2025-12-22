import axios from "axios";
export default class OrdersxdService {

    setPick(body) {
        return new Promise((resolve, reject) => {
            let header = { 'X-API-Key': 'jhguyfyt6rt8u7gr7ugi8' };
            let url = import.meta.env.VITE_APP_API_PUT_XD;
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: url + '/xd/pick',
                headers: header,
                data: body
            };
            axios.request(config)
                .then((response) => {
                    resolve(response)
                })
                .catch((error) => {
                    console.log(error);
                    resolve({ status: 400, message: 'Error Servicio' });
                });
        });
    };
}

