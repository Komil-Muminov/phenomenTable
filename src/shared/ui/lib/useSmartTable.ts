import { useDynamicSearchParams, useGetQuery } from '@shared/lib';
import { keepPreviousData } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
    buildRequestParams,
    getFilterParamNames,
    parsePagination,
    pickFilterValues,
    transformFilterValues,
} from './smartTableParams';

import type { IFilterItem } from '@shared/model';

interface UseSmartTableOptions<RecordType, ResponseType> {
    url?: string;
    queryParams?: Record<string, unknown>;
    filters?: IFilterItem[];
    dataSource?: RecordType[];
    getItemsFromResponse?: (response: ResponseType) => RecordType[];
    getTotalFromResponse?: (response: ResponseType) => number;
    searchButton?: boolean;
    localFilter?: (record: RecordType, filters: Record<string, unknown>) => boolean;
    requestTransform?: (params: Record<string, unknown>) => unknown;
    responseTransform?: (response: unknown) => ResponseType;
}

const EMPTY_FILTERS: IFilterItem[] = [];

// Дефолтный формат ответа: { items, total }
const defaultGetItems = (response: unknown) => (response as { items?: unknown[] })?.items ?? [];
const defaultGetTotal = (response: unknown) => Number((response as { total?: number })?.total) || 0;

export const useSmartTable = <RecordType, ResponseType = unknown>(
    options: UseSmartTableOptions<RecordType, ResponseType>,
) => {
    const {
        url,
        queryParams,
        filters = EMPTY_FILTERS,
        dataSource,
        getItemsFromResponse = defaultGetItems as (response: ResponseType) => RecordType[],
        getTotalFromResponse = defaultGetTotal,
        searchButton = false,
        localFilter,
        requestTransform,
        responseTransform,
    } = options;

    const { params: searchParams, setParams, deleteParams } = useDynamicSearchParams();
    const { pageNumber, pageSize } = parsePagination(searchParams.pageNumber, searchParams.pageSize);

    const filterValues = useMemo(() => pickFilterValues(searchParams, filters), [searchParams, filters]);

    // В режиме searchButton применяются только «зафиксированные» фильтры.
    // Стартуем со значений из URL — иначе ссылка с фильтрами открывается без них
    const [appliedFilters, setAppliedFilters] = useState(filterValues);
    const activeFilters = searchButton ? appliedFilters : filterValues;

    const transformedFilters = useMemo(() => transformFilterValues(activeFilters, filters), [activeFilters, filters]);

    const params = useMemo(() => {
        const base = buildRequestParams({ queryParams, filters: transformedFilters, pageNumber, pageSize });
        return requestTransform ? requestTransform(base) : base;
    }, [queryParams, transformedFilters, pageNumber, pageSize, requestTransform]);

    const isStatic = Array.isArray(dataSource);

    // keepPreviousData: при смене страницы держим старые строки под лоадером, без мигания пустотой
    const {
        data: rawData,
        isFetching,
        refetch,
    } = useGetQuery<unknown, unknown>({
        url: url ?? '',
        params,
        options: { enabled: Boolean(url) && !isStatic, placeholderData: keepPreviousData },
    });

    const data = useMemo(
        () => (rawData !== undefined && responseTransform ? responseTransform(rawData) : (rawData as ResponseType)),
        [rawData, responseTransform],
    );

    // Сброс на 1-ю страницу при смене фильтров (в обычном режиме)
    const filtersKey = JSON.stringify(transformedFilters);
    const prevFiltersKey = useRef(filtersKey);
    useEffect(() => {
        if (prevFiltersKey.current === filtersKey) return;
        prevFiltersKey.current = filtersKey;
        if (!searchButton && pageNumber !== 1) setParams('pageNumber', 1);
    }, [filtersKey, searchButton, pageNumber, setParams]);

    const handleApplyFilters = useCallback(() => {
        const isSame = JSON.stringify(filterValues) === JSON.stringify(appliedFilters);
        setAppliedFilters(filterValues);
        setParams('pageNumber', 1);
        // Те же фильтры → ключ запроса не меняется, поэтому перезапрашиваем явно
        if (isSame && pageNumber === 1 && url && !isStatic) void refetch();
    }, [filterValues, appliedFilters, setParams, pageNumber, url, isStatic, refetch]);

    const handleResetFilters = useCallback(() => {
        deleteParams(filters.flatMap(getFilterParamNames));
        setParams('pageNumber', 1);
        setAppliedFilters({});
    }, [filters, deleteParams, setParams]);

    const setPage = useCallback(
        (page: number, size: number) => setParams({ pageNumber: page, pageSize: size }),
        [setParams],
    );

    // Для статики режем страницу сами — одинаково для таблицы и карточек
    // Если после удаления строк текущая страница опустела — показываем последнюю непустую
    const { tableData, total } = useMemo(() => {
        if (isStatic) {
            const filtered = localFilter
                ? dataSource.filter((row) => localFilter(row, transformedFilters))
                : dataSource;
            const lastPage = Math.max(1, Math.ceil(filtered.length / pageSize));
            const start = (Math.min(pageNumber, lastPage) - 1) * pageSize;
            return { tableData: filtered.slice(start, start + pageSize), total: filtered.length };
        }
        if (data === undefined || data === null) return { tableData: [] as RecordType[], total: 0 };
        return { tableData: getItemsFromResponse(data) ?? [], total: getTotalFromResponse(data) };
    }, [
        isStatic,
        dataSource,
        localFilter,
        transformedFilters,
        pageNumber,
        pageSize,
        data,
        getItemsFromResponse,
        getTotalFromResponse,
    ]);

    return {
        tableData,
        total,
        isLoading: isFetching,
        filterValues,
        transformedFilters,
        handleApplyFilters,
        handleResetFilters,
        pageNumber: isStatic ? Math.min(pageNumber, Math.max(1, Math.ceil(total / pageSize))) : pageNumber,
        pageSize,
        setPage,
        setParams,
        data,
    };
};
