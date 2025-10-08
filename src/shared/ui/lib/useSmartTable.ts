import { useDynamicSearchParams, useGetQuery } from '@shared/lib';
import { useEffect, useMemo, useRef, useState } from 'react';
import { formatDatesInObject } from '@shared/utils';
import { IFilterItem } from '@shared/model';

const DEFAULT_PAGE_SIZE = 10;

interface UseSmartTableOptions<RecordType, ResponseType> {
    url?: string;
    queryParams?: Record<string, any>;
    filters?: IFilterItem[];
    dataSource?: RecordType[];
    getItemsFromResponse?: (response: ResponseType) => RecordType[];
    searchButton?: boolean;
    requestTransform?: (params: any) => any;
    responseTransform?: (response: any) => ResponseType;
}

export const useSmartTable = <RecordType = any, ResponseType = any>(
    options: UseSmartTableOptions<RecordType, ResponseType>,
) => {
    const {
        url,
        queryParams,
        filters = [],
        dataSource,
        getItemsFromResponse = (response: any) => response?.items ?? [],
        searchButton = false,
        requestTransform,
        responseTransform,
    } = options;

    const { params: searchParams, setParams, deleteParams } = useDynamicSearchParams();
    const { pageNumber, pageSize } = searchParams;

    const [pendingFilters, setPendingFilters] = useState<Record<string, any>>({});
    const [shouldRefetch, setShouldRefetch] = useState(false);

    // Получаем значения фильтров из URL
    const filterValues = useMemo(() => {
        return filters.reduce((acc, filter) => {
            // Для date-range берем оба параметра
            if (filter.type === 'date-range') {
                const fromValue = searchParams[`${filter.name}From`];
                const toValue = searchParams[`${filter.name}To`];
                if (fromValue && toValue) {
                    acc[`${filter.name}From`] = fromValue;
                    acc[`${filter.name}To`] = toValue;
                }
            } else {
                const value = searchParams[filter.name];
                if (value !== undefined && value !== '') {
                    acc[filter.name] = value;
                }
            }
            return acc;
        }, {} as Record<string, any>);
    }, [searchParams, filters]);

    // Трансформируем фильтры
    const transformedFilters = useMemo(() => {
        const filtersToTransform = searchButton ? pendingFilters : filterValues;

        return Object.keys(filtersToTransform).reduce((acc, key) => {
            // Находим оригинальное имя фильтра (без From/To)
            const baseFilterName = key.replace(/From$|To$/, '');
            const filterConfig = filters.find((f) => f.name === baseFilterName || f.name === key);
            let value = filtersToTransform[key];

            if (filterConfig?.transform) {
                value = filterConfig.transform(value, filterConfig.options);
            } else if (filterConfig?.options && typeof value === 'string') {
                const option = filterConfig.options.find((o) => o.label === value);
                if (option) value = option.value;
            }

            acc[key] = value;
            return acc;
        }, {} as Record<string, any>);
    }, [searchButton, pendingFilters, filterValues, filters]);

    // Формируем параметры запроса
    const params = useMemo(() => {
        const cleanedFilters = Object.entries(transformedFilters).reduce((acc, [key, value]) => {
            if (
                value !== undefined &&
                value !== null &&
                (value !== '' || typeof value === 'number' || (Array.isArray(value) && value.length > 0))
            ) {
                acc[key] = value;
            }
            return acc;
        }, {} as Record<string, any>);

        const baseParams: any = {
            ...queryParams,
            pageInfo: {
                pageNumber: Number(pageNumber) || 1,
                pageSize: Number(pageSize) || DEFAULT_PAGE_SIZE,
            },
        };

        if (Object.keys(cleanedFilters).length > 0) {
            baseParams.filters = {
                ...(queryParams?.filters ?? {}),
                ...cleanedFilters,
            };
        } else if (queryParams?.filters) {
            baseParams.filters = queryParams.filters;
        }

        return requestTransform ? requestTransform(baseParams) : baseParams;
    }, [queryParams, transformedFilters, pageNumber, pageSize, requestTransform]);

    // Запрос данных
    const {
        data: rawData,
        isLoading,
        refetch,
    } = url
        ? useGetQuery({
              url,
              params,
              options: { enabled: true },
          })
        : { data: undefined, isLoading: false, refetch: undefined };

    const data = useMemo(() => {
        return responseTransform && rawData ? responseTransform(rawData) : rawData;
    }, [rawData, responseTransform]);

    // Рефетч при изменении фильтров в режиме searchButton
    useEffect(() => {
        if (shouldRefetch && refetch) {
            refetch();
            setShouldRefetch(false);
        }
    }, [shouldRefetch, refetch]);

    // Инициализация пагинации
    useEffect(() => {
        if (!pageSize) setParams('pageSize', DEFAULT_PAGE_SIZE);
        if (!pageNumber) setParams('pageNumber', 1);
    }, [pageSize, pageNumber, setParams]);

    // Сброс пагинации при изменении фильтров (без searchButton)
    const prevFiltersRef = useRef<string>();
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (searchButton) return;

        const currentFiltersString = JSON.stringify(transformedFilters);

        if (isFirstRender.current) {
            prevFiltersRef.current = currentFiltersString;
            isFirstRender.current = false;
            return;
        }

        if (prevFiltersRef.current !== currentFiltersString) {
            prevFiltersRef.current = currentFiltersString;
            setParams('pageNumber', 1);
        }
    }, [transformedFilters, searchButton, setParams]);

    // Обработчики фильтров
    const handleApplyFilters = () => {
        setPendingFilters({ ...filterValues });
        setParams('pageNumber', 1);
        setTimeout(() => setShouldRefetch(true), 0);
    };

    const handleResetFilters = () => {
        // Собираем все имена параметров для удаления, включая From/To для date-range
        const filterNames: string[] = [];
        filters.forEach((filter) => {
            if (filter.type === 'date-range') {
                filterNames.push(`${filter.name}From`);
                filterNames.push(`${filter.name}To`);
            } else {
                filterNames.push(filter.name);
            }
        });

        deleteParams(filterNames);
        setParams('pageNumber', 1);

        if (searchButton) {
            setPendingFilters({});
        }

        setTimeout(() => setShouldRefetch(true), 0);
    };

    // Подготовка данных таблицы
    const rawItems = dataSource ?? (data ? getItemsFromResponse(data) : []);
    const tableData = rawItems.map(formatDatesInObject);

    return {
        tableData,
        total: data?.total ?? 0,
        isLoading,
        filterValues,
        transformedFilters,
        handleApplyFilters,
        handleResetFilters,
        pageNumber: Number(pageNumber) || 1,
        pageSize: Number(pageSize) || DEFAULT_PAGE_SIZE,
        setParams,
        data,
    };
};
