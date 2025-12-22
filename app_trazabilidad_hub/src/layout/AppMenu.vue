<script setup>
import { ref } from 'vue';
import AppMenuItem from './AppMenuItem.vue';

const permisos = JSON.parse(localStorage.getItem('usuario_sbs'));
console.log(permisos, 'permisos');

const items = [
    { label: 'Traza Operacional', icon: 'pi pi-fw pi-search', to: '/traza-operacional' },
    { label: 'AdmGuia', icon: 'pi pi-fw pi-file', to: '/administrar-guia' },
    { label: 'Recepción', icon: 'pi pi-fw pi-download', to: '/recepcion' },
    { label: 'Despacho', icon: 'pi pi-fw pi-truck', to: '/dispatch' }
];

const model = ref([
    {
        label: 'Operaciones',
        items
    }
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>
