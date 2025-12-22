import { createRouter, createWebHashHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';
const tienePermisos = (permisosRequeridos, permisosUsuario) => {
    return permisosRequeridos.some(permiso => permisosUsuario.includes(permiso));
};

const routes = [

    {
        path: ' ',
        name: 'login',
        component: () => import('@/views/pages/auth/Login.vue')
    },
];
const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        
        {
            path: ' ',
            redirect: '/traza-operacional'
        },

        {
            path: ' ',
            component: AppLayout,
            children: [
                {
                    path: ' ',
                    name: 'Dispatch',
                    component: () => import('@/views/pages/Dispatch.vue')
                }
            ]
        },
        {
            path: ' ',
            component: AppLayout,
            children: [
                {
                    path: ' ',
                    name: 'Despacho',
                    component: () => import('@/views/pages/Dispatch.vue')
                }
            ]
        },
        {
            path: ' ',
            component: AppLayout,
            children: [
                {
                    path: ' ',
                    name: 'TrazaOperacional',
                    component: () => import('@/views/pages/TrazaOperacional.vue')
                }
            ]
        },
        {
            path: ' ',
            component: AppLayout,
            children: [
                {
                    path: ' ',
                    name: 'AdmGuia',
                    component: () => import('@/views/pages/AdmGuia.vue')
                }
            ]
        },
        {
            path: ' ',
            component: AppLayout,
            children: [
                {
                    path: ' ',
                    name: 'Recepcion',
                    component: () => import('@/views/pages/Recepcion.vue')
                }
            ]
        },
        
        {
            path: ' ',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
    ],
    async beforeRouteUpdate(to, from) {
        console.log(to, from);
    },
});
router.beforeEach((to, from, next) => {
    if (to.fullPath.startsWith('/&')) {
        next('/login');
        return;
    }
    const rutaActual = to.matched[0];
    let permisos;

    try {
        permisos = JSON.parse(localStorage.getItem('usuario_recep'));
    } catch (error) {
        console.log(localStorage.getItem('usuario_recep'))
        console.log(error)
    }
    if (rutaActual && rutaActual.path !== '/') {
        if (rutaActual.meta.requiredPermissions) {
            if (!permisos) {
                console.error('Permisos no encontrados en localStorage');
                next('/login');
                return;
            }
            if (tienePermisos(rutaActual.meta.requiredPermissions, permisos.perfil[0].permissions)) {
                next();
            } else {
                console.error('Acceso no autorizado');
                next('/login');
            }
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;
