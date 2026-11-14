import { FilterType, type IFilterItem } from '@shared/model';

export interface RowItem {
    id: number;
    title: string;
    senderCity?: string;
    km?: string;
    startDate?: string;
    isLocked?: boolean;
    orderType: number;
}

const CITIES = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск'];

// 23 записи — чтобы было видно локальную пагинацию
export const DEMO_ROWS: RowItem[] = Array.from({ length: 23 }, (_, index) => {
    const id = index + 1;
    return {
        id,
        title: `Доставка ${id}`,
        senderCity: CITIES[index % CITIES.length],
        km: `${((index * 137) % 900) + 50} км`,
        startDate: new Date(Date.UTC(2023, index % 12, (index % 27) + 1, 9)).toISOString(),
        isLocked: id % 4 === 0,
        orderType: id % 3 === 0 ? 2 : 1,
    };
});

export const DEMO_FILTERS: IFilterItem[] = [
    { type: FilterType.INPUT, name: 'search', placeholder: 'Поиск по названию' },
    { type: FilterType.DATE_RANGE, name: 'period', placeholder: 'Период' },
    {
        type: FilterType.SELECT,
        name: 'orderType',
        placeholder: 'Тип доставки',
        transform: (value) => Number(value),
        options: [
            { label: 'Стандарт', value: 1 },
            { label: 'Экспресс', value: 2 },
        ],
    },
];

// Локальная фильтрация демо-данных теми же фильтрами, что ушли бы на сервер
export const demoLocalFilter = (row: RowItem, filters: Record<string, unknown>) => {
    const search = typeof filters.search === 'string' ? filters.search.toLowerCase() : '';
    if (search && !row.title.toLowerCase().includes(search)) return false;
    if (filters.orderType !== undefined && row.orderType !== filters.orderType) return false;

    const day = row.startDate?.slice(0, 10) ?? '';
    if (typeof filters.periodFrom === 'string' && day < filters.periodFrom) return false;
    if (typeof filters.periodTo === 'string' && day > filters.periodTo) return false;
    return true;
};
