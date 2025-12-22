<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed } from 'vue';

const { layoutConfig } = useLayout();

const logoUrl = computed(() => {
    return import.meta.env.VITE_APP_RUTA_IMAGES + `/favicon.ico`;
});
</script>

<template>
    <div class="layout-footer">
        <img :src="logoUrl" alt="Logo" height="20" class="mr-2" />
        Desarrollado por
        <span class="font-medium ml-2">Teams DDA</span>
    </div>
</template>
