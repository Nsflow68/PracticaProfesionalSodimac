import axios from "axios";
import { URLservicesProvider } from "../configs/configs";

export const getDetUbicacion= (ubicacion: string, whse: string|number) => {


    return new Promise((resolve, reject) => {

        let data = {
            "ubic": ubicacion,
            "whse": whse
        }

        let config = {
            method: 'GET',
            url: `${URLservicesProvider.venv}:3052/getDetUbicacion`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        axios(config)
            .then(function (response: any) {
                JSON.stringify(response.data);
                resolve(response.data);

            })
            .catch(function (error: any) {
                reject(error)

            });

    })
}


export const getHubUbic= (ubicacion: string, whse: number| string) => {


    return new Promise((resolve, reject) => {

        let data = {
            "ubicacion": ubicacion,
            "whse":whse
        }

        let config = {
            method: 'GET',
            url: `${URLservicesProvider.venv}:3052/getDetUbicacion`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };
        axios(config)
            .then(function (response: any) {
                JSON.stringify(response.data);
                resolve(response.data);

            })
            .catch(function (error: any) {
                reject(error)

            });

    })
}