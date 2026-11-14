import { FilterType, type IFilterItem } from '@shared/model';
import { describe, expect, it } from 'vitest';

import { buildFilterChips } from './filterChips';

const FILTERS: IFilterItem[] = [
    { type: FilterType.INPUT, name: 'search', placeholder: 'Поиск' },
    { type: FilterType.DATE_RANGE, name: 'period', label: 'Период' },
    { type: FilterType.DATE, name: 'day' },
    {
        type: FilterType.SELECT,
        name: 'kind',
        placeholder: 'Тип',
        options: [{ label: 'Экспресс', value: 2 }],
    },
];

describe('buildFilterChips', () => {
    it('собирает подписи и читаемые значения в порядке конфига', () => {
        const chips = buildFilterChips(FILTERS, {
            kind: '2',
            periodFrom: '2024-01-05',
            periodTo: '2024-02-10',
            day: '2024-03-01',
            search: 'груз',
        });

        expect(chips.map(({ label, value }) => [label, value])).toEqual([
            ['Поиск', 'груз'],
            ['Период', '05.01.2024 – 10.02.2024'],
            ['day', '01.03.2024'],
            ['Тип', 'Экспресс'],
        ]);
    });

    it('пропускает неполный диапазон и пустые значения', () => {
        expect(buildFilterChips(FILTERS, { periodFrom: '2024-01-05', search: '' })).toEqual([]);
    });

    it('обрезает длинные значения', () => {
        const [chip] = buildFilterChips(FILTERS, { search: 'а'.repeat(50) });
        expect(chip.value).toHaveLength(32);
        expect(chip.value.endsWith('…')).toBe(true);
    });
});
