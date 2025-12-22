import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
    const isProduction = mode === 'production';
    console.log('option', mode);

    return {
        plugins: [vue()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },
        css: {
            preprocessorOptions: {
                scss: {
                    quietDeps: true
                }
            }
        },
        define: {
            // Aquí, seleccionamos el archivo .env correspondiente según el modo
            __APP_ENV__: JSON.stringify(
                isProduction ? process.env.production : process.env
            ),
        },
        // Servir bajo la raíz. Si se despliega bajo subcarpeta, ajustar aquí.
        publicPath: '/app_trazabilidad_hub',
        base: '/app_trazabilidad_hub',
        build: {
            chunkSizeWarningLimit: 100000,
        }
    };

});
