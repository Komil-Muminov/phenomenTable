import tailwind from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import path from 'path';

export default defineConfig({
    plugins: [react(), tailwind()],
    build: {
        // antd сам по себе ~800 kB — это ожидаемо для отдельного вендор-чанка
        chunkSizeWarningLimit: 900,
        rollupOptions: {
            output: {
                // Тяжёлые вендоры отдельно: лучше кэшируются между релизами
                manualChunks: {
                    react: ['react', 'react-dom', 'react-router-dom'],
                    antd: ['antd'],
                    query: ['@tanstack/react-query', 'axios'],
                },
            },
        },
    },
    resolve: {
        alias: {
            '@app': path.resolve(__dirname, './src/app'),
            '@shared': path.resolve(__dirname, './src/shared'),
            '@entities': path.resolve(__dirname, './src/entities'),
            '@features': path.resolve(__dirname, './src/features'),
            '@pages': path.resolve(__dirname, './src/pages'),
            '@widgets': path.resolve(__dirname, './src/widgets'),
        },
    },
});
