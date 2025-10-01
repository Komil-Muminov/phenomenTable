import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenControl } from './tokenControl';
// import { ENV } from './env';
import { ENV } from './env';
import { toast } from 'react-toastify';
import { queryClient } from './queryClient';
import { AppRoutes } from './AppRoutes';
// import { AppRoutes } from './AppRoutes';
// import { queryClient } from
export const _axios = axios.create({
    baseURL: ENV.API_URL as string,
});

_axios.interceptors.request.use((config: InternalAxiosRequestConfig<unknown>) => {
    const token = tokenControl.get();
    config.headers.set('Authorization', `Bearer ${token}`);
    config.headers.set('Access-Control-Allow-Origin', '*');

    return config;
});

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig<unknown> {
    suppressErrorToast?: boolean;
    invalidateQueriesKey?: string[] | undefined;
}

_axios.interceptors.response.use(
    async (response) => {
        const config = response.config as CustomAxiosRequestConfig;

        // Если передан ключ для инвалидации — вызываем queryClient.invalidateQueries с объектом { queryKey }
        if (config.invalidateQueriesKey) {
            await queryClient.invalidateQueries({
                queryKey: config.invalidateQueriesKey,
            });
        }

        return response;
    },

    async (error: AxiosError<any>) => {
        const config = error.config as CustomAxiosRequestConfig;

        toast.dismiss();

        if (!config?.suppressErrorToast) {
            await handleBadRequestErrors(error);
        }

        return Promise.reject(error);
    },
);

const handleBadRequestErrors = async (error: AxiosError) => {
    const response = error.response;

    if (!response) return;

    const { status, data } = response;

    const message =
        typeof data === 'object' && data !== null && 'Message' in data
            ? (data as any).Message
            : 'Произошла ошибка при запросе';

    if (status === 401) {
        toast.error('Пользователь не авторизован');
        tokenControl.remove();
        window.location.href = AppRoutes.MAIN_PAGE;
    } else if (status === 404) {
        toast.error(message || 'Данные не найдены');
    } else if (status >= 400) {
        toast.error(message);
    }
};
