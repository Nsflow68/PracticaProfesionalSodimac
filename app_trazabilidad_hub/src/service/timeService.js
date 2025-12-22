import axios from "axios";
import moment from 'moment';

export class TimeService {
  async getTimeMCU(value) {

    const dateToday = moment().subtract(value - 1, 'days').format('YYYY-MM-DD');
    
    const options = {
      method: 'get',
      url: `${import.meta.env.VITE_APP_API_FLR_REPORT}/new?dateToday=${dateToday}`
    };
    try {
      const { data } = await axios(options);
      return data; 
    } catch (error) {
      console.error('Error en la solicitud:', error);
      return null; 
    }
  }

  async trazaAction(_user, _newQueue, _oldQueue, _action) {

    const dataBody = {
      action: _action,
      cc: 221,
      country: 'CL',
      user: _user,
      app: 'app_flr',
      data: {
        oldQueue: _oldQueue,
        newQueue: _newQueue
      }
    }


    try {
      const config = {
        method: 'POST',
        url: `${import.meta.env.VITE_APP_PROXY_PAISES_ACTION}/action`,
        data: dataBody,
        headers: {
          'x-api-key': import.meta.env.VITE_APP_API_K_ACTION,
          'Content-Type': 'application/json',
        },
      }
      const { data } = await axios(config)
      console.log(data, 'data trazaAction')
      return data
    } catch (err) {
      console.log(err, 'error trazaAction')

      console.error('Error on trazaAction')
      throw new Error(err)
    }

  }
}