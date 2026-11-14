import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

type ValueType = string | number | boolean | null | undefined;

interface UseDynamicSearchParamsReturn {
    paramsString: string;
    params: Record<string, string>;
    setParams: (key: string | Record<string, ValueType>, value?: ValueType) => void;
    deleteParams: (keys: string | string[]) => void;
    batchSetParams: (updates: Record<string, ValueType>) => void;
}

/**
 * Скоуп URL-параметров. Внутри провайдера все ключи пишутся как `${scope}-${key}`,
 * поэтому две таблицы на одной странице не перетирают друг другу фильтры и пагинацию.
 */
export const SearchParamsScopeContext = createContext<string | undefined>(undefined);

const isEmptyValue = (value: ValueType) => value === null || value === undefined || value === '';

/**
 * Хук для работы с URL-параметрами:
 * - батчинг: все изменения за тик применяются одной навигацией
 * - replace вместо push: фильтры не засоряют историю браузера
 * - поддержка скоупа (аргумент или SearchParamsScopeContext)
 */
export const useDynamicSearchParams = (scopeArg?: string): UseDynamicSearchParamsReturn => {
    const contextScope = useContext(SearchParamsScopeContext);
    const scope = scopeArg ?? contextScope;
    const prefix = scope ? `${scope}-` : '';

    const [searchParams, setSearchParams] = useSearchParams();
    const batchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingUpdatesRef = useRef<Record<string, ValueType>>({});
    // setSearchParams в react-router меняется при каждой смене URL — держим в ref ради стабильных колбэков
    const setSearchParamsRef = useRef(setSearchParams);
    setSearchParamsRef.current = setSearchParams;

    // Отдаём наружу только свои ключи и без префикса
    const params = useMemo(() => {
        const result: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            if (!prefix) result[key] = value;
            else if (key.startsWith(prefix)) result[key.slice(prefix.length)] = value;
        });
        return result;
    }, [searchParams, prefix]);

    const paramsString = useMemo(() => searchParams.toString(), [searchParams]);

    const flushPendingUpdates = useCallback(() => {
        batchTimeoutRef.current = null;
        const updates = pendingUpdatesRef.current;
        if (Object.keys(updates).length === 0) return;
        pendingUpdatesRef.current = {};

        // Берём актуальный URL, а не снимок из рендера: несколько инстансов хука
        // могут флашиться подряд до перерисовки и не должны затирать друг друга
        setSearchParamsRef.current(
            () => {
                const next = new URLSearchParams(window.location.search);
                Object.entries(updates).forEach(([key, value]) => {
                    if (isEmptyValue(value)) next.delete(key);
                    else next.set(key, String(value));
                });
                return next;
            },
            { replace: true },
        );
    }, []);

    // Не оставляем висящий таймер после размонтирования, но изменения применяем
    useEffect(
        () => () => {
            if (batchTimeoutRef.current) {
                clearTimeout(batchTimeoutRef.current);
                flushPendingUpdates();
            }
        },
        [flushPendingUpdates],
    );

    const batchSetParams = useCallback(
        (updates: Record<string, ValueType>) => {
            Object.entries(updates).forEach(([key, value]) => {
                if (!key) return;
                pendingUpdatesRef.current[`${prefix}${key}`] = value;
            });

            if (batchTimeoutRef.current) clearTimeout(batchTimeoutRef.current);
            batchTimeoutRef.current = setTimeout(flushPendingUpdates, 0);
        },
        [flushPendingUpdates, prefix],
    );

    const setParams = useCallback(
        (key: string | Record<string, ValueType>, value?: ValueType) => {
            batchSetParams(typeof key === 'string' ? { [key]: value } : key);
        },
        [batchSetParams],
    );

    const deleteParams = useCallback(
        (keys: string | string[]) => {
            const keysArray = Array.isArray(keys) ? keys : [keys];
            batchSetParams(Object.fromEntries(keysArray.map((key) => [key, null])));
        },
        [batchSetParams],
    );

    return { paramsString, params, setParams, deleteParams, batchSetParams };
};
