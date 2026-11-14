import { isAxiosError } from 'axios';

const DEFAULT_ERROR = 'Произошла ошибка при запросе';

// Бэкенд отдаёт текст ошибки то в Message, то в message
const pickMessage = (data: unknown): string | undefined => {
    if (typeof data === 'string' && data.trim()) return data;
    if (typeof data !== 'object' || data === null) return undefined;

    const record = data as Record<string, unknown>;
    const value = record.Message ?? record.message ?? record.error;
    return typeof value === 'string' && value.trim() ? value : undefined;
};

/** Достаёт человекочитаемый текст из любой ошибки */
export const getErrorMessage = (error: unknown, fallback = DEFAULT_ERROR): string => {
    if (isAxiosError(error)) {
        if (!error.response) return 'Нет соединения с сервером';
        return pickMessage(error.response.data) ?? fallback;
    }
    if (error instanceof Error && error.message) return error.message;
    return pickMessage(error) ?? fallback;
};
