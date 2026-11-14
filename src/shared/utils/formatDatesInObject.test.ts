import { describe, expect, it } from 'vitest';

import { formatDisplayValue, withDateFormatting } from './formatDatesInObject';

import type { TableColumnsType } from 'antd';

describe('formatDisplayValue', () => {
    it('форматирует ISO-дату', () => {
        expect(formatDisplayValue('2023-03-20T12:00:00Z')).toBe('20.03.2023');
    });

    it('не трогает остальное', () => {
        expect(formatDisplayValue('2023-03-20')).toBe('2023-03-20');
        expect(formatDisplayValue(42)).toBe(42);
        expect(formatDisplayValue('9999-99-99T99:99:99')).toBe('9999-99-99T99:99:99');
    });
});

describe('withDateFormatting', () => {
    it('добавляет render только колонкам без своего render', () => {
        const custom = () => 'custom';
        const columns: TableColumnsType<{ date: string }> = [{ dataIndex: 'date' }, { dataIndex: 'x', render: custom }];
        const [plain, withRender] = withDateFormatting(columns) as { render?: (value: unknown) => unknown }[];

        expect(plain.render?.('2023-01-01T12:00:00Z')).toBe('01.01.2023');
        expect(withRender.render).toBe(custom);
    });
});
