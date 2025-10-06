import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { _axios } from '@shared/config';

interface IUseMutationQueryOptions<TRequest = any, TResponse = any> {
    url: string;
    method: 'POST' | 'PUT' | 'DELETE';
    messages?: {
        success?: string;
        error?: string;
        invalidate?: string[];
        cb?: (data: TResponse) => void;
    };
    queryParams?: Record<string, any>;
    queryOptions?: Partial<UseMutationOptions<TResponse, unknown, TRequest, unknown>>;
}

export const useMutationQuery = <TRequest = any, TResponse = any>(
    options: IUseMutationQueryOptions<TRequest, TResponse>,
) => {
    const { url, method, messages, queryParams, queryOptions } = options;

    const queryClient = useQueryClient();

    const mutationFn = useCallback(
        async (data: TRequest) => {
            const response = await _axios<TResponse>({
                url,
                method,
                data,
                params: queryParams || undefined,
                suppressErrorToast: Boolean(messages?.error),
            } as any);

            return response.data;
        },
        [url, method, queryParams, messages?.error],
    );

    const originalOnSuccess = queryOptions?.onSuccess;
    const originalOnError = queryOptions?.onError;

    return useMutation<TResponse, unknown, TRequest, unknown>({
        mutationFn,
        ...queryOptions,
        onSuccess: (data, variables, context) => {
            if (messages?.success) {
                toast.success(messages.success);
            }

            messages?.cb?.(data);

            if (originalOnSuccess) {
                (originalOnSuccess as any)(data, variables, context);
            }

            if (messages?.invalidate) {
                queryClient.invalidateQueries({ queryKey: messages.invalidate });
                queryClient.refetchQueries({ queryKey: messages.invalidate });
            }
        },
        onError: (error, variables, context) => {
            let errorMessage = 'Произошла ошибка';

            if (error && typeof error === 'object') {
                const err = error as any;
                if (err?.response?.data?.Message) {
                    errorMessage = err.response.data.Message;
                } else if (err?.response?.data?.message) {
                    errorMessage = err.response.data.message;
                } else if (err?.message) {
                    errorMessage = err.message;
                }
            }

            if (!messages?.error) {
                toast.error(errorMessage);
            }

            if (originalOnError) {
                (originalOnError as any)(error, variables, context);
            }
        },
    });
};
