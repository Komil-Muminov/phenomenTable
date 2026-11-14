import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import { getErrorMessage } from './getErrorMessage';

const axiosError = (data: unknown, withResponse = true) =>
    new AxiosError(
        'Request failed',
        'ERR',
        undefined,
        undefined,
        withResponse
            ? { data, status: 400, statusText: 'Bad', headers: {}, config: { headers: new AxiosHeaders() } }
            : undefined,
    );

describe('getErrorMessage', () => {
    it('берёт Message или message из ответа', () => {
        expect(getErrorMessage(axiosError({ Message: 'Нет прав' }))).toBe('Нет прав');
        expect(getErrorMessage(axiosError({ message: 'Плохой запрос' }))).toBe('Плохой запрос');
    });

    it('сообщает про отсутствие соединения', () => {
        expect(getErrorMessage(axiosError(null, false))).toBe('Нет соединения с сервером');
    });

    it('использует fallback для пустого ответа', () => {
        expect(getErrorMessage(axiosError({}), 'Свой текст')).toBe('Свой текст');
    });

    it('работает с обычными Error и строками', () => {
        expect(getErrorMessage(new Error('boom'))).toBe('boom');
        expect(getErrorMessage('текст')).toBe('текст');
    });
});
