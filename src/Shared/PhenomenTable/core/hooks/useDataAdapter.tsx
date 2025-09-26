import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

interface DataAdapterResult {
    data: any[];
    totalCount: number;
    meta: any;
    isLoading: boolean;
    error: string | null;
    refresh: (params?: any) => void;
}

interface DataAdapterOptions {
    dataSource: string | ((params: any) => Promise<any>); // URL или функция для fetch
    pageSize?: number;
    onDataChange?: (data: any[]) => void;
}

export const useDataAdapter = ({ dataSource, pageSize = 10, onDataChange }: DataAdapterOptions): DataAdapterResult => {
    const [data, setData] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [meta, setMeta] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Нормализация данных с бэка
    const normalizeData = useCallback((rawData: any) => {
        if (!rawData) {
            return { items: [], total: 0, meta: {} };
        }

        // Форматы API: { data: [...], total: 100 } или { items: [...], total: 100 } или { results: [...], totalCount: 100 }
        if (Array.isArray(rawData)) {
            return {
                items: rawData,
                total: rawData.length,
                meta: {},
            };
        }

        if (typeof rawData === 'object') {
            if (rawData.data && Array.isArray(rawData.data)) {
                return {
                    items: rawData.data,
                    total: rawData.total || rawData.count || rawData.data.length,
                    meta: rawData.meta || {},
                };
            }

            if (rawData.items && Array.isArray(rawData.items)) {
                return {
                    items: rawData.items,
                    total: rawData.total || rawData.count || rawData.items.length,
                    meta: rawData.meta || {},
                };
            }

            if (rawData.results && Array.isArray(rawData.results)) {
                return {
                    items: rawData.results,
                    total: rawData.totalCount || rawData.total || rawData.results.length,
                    meta: rawData.meta || {},
                };
            }

            // Если объект, но не массив - делаем массив из одного элемента
            return {
                items: [rawData],
                total: 1,
                meta: {},
            };
        }

        return {
            items: [],
            total: 0,
            meta: {},
        };
    }, []);

    // Функция загрузки данных с бэка
    const loadData = useCallback(
        debounce(async (params: any = {}) => {
            try {
                setIsLoading(true);
                setError(null);

                let rawData;

                // Если dataSource - строка (URL), добавляем параметры в query string
                if (typeof dataSource === 'string') {
                    const url = new URL(dataSource);
                    if (params.pagination) {
                        url.searchParams.set('page', (params.pagination.pageIndex + 1).toString());
                        url.searchParams.set('pageSize', params.pagination.pageSize.toString());
                    }
                    if (params.globalFilter) {
                        url.searchParams.set('search', params.globalFilter);
                    }
                    if (params.columnFilters && params.columnFilters.length > 0) {
                        params.columnFilters.forEach((filter: any) => {
                            url.searchParams.set(filter.id, filter.value);
                        });
                    }
                    if (params.sorting && params.sorting.length > 0) {
                        const sort = params.sorting[0];
                        url.searchParams.set('sortBy', sort.id);
                        url.searchParams.set('sortOrder', sort.desc ? 'desc' : 'asc');
                    }

                    const response = await fetch(url.toString());
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    rawData = await response.json();
                }
                // Если dataSource - функция, передаем параметры напрямую
                else if (typeof dataSource === 'function') {
                    rawData = await dataSource(params);
                } else {
                    throw new Error('dataSource должен быть строкой (URL) или функцией');
                }

                // Нормализуем данные
                const normalized = normalizeData(rawData);

                setData(normalized.items);
                setTotalCount(normalized.total);
                setMeta(normalized.meta);

                // Уведомляем о изменениях
                if (onDataChange) {
                    onDataChange(normalized.items);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
                setData([]);
                setTotalCount(0);
                setMeta({});
            } finally {
                setIsLoading(false);
            }
        }, 300), // Debounce на 300ms для предотвращения спама запросов
        [dataSource, onDataChange],
    );

    // Функция обновления данных
    const refresh = useCallback(
        (params?: any) => {
            loadData(params);
        },
        [loadData],
    );

    // Загрузка данных при монтировании или изменении dataSource
    useEffect(() => {
        loadData({ pagination: { pageIndex: 0, pageSize } });
    }, [dataSource, pageSize]);

    return {
        data,
        totalCount,
        meta,
        isLoading,
        error,
        refresh,
    };
};
