import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { getErrorMessage } from '../lib/api/getErrorMessage';
import { toast } from '../ui/Toast';

import { AppRoutes } from './AppRoutes';
import { ENV } from './env';
import { queryClient } from './queryClient';
import { tokenControl } from './tokenControl';

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig<unknown> {
    /** Не показывать тост ошибки (вызывающий код покажет сам). 401 обрабатывается всегда */
    suppressErrorToast?: boolean;
    invalidateQueriesKey?: string[];
}

declare module 'axios' {
    interface AxiosRequestConfig {
        suppressErrorToast?: boolean;
        invalidateQueriesKey?: string[];
    }
}

export const _axios = axios.create({
    baseURL: ENV.API_URL,
});

_axios.interceptors.request.use((config) => {
    const token = tokenControl.get();
    // Без токена заголовок не шлём, чтобы не улетал «Bearer null»
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
    return config;
});

const handleUnauthorized = () => {
    tokenControl.remove();
    queryClient.clear();
    if (window.location.pathname !== AppRoutes.MAIN_PAGE) {
        window.location.href = AppRoutes.MAIN_PAGE;
    }
};

_axios.interceptors.response.use(
    async (response) => {
        const config = response.config as CustomAxiosRequestConfig;
        if (config.invalidateQueriesKey) {
            await queryClient.invalidateQueries({ queryKey: config.invalidateQueriesKey });
        }
        return response;
    },
    (error: AxiosError) => {
        const config = error.config as CustomAxiosRequestConfig | undefined;
        const status = error.response?.status;

        if (status === 401) {
            // Один id — чтобы пачка параллельных 401 не завалила экран тостами
            toast.error('Сессия истекла', { id: 'auth-401', description: 'Войдите в систему заново' });
            handleUnauthorized();
        } else if (!config?.suppressErrorToast && !axios.isCancel(error)) {
            const fallback = status === 404 ? 'Данные не найдены' : undefined;
            toast.error(getErrorMessage(error, fallback));
        }

        return Promise.reject(error);
    },
);
