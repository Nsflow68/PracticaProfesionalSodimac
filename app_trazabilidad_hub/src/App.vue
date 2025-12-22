<script setup>
import { onBeforeMount } from 'vue';
import { usePrimeVue } from "primevue/config";

onBeforeMount(() => {
    changeToSpanish();
});
const changeToSpanish = () => {
    const primevue = usePrimeVue();
    primevue.config.locale.startsWith = "Empieza por";
    primevue.config.locale.contains = "Contiene";
    primevue.config.locale.notContains = "No contiene";
    primevue.config.locale.equals = "Igual";
    primevue.config.locale.notEquals = "No es igual";
    primevue.config.locale.noFilter = "No filtrar";
    primevue.config.locale.dateIs = "Fecha es";
    primevue.config.locale.endsWith = "Termina en";
    primevue.config.locale.matchAll = "Traer todos";
    primevue.config.locale.matchAny = "Traer los que coinciden";
    primevue.config.locale.addRule = "Añadir regla";
    primevue.config.locale.clear = "Limpiar";
    primevue.config.locale.apply = "Aplicar";
    primevue.config.locale.dayNames = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    primevue.config.locale.dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    primevue.config.locale.dayNamesMin = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
    primevue.config.locale.monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Octube', 'Noviembre', 'Diciembre'];
    primevue.config.locale.monthNamesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    primevue.config.locale.dateFormat = 'dd/mm/yyyy';
    primevue.config.locale.emptyMessage = 'Vacio';
    primevue.config.locale.emptyFilterMessage = 'Sin resultados';
    primevue.config.locale.emptySelectionMessage = 'Sin elementos seleccionados';
    primevue.config.locale.emptySearchMessage = 'Sin resultados';
}
</script>

<template>
    <router-view />
</template>
