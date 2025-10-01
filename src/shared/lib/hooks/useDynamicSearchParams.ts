import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo, useRef } from 'react';

type ValueType = string | number | boolean | null | undefined;

interface UseDynamicSearchParamsReturn {
    paramsString: string;
    params: Record<string, string>;
    setParams: (key: string | Record<string, ValueType>, value?: ValueType) => void;
    deleteParams: (keys: string | string[]) => void;
    batchSetParams: (updates: Record<string, ValueType>) => void;
}

/**
 * Оптимизированный хук для работы с URL параметрами
 * - Батчинг обновлений (избегает множественных навигаций)
 * - Мемоизация парсинга
 * - Стабильные ссылки на функции
 */
export const useDynamicSearchParams = (scope?: string): UseDynamicSearchParamsReturn => {
    const [searchParams, setSearchParams] = useSearchParams();
    const batchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingUpdatesRef = useRef<Record<string, ValueType>>({});

    // Мемоизируем парсинг params в объект
    const params = useMemo(() => {
        let paramsObject: Record<string, string> = Object.fromEntries([...searchParams]);

        if (scope) {
            paramsObject = Object.fromEntries(
                Object.keys(paramsObject).map((key) => [key.replace(/^.*?-/, ''), paramsObject[key]]),
            );
        }

        return paramsObject;
    }, [searchParams, scope]);

    const paramsString = useMemo(() => searchParams.toString(), [searchParams]);

    // Батчинг обновлений - применяем все изменения одним вызовом
    const flushPendingUpdates = useCallback(() => {
        if (Object.keys(pendingUpdatesRef.current).length === 0) return;

        const updates = { ...pendingUpdatesRef.current };
        pendingUpdatesRef.current = {};

        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);

            Object.entries(updates).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    newParams.set(key, String(value));
                } else {
                    newParams.delete(key);
                }
            });

            return newParams;
        });
    }, [setSearchParams]);

    // Batch update с debounce
    const batchSetParams = useCallback(
        (updates: Record<string, ValueType>) => {
            Object.assign(pendingUpdatesRef.current, updates);

            if (batchTimeoutRef.current) {
                clearTimeout(batchTimeoutRef.current);
            }

            batchTimeoutRef.current = setTimeout(flushPendingUpdates, 0);
        },
        [flushPendingUpdates],
    );

    // Установка одного или нескольких параметров
    const setParams = useCallback(
        (key: string | Record<string, ValueType>, value?: ValueType) => {
            if (typeof key === 'string') {
                batchSetParams({ [key]: value });
            } else {
                batchSetParams(key);
            }
        },
        [batchSetParams],
    );

    // Удаление параметров
    const deleteParams = useCallback(
        (keys: string | string[]) => {
            const keysArray = Array.isArray(keys) ? keys : [keys];
            const updates = keysArray.reduce((acc, key) => {
                acc[key] = null;
                return acc;
            }, {} as Record<string, null>);

            batchSetParams(updates);
        },
        [batchSetParams],
    );

    return {
        paramsString,
        params,
        setParams,
        deleteParams,
        batchSetParams,
    };
};
