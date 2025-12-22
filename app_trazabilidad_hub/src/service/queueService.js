import axios from "axios";

export class QueueService {
  async getPriority() {
    const options = {
      method: 'get',
      url: `${import.meta.env.VITE_APP_API_FLR_WORKFLOW_PRIORITY}/`
    };
    try {
      const { data } = await axios(options);
      return data; 
    } catch (error) {
      console.error('Error en la solicitud:', error);
      return null; 
    }
  }

  async getQueue() {
    const options = {
      method: 'get',
      url: `${import.meta.env.VITE_APP_API_FLR_WORKFLOW_PRIORITY}/name/NEW_QUEUE_SIZE_PPS`
    };
    try {
      const { data } = await axios(options);
      return data; 
    } catch (error) {
      console.error('Error en la solicitud:', error);
      return null; 
    }
  }

  async updateQueue(pps, queue) {
    const options = {
      method: 'put',
      url: `${import.meta.env.VITE_APP_API_FLR_WORKFLOW_PRIORITY}/NEW_QUEUE_SIZE_PPS/${pps}/${queue}`
    };
    try {
      const { data } = await axios(options);
      return data; 
    } catch (error) {
      console.error('Error en la solicitud:', error);
      return null; 
    }
  }

  async updatePriority(_body, _token) {
    const options = {
      method: 'post',
      url: `${import.meta.env.VITE_APP_API_BFF_FLR_GESTION_FLR}`,
      data: _body,
      headers: {
        authorization: `Bearer ${_token}`,
        'content-type': 'application/json'
      },
    };
    try {
      const { data } = await axios(options);
      return data; 
    } catch (error) {
      console.error('Error en la solicitud:', error);
      return null; 
    }
  }

  async token() {
    const options = {
      method: 'post',
      url: `${import.meta.env.VITE_APP_API_BFF_AUTH}`,
      data: {
        user: import.meta.env.VITE_APP_API_BFF_AUTH_USER,
        password: import.meta.env.VITE_APP_API_BFF_AUTH_PASS
      }
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