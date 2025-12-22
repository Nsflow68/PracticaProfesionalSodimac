<script setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import ProgressSpinner from 'primevue/progressspinner';
import axios from 'axios';
import { useAuthTokenStore } from '@/store/authTokenStore';


const whse = ref('221');
const loading = ref(false);
const error = ref(null);
const payload = ref(null);
const authTokenStore = useAuthTokenStore();
const { token } = storeToRefs(authTokenStore);


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
const hubKey = computed(() => {
  const prefs = ['HUB', 'hub', 'DESTINO', 'destino'];
  return prefs.find((k) => columns.value.includes(k)) || null;
});
const palletKey = computed(() => {
  const prefs = ['PALLET_VIRTUAL', 'pallet_virtual', 'PALLET', 'pallet'];
  return prefs.find((k) => columns.value.includes(k)) || null;
});
const dateKey = computed(() => {
  const prefs = ['FECHA', 'FECHA_RECEP', 'FECHA_CREACION', 'DATE', 'FECHA_PALLET'];
  return prefs.find((k) => columns.value.includes(k)) || null;
});


const parseDateToTimestamp = (value) => {
  if (value == null) return NaN;
  const s = String(value);
  let t = Date.parse(s);
  if (!Number.isNaN(t)) return t;
  const m = s.match(/(\d{2})[/-](\d{2})[/-](\d{4})/);
  if (m) return Date.parse(`${m[3]}-${m[2]}-${m[1]}T00:00:00`);
  const m2 = s.match(/(\d{4})(\d{2})(\d{2})/);
  if (m2) return Date.parse(`${m2[1]}-${m2[2]}-${m2[3]}T00:00:00`);
  return NaN;
};

const getDayKey = (v) => {
  const t = parseDateToTimestamp(v);
  if (Number.isNaN(t)) return '(sin día)';
  const d = new Date(t);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const hasSpanMoreThan24h = computed(() => {
  if (!dateKey.value || rows.value.length === 0) return false;
  const timestamps = rows.value
    .map((row) => parseDateToTimestamp(row[dateKey.value]))
    .filter((t) => Number.isFinite(t));
  if (timestamps.length === 0) return false;
  const min = Math.min(...timestamps);
  const max = Math.max(...timestamps);
  return (max - min) > 24 * 60 * 60 * 1000;
});


const groupedByHub = computed(() => {
  if (!hubKey.value) return [];
  const map = new Map();
  rows.value.forEach((row) => {
    const key = row[hubKey.value];
    const hv = key == null ? '(sin HUB)' : String(key);
    if (!map.has(hv)) map.set(hv, []);
    map.get(hv).push(row);
  });
  return Array.from(map.entries());
});

const groupedByDay = computed(() => {
  if (!dateKey.value) return [];
  const map = new Map();
  rows.value.forEach((row) => {
    const dk = getDayKey(row[dateKey.value]);
    if (!map.has(dk)) map.set(dk, []);
    map.get(dk).push(row);
  });
  return Array.from(map.entries());
});


const expanded = ref(new Set());
const expandedDays = ref(new Set());
const toggleHub = (hub) => {
  const next = new Set(expanded.value);
  if (next.has(hub)) next.delete(hub);
  else next.add(hub);
  expanded.value = next;
};
const toggleDay = (day) => {
  const next = new Set(expandedDays.value);
  if (next.has(day)) next.delete(day);
  else next.add(day);
  expandedDays.value = next;
};


const dispatchOpen = ref(false);
const dispatchHub = ref('');
const dispatchRows = ref([]);
const dispatchDay = ref('');
const dispatchOt = ref('');
const dispatchSello1 = ref('');
const dispatchSello2 = ref('');
const dispatchError = ref(null);
const dispatchSuccess = ref(null);
const dispatchLoading = ref(false);
const dispatchedHubs = ref(new Set());

const openDispatchDay = (day, rows) => {
  dispatchHub.value = '__ALL__';
  dispatchRows.value = rows;
  dispatchDay.value = day;
  dispatchOt.value = '';
  dispatchSello1.value = '';
  dispatchSello2.value = '';
  dispatchError.value = null;
  dispatchSuccess.value = null;
  dispatchOpen.value = true;
};
const openDispatch = (hub, rows) => {
  dispatchHub.value = hub;
  dispatchRows.value = rows;
  dispatchDay.value = getDayKey(rows[0]?.[dateKey.value]);
  dispatchOt.value = '';
  dispatchSello1.value = '';
  dispatchSello2.value = '';
  dispatchError.value = null;
  dispatchSuccess.value = null;
  dispatchOpen.value = true;
};
const closeDispatch = () => {
  dispatchOpen.value = false;
  dispatchHub.value = '';
  dispatchRows.value = [];
  dispatchOt.value = '';
  dispatchSello1.value = '';
  dispatchSello2.value = '';
  dispatchLoading.value = false;
  dispatchError.value = null;
  dispatchSuccess.value = null;
};

const BASE = 'https://kurama.dda.sodimac.cl:8443';
const URL_LIST = `${BASE}/getPalletVirtualProcesoCC`;
const URL_SAVE = `${BASE}/saveDataDespacho`;
const requireAuthHeader = () => {
  if (!token.value) return null;
  return { Authorization: `Bearer ${token.value}` };
};

const consultar = async () => {
  loading.value = true;
  error.value = null;
  payload.value = null;
  if (!token.value) {
    error.value = 'No hay token valido para consultar. Inicie sesion.';
    loading.value = false;
    return;
  }
  try {
    const url = `${URL_LIST}?cc=${encodeURIComponent(whse.value)}`;
    const res = await axios.get(url, {
      timeout: 15000,
      headers: requireAuthHeader(),
    });
    const data = res?.data;
    if (Array.isArray(data)) {
      payload.value = data;
    } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
      payload.value = data.data;
    } else {
      payload.value = data;
    }
  } catch (e) {
    error.value = e?.message || 'Error consultando despachos';
  } finally {
    loading.value = false;
  }
};

const submitDispatch = async () => {
  if (!dispatchHub.value) { dispatchError.value = 'Falta HUB.'; return; }
  if (!dispatchOt.value) { dispatchError.value = 'Ingresa la OT.'; return; }
  if (!dispatchSello1.value || !dispatchSello2.value) { dispatchError.value = 'Ingresa ambos sellos.'; return; }
  if (!palletKey.value) { dispatchError.value = 'No se encontró la columna PALLET_VIRTUAL.'; return; }
  const palletsRaw = dispatchRows.value.map((r) => r[palletKey.value]).filter((x) => x != null);
  const pallets = Array.from(new Set(palletsRaw.map((x) => String(x))));
  if (pallets.length === 0) { dispatchError.value = 'No se encontraron pallets en el HUB.'; return; }
  dispatchLoading.value = true;
  dispatchError.value = null;
  dispatchSuccess.value = null;
  if (!token.value) {
    dispatchError.value = 'Sesion expirada. Inicia sesion nuevamente.';
    dispatchLoading.value = false;
    return;
  }
  try {
    const usuario = localStorage.getItem('usuario') || 'INVITADO';
    const palletsParam = pallets.map((p) => `%27${encodeURIComponent(p)}%27`).join(',');
    const url = `${URL_SAVE}?cc=${encodeURIComponent(whse.value)}&ot=${encodeURIComponent(dispatchOt.value)}&pallets=${palletsParam}&sello1=${encodeURIComponent(dispatchSello1.value)}&sello2=${encodeURIComponent(dispatchSello2.value)}&usuario=${encodeURIComponent(usuario)}`;
    await axios.put(url, null, {
      timeout: 20000,
      headers: requireAuthHeader(),
    });
    
    const next = new Set(dispatchedHubs.value);
    if (dispatchHub.value === '__ALL__') {
      const hubs = new Set(dispatchRows.value.map((r) => {
        const hv = r[hubKey.value];
        return hv == null ? '(sin HUB)' : String(hv);
      }));
      hubs.forEach((h) => next.add(`${dispatchDay.value}||${h}`));
    } else {
      next.add(`${dispatchDay.value}||${dispatchHub.value}`);
    }
    dispatchedHubs.value = next;
    
    await consultar();
    closeDispatch();
  } catch (err) {
    dispatchError.value = err?.response?.data?.message || err?.message || 'Error despachando la OT';
  } finally {
    dispatchLoading.value = false;
  }
};
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <h2>Despacho</h2>
      <p>Consulta de pallets en proceso por centro de costo y despacho por HUB.</p>
    </div>

    <div class="col-12 md:col-6">
      <div class="p-inputgroup">
        <span class="p-inputgroup-addon">whse</span>
        <Dropdown v-model="whse" :options="['1902','20','25','221']" placeholder="Selecciona whse" />
        <Button label="Actualizar" icon="pi pi-refresh" @click="consultar" :disabled="loading" />
      </div>
    </div>

    <div class="col-12">
      <div class="flex align-items-center gap-2 mb-2">
        <span>Registros: {{ rows.length }}</span>
        <span>whse: {{ whse }}</span>
        <span v-if="loading"><ProgressSpinner style="width:20px;height:20px" strokeWidth="4" /></span>
      </div>
      <div v-if="error" class="p-error mb-2">{{ error }}</div>

      <div v-if="rows.length > 0">
        <div v-if="hubKey">
          <div v-if="hasSpanMoreThan24h">
            <table class="p-datatable-table" :aria-label="`Resumen por día de pallets en proceso (whse ${whse})`">
              <caption>
                Resumen por día de pallets en proceso (whse {{ whse }})
              </caption>
              <thead>
                <tr>
                  <th style="width:80px"></th>
                  <th>Día</th>
                  <th>Registros</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="([day, dayRows]) in groupedByDay" :key="`day-row-${day}`">
                  <td>
                    <Button size="small" @click="toggleDay(day)">{{ expandedDays.has(day) ? '▼' : '▶' }}</Button>
                  </td>
                  <td>{{ day }}</td>
                  <td>{{ dayRows.length }}</td>
                  <td>
                    <div class="flex gap-2">
                      <Button size="small" @click="toggleDay(day)">{{ expandedDays.has(day) ? 'Ocultar' : 'Ver detalles' }}</Button>
                      <Button size="small" severity="success" @click="openDispatchDay(day, dayRows)">Despachar todo el día</Button>
                    </div>
                  </td>
                </tr>
                <tr v-for="([day, dayRows]) in groupedByDay" :key="`day-collapse-${day}`">
                  <td :colspan="4" style="padding:0">
                    <div v-show="expandedDays.has(day)" class="p-2">
                      <table class="p-datatable-table" :aria-label="`Detalle por HUB para el día ${day}`">
                        <caption>
                          Detalle por HUB para el día {{ day }}
                        </caption>
                        <thead>
                          <tr>
                            <th style="width:80px"></th>
                            <th>HUB</th>
                            <th>Registros</th>
                            <th>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          <template v-for="([hub, hubRows]) in (function(){
                            const map = new Map();
                            dayRows.forEach((row) => {
                              const key = row[hubKey];
                              const hv = key == null ? '(sin HUB)' : String(key);
                              if (!map.has(hv)) map.set(hv, []);
                              map.get(hv).push(row);
                            });
                            return Array.from(map.entries());
                          })()" :key="`hub-row-${day}-${hub}`">
                            <tr>
                              <td>
                                <Button size="small" @click="toggleHub(`${day}||${hub}`)">{{ expanded.has(`${day}||${hub}`) ? '▼' : '▶' }}</Button>
                              </td>
                              <td>{{ hub }}</td>
                              <td>{{ hubRows.length }}</td>
                              <td>
                                <div class="flex gap-2">
                                  <Button size="small" @click="toggleHub(`${day}||${hub}`)">{{ expanded.has(`${day}||${hub}`) ? 'Ocultar' : 'Ver detalles' }}</Button>
                                  <Button size="small" severity="success" @click="openDispatch(hub, hubRows)">Despachar por HUB</Button>
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td :colspan="4" style="padding:0">
                                <div v-show="expanded.has(`${day}||${hub}`)" class="p-2">
                                  <table class="p-datatable-table" :aria-label="`Detalle de registros del HUB ${hub}`">
                                    <caption>
                                      Detalle de registros del HUB {{ hub }}
                                    </caption>
                                    <thead>
                                      <tr>
                                        <th v-for="c in columns" :key="`col-${day}-${hub}-${c}`">{{ c }}</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr v-for="(row, idx) in hubRows" :key="`row-${day}-${hub}-${idx}`">
                                        <td v-for="c in columns" :key="`cell-${day}-${hub}-${idx}-${c}`">{{ String(row?.[c] ?? '') }}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          </template>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else>
            <table class="p-datatable-table" :aria-label="`Resumen por HUB de pallets en proceso (whse ${whse})`">
              <caption>
                Resumen por HUB de pallets en proceso (whse {{ whse }})
              </caption>
              <thead>
                <tr>
                  <th style="width:80px"></th>
                  <th>HUB</th>
                  <th>Registros</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="([hub, hubRows]) in groupedByHub" :key="`hub-row-${hub}`">
                  <tr>
                    <td>
                      <Button size="small" @click="toggleHub(hub)">{{ expanded.has(hub) ? '▼' : '▶' }}</Button>
                    </td>
                    <td>{{ hub }}</td>
                    <td>{{ hubRows.length }}</td>
                    <td>
                      <div class="flex gap-2">
                        <Button size="small" @click="toggleHub(hub)">{{ expanded.has(hub) ? 'Ocultar' : 'Ver detalles' }}</Button>
                        <Button size="small" severity="success" @click="openDispatch(hub, hubRows)">Despachar por HUB</Button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td :colspan="4" style="padding:0">
                      <div v-show="expanded.has(hub)" class="p-2">
                        <table class="p-datatable-table" :aria-label="`Detalle de registros del HUB ${hub}`">
                          <caption>
                            Detalle de registros del HUB {{ hub }}
                          </caption>
                          <thead>
                            <tr>
                              <th v-for="c in columns" :key="`col-${hub}-${c}`">{{ c }}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(row, idx) in hubRows" :key="`row-${hub}-${idx}`">
                              <td v-for="c in columns" :key="`cell-${hub}-${idx}-${c}`">{{ String(row?.[c] ?? '') }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
        <div v-else>
          <div class="overflow-auto">
            <table class="p-datatable-table" :aria-label="`Listado de registros en proceso (whse ${whse})`">
              <caption>
                Listado de registros en proceso (whse {{ whse }})
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
      </div>
    </div>

    <Dialog v-model:visible="dispatchOpen" :modal="true" :style="{ width: '32rem' }">
      <template #header>
        <span>Despachar por HUB</span>
      </template>
      <div>
        <div v-if="dispatchError" class="p-error mb-2">{{ dispatchError }}</div>
        <div v-if="dispatchSuccess" class="p-success mb-2">{{ dispatchSuccess }}</div>
        <div class="flex flex-column gap-2">
          <span>HUB: {{ dispatchHub === '__ALL__' ? 'Todos del día' : dispatchHub }}</span>
          <span>Pallets en HUB: {{ dispatchRows.length }}</span>
          <InputText v-model="dispatchOt" placeholder="OT" />
          <InputText v-model="dispatchSello1" placeholder="Sello 1" />
          <InputText v-model="dispatchSello2" placeholder="Sello 2" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" @click="closeDispatch" :disabled="dispatchLoading" />
        <Button label="Despachar" severity="success" @click="submitDispatch" :disabled="dispatchLoading" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.p-inputgroup { width: 100%; }
.overflow-auto { max-width: 100%; }
.p-datatable-table { width: 100%; border-collapse: collapse; }
.p-datatable-table th, .p-datatable-table td { border: 1px solid var(--surface-border); padding: .5rem; }
</style>
