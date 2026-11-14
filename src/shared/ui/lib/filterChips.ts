import { FilterType, type IFilterItem } from '@shared/model';

import { getFilterParamNames } from './smartTableParams';

export interface FilterChip {
    filter: IFilterItem;
    /** Подпись фильтра: label → placeholder → name */
    label: string;
    /** Человекочитаемое значение */
    value: string;
}

const MAX_VALUE_LENGTH = 32;

// 2024-03-05 → 05.03.2024; невалидное оставляем как есть
const formatUrlDate = (value: string) => {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? `${match[3]}.${match[2]}.${match[1]}` : value;
};

const truncate = (value: string) =>
    value.length > MAX_VALUE_LENGTH ? `${value.slice(0, MAX_VALUE_LENGTH - 1)}…` : value;

const formatValue = (filter: IFilterItem, values: Record<string, string>): string => {
    const [first, second] = getFilterParamNames(filter).map((name) => values[name]);

    switch (filter.type) {
        case FilterType.DATE_RANGE:
            return `${formatUrlDate(first)} – ${formatUrlDate(second)}`;
        case FilterType.DATE:
            return formatUrlDate(first);
        case FilterType.SELECT:
            return filter.options?.find((option) => String(option.value) === first)?.label ?? first;
        default:
            return first;
    }
};

/** Чипсы активных фильтров в порядке конфига */
export const buildFilterChips = (filters: IFilterItem[], values: Record<string, string>): FilterChip[] =>
    filters
        .filter((filter) => getFilterParamNames(filter).every((name) => Boolean(values[name])))
        .map((filter) => ({
            filter,
            label: filter.label || filter.placeholder || filter.name,
            value: truncate(formatValue(filter, values)),
        }));
