import { _axios } from '@shared/config';
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useCallback } from 'react';
import { tokenControl } from '../../config/tokenControl';

interface IUseGetQueryOptions<TRequest = any, TResponse = any, TSelect = any> {
    url: string;
    method?: 'GET' | 'POST';
    params?: TRequest;
    useToken?: boolean; // Опция для добавления токена
    options?: Partial<UseQueryOptions<TResponse, unknown, TSelect>>;
}

export const useGetQuery = <TRequest = any, TResponse = any, TSelect = TResponse>(
    options: IUseGetQueryOptions<TRequest, TResponse, TSelect>,
) => {
    const { url, params, method = 'POST', useToken = false, options: queryOptions } = options;

    const queryFn = useCallback(async () => {
        const headers: Record<string, string> = {};
        if (useToken) {
            const token = tokenControl.get();
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }
        }

        const response = await _axios<TResponse>(url, {
            method,
            headers, // для токена
            [method === 'POST' ? 'data' : 'params']: params ?? {},
        });

        return response.data;
    }, [url, params, useToken]);

    return useQuery({ queryFn, queryKey: [url, params, useToken], ...queryOptions }) as UseQueryResult<
        TSelect,
        unknown
    >;
};
