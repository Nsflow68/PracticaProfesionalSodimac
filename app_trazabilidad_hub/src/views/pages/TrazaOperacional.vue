<script setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import SelectButton from 'primevue/selectbutton';
import Dropdown from 'primevue/dropdown';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import axios from 'axios';
import { useAuthTokenStore } from '@/store/authTokenStore';

const loading = ref(false);
const error = ref(null);
const data = ref(null);
const view = ref('detalle');
const groupKey = ref('ESTADO_PALLET');
const hubFilter = ref('');
const whse = ref('Todos');

const viewOptions = [
  { label: 'Detalle', value: 'detalle' },
  { label: 'Resumen', value: 'resumen' },
  { label: 'Matriz', value: 'matriz' }
];

const whseOptions = [
  { label: 'Todos', value: 'Todos' },
  { label: '221', value: '221' },
  { label: '20', value: '20' },
  { label: '21', value: '21' },
  { label: '25', value: '25' },
  { label: '1902', value: '1902' }
];

const getURL = () => {
  return `https://hansolo.dda.sodimac.cl:7007/inicioLogicaPanelTrazaOperacional?cc=${whse.value}&fecha_d=1&fecha_i=1`;
};

const extractRows = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  const candidates = ['rows', 'data', 'items', 'result', 'payload'];
  const foundKey = candidates.find((key) => Array.isArray(payload?.[key]));
  if (foundKey) return payload[foundKey];
  if (typeof payload === 'object') {
    const values = Object.values(payload);
    if (Array.isArray(values[0])) return values[0];
  }
  return [];
};

const rows = computed(() => extractRows(data.value));
const authTokenStore = useAuthTokenStore();
const { token } = storeToRefs(authTokenStore);

const getAuthHeaders = () => {
  if (!token.value) return null;
  return { Authorization: `Bearer ${token.value}` };
};

const availableKeys = computed(() => {
  const first = rows.value[0] || {};
  const keys = Object.keys(first);
  const desired = ['ESTADO_PALLET', 'UBICACION_PH', 'HUB'];
  return desired.filter((k) => keys.includes(k));
});

const hubs = computed(() => {
  if (!rows.value.length) return [];
  const set = new Set(rows.value.map((r) => r?.HUB).filter(Boolean));
  return Array.from(set).map(h => ({ label: String(h), value: String(h) }));
});

const groupOptions = computed(() => {
  return availableKeys.value.map(k => ({ label: k, value: k }));
});

const grouped = computed(() => {
  const source = hubFilter.value ? 
    rows.value.filter((r) => String(r?.HUB) === String(hubFilter.value)) : 
    rows.value;
  const total = source.length || 1;
  const counts = new Map();
  
  source.forEach((r) => {
    const key = r?.[groupKey.value] ?? '(sin dato)';
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  
  const result = Array.from(counts.entries()).map(([key, count]) => ({
    key,
    count,
    pct: +(count * 100 / total).toFixed(2),
  }));
  
  result.sort((a, b) => b.count - a.count);
  return { total, data: result };
});


const matrixColumnKeys = computed(() => {
  if (!rows.value.length) return [];
  const set = new Set(rows.value.map((r) => r?.[groupKey.value] ?? '(sin dato)'));
  const arr = Array.from(set).map((v) => String(v));
  arr.sort((a, b) => a.localeCompare(b));
  return arr;
});

const matrixRows = computed(() => {
  if (!rows.value.length) return [];
  const hubsSet = new Set(rows.value.map((r) => r?.HUB).filter(Boolean).map((h) => String(h)));
  const out = [];
  hubsSet.forEach((hub) => {
    const bucket = rows.value.filter((r) => String(r?.HUB) === hub);
    const obj = { HUB: hub };
    matrixColumnKeys.value.forEach((col) => {
      const count = bucket.reduce((acc, r) => acc + (String(r?.[groupKey.value] ?? '(sin dato)') === col ? 1 : 0), 0);
      obj[col] = count;
    });
    obj.Total = bucket.length;
    out.push(obj);
  });
  
  out.sort((a, b) => (b.Total || 0) - (a.Total || 0));
  return out;
});

const matrixTotals = computed(() => {
  const totals = { HUB: 'Total' };
  matrixColumnKeys.value.forEach((col) => {
    totals[col] = matrixRows.value.reduce((acc, row) => acc + (row[col] || 0), 0);
  });
  totals.Total = matrixRows.value.reduce((acc, row) => acc + (row.Total || 0), 0);
  return totals;
});

const consultar = async () => {
  loading.value = true;
  error.value = null;
  data.value = null;
  const headers = getAuthHeaders();
  if (!headers) {
    error.value = 'Sesion expirada. Inicia sesion nueva.';
    loading.value = false;
    return;
  }
  try {
    const url = getURL();
    const response = await axios.post(url, {}, {
      headers: { 'Content-Type': 'application/json', ...headers },
      timeout: 20000,
    });
    data.value = response?.data ?? response;
  } catch (err) {
    console.error('Error al consultar Traza Operacional', err);
    error.value = 'No se pudo obtener la información';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <h2>Traza Operacional</h2>
    </div>

    
    <div class="col-12">
      <div class="flex flex-wrap align-items-center gap-3 mb-3">
        <div class="field">
          <label for="whse" class="block text-sm font-medium mb-1">Warehouse</label>
          <Dropdown 
            id="whse"
            v-model="whse" 
            :options="whseOptions" 
            optionLabel="label" 
            optionValue="value"
            placeholder="Seleccionar warehouse"
            class="w-full md:w-10rem"
          />
        </div>
        
        <div class="flex align-items-end">
          <Button 
            label="Consultar" 
            icon="pi pi-refresh" 
            @click="consultar" 
            :disabled="loading"
          />
        </div>
        
        <ProgressSpinner 
          v-if="loading" 
          style="width:24px;height:24px" 
          strokeWidth="4" 
        />
        
        <SelectButton 
          v-model="view" 
          :options="viewOptions" 
          optionLabel="label" 
          optionValue="value"
        />
      </div>
      
      <div v-if="error" class="p-message p-message-error mb-3">
        <div class="p-message-wrapper">
          <div class="p-message-icon pi pi-times-circle"></div>
          <div class="p-message-text">{{ error }}</div>
        </div>
      </div>
    </div>

    
    <div v-if="data && view === 'detalle'" class="col-12">
      <div class="card">
        <h5>Resultado</h5>
        <pre class="app-code"><code>{{ JSON.stringify(data, null, 2) }}</code></pre>
      </div>
    </div>

    
    <div v-if="rows.length > 0 && view === 'resumen'" class="col-12">
      <div class="card">
        <h5>Resumen por agrupación</h5>
        
        
        <div class="flex flex-wrap gap-3 mb-3">
          <div class="field">
            <label for="groupBy" class="block text-sm font-medium mb-1">Agrupar por</label>
            <Dropdown 
              id="groupBy"
              v-model="groupKey" 
              :options="groupOptions" 
              optionLabel="label" 
              optionValue="value"
              placeholder="Seleccionar agrupación"
              class="w-full md:w-14rem"
            />
          </div>
          
          <div class="field">
            <label for="hubFilter" class="block text-sm font-medium mb-1">Filtrar HUB</label>
            <Dropdown 
              id="hubFilter"
              v-model="hubFilter" 
              :options="[{ label: '(Todos)', value: '' }, ...hubs]" 
              optionLabel="label" 
              optionValue="value"
              placeholder="Seleccionar HUB"
              class="w-full md:w-14rem"
            />
          </div>
        </div>

        <p class="text-sm text-600 mb-3">
          Total registros: {{ grouped.total }}
        </p>

        
        <DataTable 
          :value="grouped.data" 
          :paginator="true" 
          :rows="10"
          responsiveLayout="scroll"
          class="p-datatable-sm"
          :aria-label="`Distribución por ${groupKey} (whse ${whse})`"
        >
          <Column field="key" header="Grupo" sortable></Column>
          <Column field="count" header="Conteo" sortable>
            <template #body="slotProps">
              <span class="font-semibold">{{ slotProps.data.count }}</span>
            </template>
          </Column>
          <Column field="pct" header="Porcentaje" sortable>
            <template #body="slotProps">
              <span class="text-primary">{{ slotProps.data.pct }}%</span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    
    <div v-if="rows.length > 0 && view === 'matriz'" class="col-12">
      <div class="card">
        <h5>Matriz HUB × Variable</h5>

        
        <div class="flex flex-wrap gap-3 mb-3">
          <div class="field">
            <label for="groupByMatrix" class="block text-sm font-medium mb-1">Columnas (variable)</label>
            <Dropdown 
              id="groupByMatrix"
              v-model="groupKey" 
              :options="groupOptions" 
              optionLabel="label" 
              optionValue="value"
              placeholder="Seleccionar variable"
              class="w-full md:w-14rem"
            />
          </div>
        </div>

        <p class="text-sm text-600 mb-3">
          Hubs: {{ matrixRows.length }} · Columnas: {{ matrixColumnKeys.length }} · Total registros: {{ matrixTotals.Total }}
        </p>

        <div class="overflow-auto">
          <table class="p-datatable-table p-datatable-sm" style="min-width: 900px;" :aria-label="`Matriz HUB × ${groupKey} (whse ${whse})`">
            <caption>
              Matriz HUB × {{ groupKey }} (whse {{ whse }})
            </caption>
            <thead>
              <tr>
                <th>HUB</th>
                <th v-for="col in matrixColumnKeys" :key="`mcol-${col}`">{{ col }}</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in matrixRows" :key="`mrow-${row.HUB}`">
                <td>{{ row.HUB }}</td>
                <td v-for="col in matrixColumnKeys" :key="`mcell-${row.HUB}-${col}`">{{ row[col] ?? 0 }}</td>
                <td>{{ row.Total ?? 0 }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td>{{ matrixTotals.HUB }}</td>
                <td v-for="col in matrixColumnKeys" :key="`mtotal-${col}`" class="font-semibold">{{ matrixTotals[col] ?? 0 }}</td>
                <td class="font-semibold">{{ matrixTotals.Total ?? 0 }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.p-inputgroup {
  width: 100%;
}
</style>
