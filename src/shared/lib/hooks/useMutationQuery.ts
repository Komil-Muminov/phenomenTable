import { useMutation, UseMutationOptions, useQueryClient, MutationFunctionContext } from '@tanstack/react-query';
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
    queryOptions?: UseMutationOptions<TResponse, unknown, TRequest, MutationFunctionContext>;
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
        [url, method, queryParams],
    );

    return useMutation({
        mutationFn,
        ...queryOptions,
        onSuccess: (data, variables, context) => {
            if (messages?.success) {
                toast.success(messages.success);
            }

            messages?.cb?.(data);
            queryOptions?.onSuccess?.(data, variables, undefined, context);
            if (messages?.invalidate) {
                queryClient.invalidateQueries({ queryKey: messages.invalidate });
                queryClient.refetchQueries({ queryKey: messages.invalidate });
            }
        },
        onError: (error: any, variables, context) => {
            let errorMessage = 'Произошла ошибка';

            if (error?.response?.data?.Message) {
                errorMessage = error.response.data.Message;
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            if (!messages?.error) {
                toast.error(errorMessage);
            }

            queryOptions?.onError?.(error, variables, undefined, context);
        },
    });
};
