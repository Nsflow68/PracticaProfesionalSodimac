import axios from "axios";
export class UserService{


    getUsuarios(Authorization) {
        return new Promise((resolve, reject) => {
            let header = {  'X-API-Key': '387ad078e30d8a15af2de99c15e4d899' };
            let url = import.meta.env.VITE_APP_RUTA_API;
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: url + '/getUsers' ,
                headers: header
            };
            axios.request(config)
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.log(error);
                    reject(error)
                });
        });
    };
    getUsuariosStore(store) {
        return new Promise((resolve, reject) => {
            let header = {  'X-API-Key': '387ad078e30d8a15af2de99c15e4d899' };
            let url = import.meta.env.VITE_APP_RUTA_API;
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: url + '/getUsersByStore?store='+store ,
                headers: header
            };
            axios.request(config)
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.log(error);
                    reject(error)
                });
        });
    };
    postGuardarUsuarios(data){
        return new Promise((resolve, reject) => {
            let header = {  'X-API-Key': '387ad078e30d8a15af2de99c15e4d899' };
            let url = import.meta.env.VITE_APP_RUTA_API;
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: url + '/user' ,
                headers: header,
                data:data
            };
            axios.request(config)
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.log(error);
                    reject(error)
                });
        });
    }
    postModificarUsuarios(data){
        return new Promise((resolve, reject) => {
            let header = {  'X-API-Key': '387ad078e30d8a15af2de99c15e4d899' };
            let url = import.meta.env.VITE_APP_RUTA_API;
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: url + '/assignProfile' ,
                headers: header,
                data:data
            };
            axios.request(config)
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.log(error);
                    reject(error)
                });
        });
    }
    postActualizarUsuario(data){
        return new Promise((resolve, reject) => {
            let header = {  'X-API-Key': '387ad078e30d8a15af2de99c15e4d899' };
            let url = import.meta.env.VITE_APP_RUTA_API;
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: url + '/updateUser' ,
                headers: header,
                data:data
            };
            axios.request(config)
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.log(error);
                    reject(error)
                });
        });
    }
    setPick(body) {
        return new Promise((resolve, reject) => {
            let url = import.meta.env.VITE_APP_API_PUT_XD;
            let header = {  'X-API-Key': '387ad078e30d8a15af2de99c15e4d899' };
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: url + '/xd/pick',
                headers: header,
                data: body
            };
            axios.request(config)
                .then((response) => {
                    resolve(response.data)
                })
                .catch((error) => {
                    console.log(error);
                    reject({ status: 400, message: 'Error Servicio' });
                });
        });
    };
}

