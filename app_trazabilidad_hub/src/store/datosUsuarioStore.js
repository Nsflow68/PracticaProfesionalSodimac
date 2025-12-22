import { defineStore } from 'pinia'

export const useDatosUsuarioStore = defineStore('usuario', {
    state: () => {
      return {
        dataUsuario:{},
      }
    },
  
    actions: {
      async agregarDataUsuario(value) {
        this.dataUsuario=value
      }
    }
  })