import { _axios } from '@shared/config';
import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';

import { toast } from '../../ui/Toast';
import { getErrorMessage } from '../api/getErrorMessage';

interface IUseMutationQueryOptions<TRequest, TResponse> {
    url: string;
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    messages?: {
        success?: string;
        /** Свой текст ошибки. Если не задан — берём текст с бэкенда */
        error?: string;
        invalidate?: string[];
        cb?: (data: TResponse) => void;
    };
    queryParams?: Record<string, unknown>;
    queryOptions?: Partial<UseMutationOptions<TResponse, unknown, TRequest, unknown>>;
}

export const useMutationQuery = <TRequest = unknown, TResponse = unknown>(
    options: IUseMutationQueryOptions<TRequest, TResponse>,
) => {
    const { url, method, messages, queryParams, queryOptions } = options;
    const queryClient = useQueryClient();

    return useMutation<TResponse, unknown, TRequest, unknown>({
        ...queryOptions,
        mutationFn: async (data: TRequest) => {
            const response = await _axios.request<TResponse>({
                url,
                method,
                data,
                params: queryParams,
                // Тост ошибки показываем здесь, а не в interceptor — иначе будет дубль
                suppressErrorToast: true,
            });
            return response.data;
        },
        // Аргументы колбэков пробрасываем как есть — сигнатура зависит от версии TanStack Query
        onSuccess: async (...args) => {
            const [data] = args;
            if (messages?.success) toast.success(messages.success);
            messages?.cb?.(data);
            await queryOptions?.onSuccess?.(...args);

            // invalidateQueries сам перезапрашивает активные запросы
            if (messages?.invalidate) {
                await queryClient.invalidateQueries({ queryKey: messages.invalidate });
            }
        },
        onError: async (...args) => {
            const [error] = args;
            const status = (error as { response?: { status?: number } })?.response?.status;
            // 401 уже обработан interceptor'ом
            if (status !== 401) {
                toast.error(messages?.error ?? getErrorMessage(error), {
                    description: messages?.error ? getErrorMessage(error, '') || undefined : undefined,
                });
            }
            await queryOptions?.onError?.(...args);
        },
    });
};
