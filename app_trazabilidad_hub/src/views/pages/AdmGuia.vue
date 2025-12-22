<script setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import ProgressSpinner from 'primevue/progressspinner';
import { useAuthTokenStore } from '@/store/authTokenStore';

const cc = ref('221');
const loading = ref(false);
const error = ref(null);
const payload = ref(null);

const authTokenStore = useAuthTokenStore();
const { token } = storeToRefs(authTokenStore);
const BASE_URL = import.meta.env.VITE_APP_ADM_GUIA_URL ?? 'https://kurama.dda.sodimac.cl:8443/getDataInforme_admGuia';

const buildUrl = () => {
  const params = new URLSearchParams({ cc: cc.value || '' });
  return `${BASE_URL}?${params.toString()}`;
};

const consultar = async () => {
  loading.value = true;
  error.value = null;
  payload.value = null;

  if (!token.value) {
    error.value = 'No hay token valido para consultar AdmGuia. Inicie sesion nuevamente.';
    loading.value = false;
    return;
  }

  try {
    const res = await fetch(buildUrl(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
      },
    });
    const data = await res.json();
    payload.value = data;
  } catch (e) {
    error.value = e?.message || 'Error consultando AdmGuia';
  } finally {
    loading.value = false;
  }
};

const rows = computed(() => {
  const pl = payload.value;
  if (!pl) return [];
  if (Array.isArray(pl)) return pl;
  const candidates = ['rows', 'data', 'items', 'result', 'payload'];
  const key = candidates.find((k) => Array.isArray(pl?.[k]));
  if (key) return pl[key];
  if (typeof pl === 'object') {
    const values = Object.values(pl);
    if (Array.isArray(values[0])) return values[0];
  }
  return [];
});

const columns = computed(() => (rows.value[0] ? Object.keys(rows.value[0]) : []));
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <h2>Informe AdmGuia</h2>
    </div>
    <div class="col-12 md:col-6">
      <div class="p-inputgroup">
        <span class="p-inputgroup-addon">CC</span>
        <InputText v-model="cc" placeholder="Centro de costo" />
        <Button label="Consultar" icon="pi pi-search" @click="consultar" />
      </div>
    </div>

    <div class="col-12">
      <div v-if="loading" class="flex align-items-center gap-2">
        <ProgressSpinner style="width:30px;height:30px" strokeWidth="4" />
        <span>Cargando…</span>
      </div>
      <div v-else-if="error" class="p-error">
        {{ error }}
      </div>

      <div v-else-if="rows.length">
        <div class="overflow-auto">
          <table class="p-datatable-table" :aria-label="`Informe AdmGuia: resultados para centro de costo ${cc}`">
            <caption>
              Informe AdmGuia: resultados para centro de costo {{ cc }}
            </caption>
            <thead>
              <tr>
                <th v-for="col in columns" :key="col">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, idx) in rows" :key="idx">
                <td v-for="col in columns" :key="col">{{ String(row?.[col] ?? '') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else-if="payload">
        <pre class="app-code"><code>{{ JSON.stringify(payload, null, 2) }}</code></pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.p-inputgroup {
  width: 100%;
}
.overflow-auto { max-width: 100%; }
.p-datatable-table { width: 100%; border-collapse: collapse; }
.p-datatable-table th, .p-datatable-table td { border: 1px solid var(--surface-border); padding: .5rem; }
</style>
