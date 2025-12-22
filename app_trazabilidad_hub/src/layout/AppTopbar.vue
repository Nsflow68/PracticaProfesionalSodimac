<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useLayout } from '@/layout/composables/layout';
import { useRouter } from 'vue-router';
import keycloak from '@/keycloak';

const { onMenuToggle } = useLayout();

const outsideClickListener = ref(null);
const topbarMenuActive = ref(false);
const router = useRouter();
const name = import.meta.env.VITE_APP_PROYECT;

const topbarBackground = import.meta.env.VITE_APP_TOPBAR_BACKGROUND;
const topbarIconColor = import.meta.env.VITE_APP_TOPBAR_ICON_COLOR;

onMounted(() => {
    bindOutsideClickListener();
});

onBeforeUnmount(() => {
    unbindOutsideClickListener();
});

const logoUrl = computed(() => {
    return import.meta.env.VITE_APP_RUTA_IMAGES + `/favicon.ico`;
});

const onSettingsClick = async () => {
    topbarMenuActive.value = false;
    localStorage.removeItem('usuario_sbs');
    keycloak.logout();
};
const topbarMenuClasses = computed(() => {
    return {
        'layout-topbar-menu-mobile-active': topbarMenuActive.value
    };
});

const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                topbarMenuActive.value = false;
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};
const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
};
const isOutsideClicked = (event) => {
    if (!topbarMenuActive.value) return;

    const sidebarEl = document.querySelector('.layout-topbar-menu');
    const topbarEl = document.querySelector('.layout-topbar-menu-button');

    return !(sidebarEl.isSameNode(event.target) || sidebarEl.contains(event.target) || topbarEl.isSameNode(event.target) || topbarEl.contains(event.target));
};
</script>

<template>
    <div class="layout-topbar" :style="{ backgroundColor: `#${topbarBackground}` }">
        <router-link to="/" class="layout-topbar-logo">
            <img :src="logoUrl" alt="logo" />
            <span :style="{ color: `#${topbarIconColor}` }">{{ name }}</span>
        </router-link>

        <button class="p-link layout-menu-button layout-topbar-button" @click="onMenuToggle()" :style="{ color: `#${topbarIconColor}` }">
            <i class="pi pi-bars"></i>
        </button>
        <div class="layout-topbar-menu" :class="topbarMenuClasses">
            <button @click="onSettingsClick()" class="p-link layout-topbar-button" :style="{ color: `#${topbarIconColor}` }">
                <i class="pi pi-sign-out"></i>
            </button>
        </div>
        <div class="layout-topbar-menu-button" :class="topbarMenuClasses">
            <button @click="onSettingsClick()" class="p-link layout-topbar-button" :style="{ color: `#${topbarIconColor}` }">
                <i class="pi pi-sign-out"></i>
            </button>
        </div>
    </div>
</template>
