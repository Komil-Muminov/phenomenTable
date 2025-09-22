import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 3000,
    },
    resolve: {
        // alias: {
        //     '@ui': path.resolve(__dirname, './src/shared/ui/index'),
        //     '@hooks': path.resolve(__dirname, './src/shared/lib/index'),
        //     '@utils': path.resolve(__dirname, './src/shared/lib/utils/index'),
        //     '@': path.resolve(__dirname, './src/shared/lib/index'),
        //     '@config': path.resolve(__dirname, './src/shared/config/index'),
        //     '@types': path.resolve(__dirname, './src/shared/types/index'),
        //     '@entities': path.resolve(__dirname, './src/entities/'),
        //     '@widgets': path.resolve(__dirname, './src/widgets/'),
        //     '@features': path.resolve(__dirname, './src/features/'),
        //     '@lib': path.resolve(__dirname, './src/shared/lib/index'),
        // },
    },
});
