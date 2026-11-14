import { FilterType, type IFilterItem } from '@shared/model';

export const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 500;

type FilterValues = Record<string, string>;

/** Имена URL-параметров, которые занимает фильтр */
export const getFilterParamNames = (filter: IFilterItem): string[] =>
    filter.type === FilterType.DATE_RANGE ? [`${filter.name}From`, `${filter.name}To`] : [filter.name];

/** Собирает непустые значения фильтров из URL. Диапазон дат учитывается только целиком */
export const pickFilterValues = (searchParams: Record<string, string>, filters: IFilterItem[]): FilterValues =>
    filters.reduce<FilterValues>((acc, filter) => {
        const names = getFilterParamNames(filter);
        const values = names.map((name) => searchParams[name]);
        if (values.every((value) => value !== undefined && value !== '')) {
            names.forEach((name, index) => (acc[name] = values[index]));
        }
        return acc;
    }, {});

// Ищем конфиг фильтра по имени параметра (с учётом суффиксов From/To у диапазона)
const findFilterConfig = (key: string, filters: IFilterItem[]) =>
    filters.find((filter) => getFilterParamNames(filter).includes(key));

const isMeaningful = (value: unknown) => {
    if (value === undefined || value === null || value === '') return false;
    if (typeof value === 'number') return Number.isFinite(value);
    if (Array.isArray(value)) return value.length > 0;
    return true;
};

/** Применяет transform из конфигов и выкидывает пустые значения */
export const transformFilterValues = (values: FilterValues, filters: IFilterItem[]): Record<string, unknown> =>
    Object.entries(values).reduce<Record<string, unknown>>((acc, [key, rawValue]) => {
        const config = findFilterConfig(key, filters);
        let value: unknown = rawValue;

        if (config?.transform) {
            value = config.transform(rawValue, config.options);
        } else if (config?.options) {
            // Значение из URL — строка; возвращаем исходный тип опции
            const option = config.options.find((item) => String(item.value) === rawValue || item.label === rawValue);
            if (option) value = option.value;
        }

        if (isMeaningful(value)) acc[key] = value;
        return acc;
    }, {});

/** Валидирует номер/размер страницы из URL: только целые положительные */
export const parsePagination = (pageNumber?: string, pageSize?: string) => {
    const page = Number(pageNumber);
    const size = Number(pageSize);
    return {
        pageNumber: Number.isInteger(page) && page > 0 ? page : 1,
        pageSize: Number.isInteger(size) && size > 0 ? Math.min(size, MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE,
    };
};

interface BuildParamsInput {
    queryParams?: Record<string, unknown>;
    filters: Record<string, unknown>;
    pageNumber: number;
    pageSize: number;
}

/** Тело запроса к API: { ...queryParams, pageInfo, filters } */
export const buildRequestParams = ({ queryParams, filters, pageNumber, pageSize }: BuildParamsInput) => {
    const baseFilters = (queryParams?.filters as Record<string, unknown> | undefined) ?? {};
    const mergedFilters = { ...baseFilters, ...filters };

    const params: Record<string, unknown> = { ...queryParams, pageInfo: { pageNumber, pageSize } };
    if (Object.keys(mergedFilters).length > 0) params.filters = mergedFilters;
    else delete params.filters;

    return params;
};
