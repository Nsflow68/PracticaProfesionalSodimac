<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import ProgressSpinner from 'primevue/progressspinner';
import axios from 'axios';
import { useAuthTokenStore } from '@/store/authTokenStore';

const hubs = ref([]);
const hub = ref(localStorage.getItem('recepcion_hub') || '');
const camion = ref('');
const ot = ref('');
const sello1 = ref('');
const sello2 = ref('');
const palletInput = ref('');
const pallets = ref([]);
const loading = ref(false);
const error = ref(null);
const success = ref(null);

const ENDPOINT_BASE = 'https://kurama.dda.sodimac.cl:8443';
const ENDPOINT_HUBS = `${ENDPOINT_BASE}/getHubs`;
const RECEPCION_COMPLETO = `${ENDPOINT_BASE}/getPalletVirtualRecepCompleto`;
const authTokenStore = useAuthTokenStore();
const { token } = storeToRefs(authTokenStore);

const authHeaders = () => {
  if (!token.value) return null;
  return { Authorization: `Bearer ${token.value}` };
};

const loadHubs = async () => {
  const headers = authHeaders();
  if (!headers) return;
  try {
    const res = await fetch(ENDPOINT_HUBS, { headers });
    const data = await res.json();
    hubs.value = Array.isArray(data?.data) ? data.data : [];
  } catch {
    
  }
};

onMounted(loadHubs);

const addPallet = () => {
  const val = palletInput.value.trim();
  if (!val) return;
  if (!pallets.value.includes(val)) pallets.value.push(val);
  palletInput.value = '';
};

const removePallet = (id) => {
  pallets.value = pallets.value.filter((p) => p !== id);
};

const clearList = () => {
  pallets.value = [];
  error.value = null;
  success.value = null;
};

const ingresarTodo = async () => {
  if (!hub.value) { error.value = 'Selecciona un HUB antes de ingresar.'; return; }
  if (!ot.value) { error.value = 'Ingresa la OT.'; return; }
  if (!sello1.value || !sello2.value) { error.value = 'Ingresa ambos sellos (sello1 y sello2).'; return; }
  if (pallets.value.length === 0) return;
  const headers = authHeaders();
  if (!headers) { error.value = 'Sesion expirada. Inicia sesion nuevamente.'; return; }
  loading.value = true;
  error.value = null;
  success.value = null;
  try {
    const usuario = localStorage.getItem('usuario') || 'INVITADO';
    const palletsParam = pallets.value.map((p) => `%27${encodeURIComponent(p)}%27`).join(',');
    const url = `${RECEPCION_COMPLETO}?ot=${encodeURIComponent(ot.value)}&pallets=${palletsParam}&sello1=${encodeURIComponent(sello1.value)}&sello2=${encodeURIComponent(sello2.value)}&usuario=${encodeURIComponent(usuario)}`;
    const res = await axios.post(url, null, { timeout: 20000, headers });
    const data = res?.data;
    success.value = typeof data === 'string' ? data : `Recepcion completada. Pallets procesados: ${pallets.value.length}`;
  } catch (err) {
    error.value = err?.response?.data?.message || err?.message || 'Error en la recepcion';
  } finally {
    loading.value = false;
  }
};

const persistHub = () => localStorage.setItem('recepcion_hub', hub.value);
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <h2>Recepcion</h2>
    </div>

    <div class="col-12 md:col-6">
      <div class="field">
        <label>HUB</label>
        <Dropdown v-model="hub" :options="hubs" optionLabel="nombre_hub" optionValue="nombre_hub" placeholder="Selecciona HUB" @change="persistHub"/>
      </div>
    </div>

    <div class="col-12 md:col-6">
      <div class="p-inputgroup">
        <span class="p-inputgroup-addon">Camion</span>
        <InputText v-model="camion" placeholder="Patente" />
      </div>
    </div>

    <div class="col-12 md:col-6">
      <div class="p-inputgroup">
        <span class="p-inputgroup-addon">OT</span>
        <InputText v-model="ot" placeholder="Orden de trabajo" />
      </div>
    </div>

    <div class="col-12 md:col-3">
      <div class="p-inputgroup">
        <span class="p-inputgroup-addon">Sello 1</span>
        <InputText v-model="sello1" />
      </div>
    </div>
    <div class="col-12 md:col-3">
      <div class="p-inputgroup">
        <span class="p-inputgroup-addon">Sello 2</span>
        <InputText v-model="sello2" />
      </div>
    </div>

    <div class="col-12 md:col-6">
      <div class="p-inputgroup">
        <InputText v-model="palletInput" placeholder="ID Pallet virtual" @keydown.enter="addPallet" />
        <Button label="Agregar" icon="pi pi-plus" @click="addPallet" />
        <Button label="Limpiar" severity="secondary" icon="pi pi-trash" @click="clearList" />
      </div>
      <small>Presiona Enter para agregar rapidamente.</small>
    </div>

    <div class="col-12">
      <div class="card">
        <div class="card-header flex align-items-center justify-content-between">
          <strong>Pallets</strong>
          <Button label="Ingresar todo" icon="pi pi-check" @click="ingresarTodo" :disabled="loading || pallets.length===0" />
        </div>
        <div class="card-body">
          <ul>
            <li v-for="p in pallets" :key="p" class="flex align-items-center justify-content-between">
              <span>{{ p }}</span>
              <Button label="Quitar" icon="pi pi-times" severity="danger" text @click="removePallet(p)" />
            </li>
          </ul>
          <div v-if="loading" class="flex align-items-center gap-2 mt-2">
            <ProgressSpinner style="width:30px;height:30px" strokeWidth="4" />
            <span>Procesando...</span>
          </div>
          <div v-if="error" class="p-error mt-2">{{ error }}</div>
          <div v-if="success" class="p-success mt-2">{{ success }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.p-inputgroup { width: 100%; }
.card { border: 1px solid var(--surface-border); border-radius: 6px; }
.card-header { padding: .75rem 1rem; border-bottom: 1px solid var(--surface-border); }
.card-body { padding: 1rem; }
ul { list-style: none; padding: 0; margin: 0; }
li { padding: .25rem 0; }
</style>
