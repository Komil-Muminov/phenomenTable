import { _axios } from '@shared/config';
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

interface IUseGetQueryOptions<TRequest, TResponse, TSelect> {
    url: string;
    method?: 'GET' | 'POST';
    params?: TRequest;
    options?: Partial<UseQueryOptions<TResponse, unknown, TSelect>>;
}

/** Обёртка над useQuery: GET шлёт params в query-string, POST — в body. Токен ставит interceptor */
export const useGetQuery = <TRequest = unknown, TResponse = unknown, TSelect = TResponse>(
    options: IUseGetQueryOptions<TRequest, TResponse, TSelect>,
): UseQueryResult<TSelect, unknown> => {
    const { url, params, method = 'POST', options: queryOptions } = options;

    return useQuery<TResponse, unknown, TSelect>({
        queryKey: [url, method, params],
        queryFn: async ({ signal }) => {
            const response = await _axios.request<TResponse>({
                url,
                method,
                signal,
                [method === 'POST' ? 'data' : 'params']: params ?? {},
            });
            return response.data;
        },
        ...queryOptions,
    });
};
