import { FilterType, type IFilterItem } from '@shared/model';
import { describe, expect, it } from 'vitest';

import { buildRequestParams, parsePagination, pickFilterValues, transformFilterValues } from './smartTableParams';

const FILTERS: IFilterItem[] = [
    { type: FilterType.INPUT, name: 'search' },
    { type: FilterType.DATE_RANGE, name: 'period' },
    {
        type: FilterType.SELECT,
        name: 'status',
        options: [
            { label: 'Активен', value: 1 },
            { label: 'Архив', value: 2 },
        ],
    },
    { type: FilterType.SELECT, name: 'kind', transform: (value) => value.toUpperCase() },
];

describe('pickFilterValues', () => {
    it('берёт только заполненные фильтры и игнорирует чужие параметры', () => {
        const result = pickFilterValues({ search: 'abc', pageNumber: '2', status: '' }, FILTERS);
        expect(result).toEqual({ search: 'abc' });
    });

    it('учитывает диапазон дат только целиком', () => {
        expect(pickFilterValues({ periodFrom: '2024-01-01' }, FILTERS)).toEqual({});
        expect(pickFilterValues({ periodFrom: '2024-01-01', periodTo: '2024-02-01' }, FILTERS)).toEqual({
            periodFrom: '2024-01-01',
            periodTo: '2024-02-01',
        });
    });
});

describe('transformFilterValues', () => {
    it('возвращает исходный тип value опции', () => {
        expect(transformFilterValues({ status: '2' }, FILTERS)).toEqual({ status: 2 });
    });

    it('применяет transform из конфига', () => {
        expect(transformFilterValues({ kind: 'cargo' }, FILTERS)).toEqual({ kind: 'CARGO' });
    });

    it('выкидывает пустые результаты transform', () => {
        const filters: IFilterItem[] = [{ type: FilterType.INPUT, name: 'n', transform: () => Number.NaN }];
        expect(transformFilterValues({ n: 'x' }, filters)).toEqual({});
    });
});

describe('parsePagination', () => {
    it('подставляет дефолты для мусора', () => {
        expect(parsePagination('abc', '-5')).toEqual({ pageNumber: 1, pageSize: 10 });
        expect(parsePagination('1.5', undefined)).toEqual({ pageNumber: 1, pageSize: 10 });
    });

    it('ограничивает размер страницы сверху', () => {
        expect(parsePagination('3', '100000')).toEqual({ pageNumber: 3, pageSize: 500 });
    });
});

describe('buildRequestParams', () => {
    it('мержит фильтры из queryParams с пользовательскими', () => {
        const params = buildRequestParams({
            queryParams: { orgId: 7, filters: { type: 1 } },
            filters: { search: 'a' },
            pageNumber: 2,
            pageSize: 20,
        });
        expect(params).toEqual({
            orgId: 7,
            filters: { type: 1, search: 'a' },
            pageInfo: { pageNumber: 2, pageSize: 20 },
        });
    });

    it('не шлёт пустой filters', () => {
        const params = buildRequestParams({ filters: {}, pageNumber: 1, pageSize: 10 });
        expect(params).toEqual({ pageInfo: { pageNumber: 1, pageSize: 10 } });
    });
});
