import { useState, useEffect, useMemo } from 'react';

interface DataAdapterResult {
    data: any[];
    totalCount: number;
    meta: any;
    isLoading: boolean;
    error: string | null;
    refresh: () => void;
}

interface DataAdapterOptions {
    dataSource: any;
    pageSize?: number;
    onDataChange?: (data: any[]) => void;
}

export const useDataAdapter = ({ dataSource, pageSize = 10, onDataChange }: DataAdapterOptions): DataAdapterResult => {
    const [data, setData] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [meta, setMeta] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Функция обновления данных
    const refresh = () => {
        setRefreshTrigger((prev) => prev + 1);
    };

    // Универсальная нормализация данных
    const normalizeData = (rawData: any) => {
        // Если null или undefined
        if (!rawData) {
            return { items: [], total: 0, meta: {} };
        }

        // Если обычный массив: [1, 2, 3] или [{id: 1}, {id: 2}]
        if (Array.isArray(rawData)) {
            return {
                items: rawData,
                total: rawData.length,
                meta: {},
            };
        }

        // Если объект с массивом внутри
        if (typeof rawData === 'object') {
            // Популярные форматы API:

            // { data: [...], total: 100 }
            if (rawData.data && Array.isArray(rawData.data)) {
                return {
                    items: rawData.data,
                    total: rawData.total || rawData.count || rawData.data.length,
                    meta: rawData.meta || rawData,
                };
            }

            // { items: [...], total: 100 }
            if (rawData.items && Array.isArray(rawData.items)) {
                return {
                    items: rawData.items,
                    total: rawData.total || rawData.count || rawData.items.length,
                    meta: rawData.meta || rawData,
                };
            }

            // { results: [...], totalCount: 100 }
            if (rawData.results && Array.isArray(rawData.results)) {
                return {
                    items: rawData.results,
                    total: rawData.totalCount || rawData.total || rawData.results.length,
                    meta: rawData.meta || rawData,
                };
            }

            // { response: { data: [...] } }
            if (rawData.response) {
                return normalizeData(rawData.response);
            }

            // { payload: [...] }
            if (rawData.payload && Array.isArray(rawData.payload)) {
                return {
                    items: rawData.payload,
                    total: rawData.total || rawData.payload.length,
                    meta: rawData,
                };
            }

            // Если объект, но не массив - возможно одна запись
            const keys = Object.keys(rawData);
            const arrayKey = keys.find((key) => Array.isArray(rawData[key]));

            if (arrayKey) {
                return {
                    items: rawData[arrayKey],
                    total: rawData.total || rawData.count || rawData[arrayKey].length,
                    meta: rawData,
                };
            }

            // Если один объект - делаем массив из одного элемента
            return {
                items: [rawData],
                total: 1,
                meta: {},
            };
        }

        // Если примитив (строка, число) - делаем массив
        return {
            items: [rawData],
            total: 1,
            meta: {},
        };
    };

    // Загрузка данных
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                let rawData;

                // Если строка - это URL для API
                if (typeof dataSource === 'string') {
                    const response = await fetch(dataSource);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    rawData = await response.json();
                }
                // Если функция - вызываем её
                else if (typeof dataSource === 'function') {
                    rawData = await dataSource();
                }
                // Если Promise - ждем его
                else if (dataSource && typeof dataSource.then === 'function') {
                    rawData = await dataSource;
                }
                // Если обычные данные
                else {
                    rawData = dataSource;
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
        };

        loadData();
    }, [dataSource, refreshTrigger, onDataChange]);

    return {
        data,
        totalCount,
        meta,
        isLoading,
        error,
        refresh,
    };
};
