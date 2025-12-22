<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import loginService from '@/service/loginService';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { useDatosUsuarioStore } from '@/store/datosUsuarioStore';
import { useAuthTokenStore } from '@/store/authTokenStore';
import keycloak from '@/keycloak';
import Button from 'primevue/button';
import Toast from 'primevue/toast';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';

const router = useRouter();
const toast = useToast();
const appName = ref(import.meta.env.VITE_APP_PROYECT);
const appVersion = ref(import.meta.env.VITE_APP_VERSION);
const password = ref('');
const formatedRut = ref('');
const userAD = ref(null);
const usuario = useDatosUsuarioStore();
const authTokenStore = useAuthTokenStore();
const showAD = ref(true);

onMounted(async () => {
    const auth = await keycloak.idAuth();
    if (auth) {
        userAD.value = await keycloak.getAccessToken();
        loginCamp();
    }
    const datosUsuarioCookie = JSON.parse(localStorage.getItem('usuario_sbs'));
    if (datosUsuarioCookie) {
        usuario.agregarDataUsuario(datosUsuarioCookie);
        router.push({ path: ' ' });
    }
});

watch(formatedRut, async (newValue) => {
    const data = formatRut(newValue);
    formatedRut.value = data;
});
function formatRut(number) {
    const rutNumbersArray = number.split('');
    rutNumbersArray.forEach((number, index) => {
        if (index === 2 || index === 6) {
            if (number !== '.') {
                rutNumbersArray.splice(index, 0, '.');
            }
        }
    });

    if (!rutNumbersArray.includes('-') && rutNumbersArray.length === 10) {
        rutNumbersArray.push('-');
    }

    return rutNumbersArray.join('');
}
async function iniciarSesion() {
    try {
        const user = formatedRut.value.replace(/[.-]/g, '');
        const usuarioLogueado = await loginService.login(user, password.value);
        if (usuarioLogueado.description === 'Login exitoso') {
            await hydrateBackendToken();
            usuario.agregarDataUsuario(usuarioLogueado.data[0]);
            localStorage.setItem('usuario_sbs', JSON.stringify(usuarioLogueado.data[0]));
            router.push({ path: ' ' });
            formatedRut.value = '';
            password.value = '';
            localStorage.setItem('firstLogin', 'true');
        } else {
            toast.add({ severity: 'error', summary: 'Alerta', detail: 'Usuario o contraseña incorrectos', life: 3000 });
        }
    } catch (e) {
        toast.add({ severity: 'error', summary: '¡ERROR!', detail: `Error iniciando sesión: ${e}`, life: 3000 });
    }
}
async function loginCamp() {
    try {
        const usuarioLogueado = await loginService.campLogin(userAD.value);
        if (usuarioLogueado.description === 'Login exitoso') {
            await hydrateBackendToken();
            usuario.agregarDataUsuario(usuarioLogueado.data[0]);
            localStorage.setItem('usuario_sbs', JSON.stringify(usuarioLogueado.data[0]));
            router.push({ path: ' ' });
            formatedRut.value = '';
            password.value = '';
            localStorage.setItem('firstLogin', 'true');
        } else {
            toast.add({ severity: 'error', summary: 'Alerta', detail: 'Usuario o contraseña incorrectos', life: 3000 });
        }
    } catch (e) {
        toast.add({ severity: 'error', summary: '¡ERROR!', detail: `Error iniciando sesión: ${e}`, life: 3000 });
    }
}
const logoUrl = computed(() => {
    return import.meta.env.VITE_APP_RUTA_IMAGES + `/favicon.ico`;
});

async function hydrateBackendToken() {
    try {
        const token = await loginService.fetchBackendJwt();
        authTokenStore.setToken(token);
        return token;
    } catch (error) {
        console.error('Error obteniendo token backend', error);
        toast.add({ severity: 'warn', summary: 'Atencion', detail: 'No se pudo obtener token del servicio AdmGuia.', life: 4000 });
        return null;
    }
}
</script>

<template>
  <div class="login-wrapper">
    <Toast />
    <div class="grid w-full">
      
      <div class="col-12 md:col-6 brand-panel">
        <div class="brand-content">
          <img :src="logoUrl" alt="Logo" height="56" class="mb-3" />
          <h1 class="brand-title">{{ appName }}</h1>
          <p class="brand-subtitle">Versión {{ appVersion }}</p>
          <p class="brand-helper">Traza, consolida y opera en el HUB.</p>
        </div>
      </div>

      
      <div class="col-12 md:col-6 flex align-items-center justify-content-center">
        <div class="login-card surface-card">
          <div class="text-center mb-4">
            <h2 class="text-900 m-0">Inicia sesión</h2>
            <span class="text-600">Accede para continuar</span>
          </div>

          <div class="form" @keydown.enter="iniciarSesion">
            <div class="p-inputgroup mb-3">
              <span class="p-inputgroup-addon"><i class="pi pi-id-card"></i></span>
              <InputText id="rut" type="text" placeholder="RUT" class="w-full" v-model="formatedRut" />
            </div>

            <div class="p-inputgroup mb-3">
              <span class="p-inputgroup-addon"><i class="pi pi-lock"></i></span>
              <Password id="password" v-model="password" placeholder="Contraseña" :inputStyle="{ width: '100%' }" class="w-full" toggleMask />
            </div>

            <Button label="Ingresar con RUT" class="w-full" @click="iniciarSesion" />
          </div>

          <div class="divider">
            <span>o</span>
          </div>

          <div v-if="showAD">
            <Button @click="keycloak.loginIfRequired()" type="button" label="Ingresar con cuenta NT" icon="pi pi-microsoft" iconPos="right" outlined class="w-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: var(--surface-ground);
}


.brand-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color), rgba(33,150,243,0.4));
  color: #ffffff;
}

.brand-content {
  text-align: center;
  padding: 2rem;
}

.brand-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0.5rem 0;
}

.brand-subtitle {
  margin: 0;
  opacity: 0.9;
}

.brand-helper {
  margin-top: 1rem;
  opacity: 0.85;
}


.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
  margin: 1rem 0;
  color: var(--text-color-secondary);
}


.pi-eye, .pi-eye-slash {
  transform: scale(1.25);
}
</style>
