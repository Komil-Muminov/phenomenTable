import { useCallback, useEffect, useRef, useState } from 'react';

import { getErrorMessage } from '../../lib/api/getErrorMessage';
import { toast } from '../Toast';

import type { TableActionItem } from './types';

/**
 * Запускает действие: показывает лоадер для асинхронных,
 * ловит ошибки (и sync, и async) и показывает их тостом.
 */
export const useActionRunner = <RecordType>(record: RecordType) => {
    const [loadingKeys, setLoadingKeys] = useState<Record<string, boolean>>({});
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const setLoading = useCallback((key: string, value: boolean) => {
        if (mountedRef.current) setLoadingKeys((prev) => ({ ...prev, [key]: value }));
    }, []);

    const run = useCallback(
        // true — действие выполнилось без ошибок
        async (action: TableActionItem<RecordType>, key: string, event?: React.MouseEvent): Promise<boolean> => {
            if (!action.onClick) return false;
            try {
                const result = action.onClick(record, event);
                if (result && typeof (result as PromiseLike<unknown>).then === 'function') {
                    setLoading(key, true);
                    await result;
                }
                return true;
            } catch (error) {
                console.error(`Ошибка действия "${key}":`, error);
                toast.error('Не удалось выполнить действие', { description: getErrorMessage(error, '') || undefined });
                return false;
            } finally {
                setLoading(key, false);
            }
        },
        [record, setLoading],
    );

    const isLoading = useCallback((key: string) => Boolean(loadingKeys[key]), [loadingKeys]);

    return { run, isLoading };
};
