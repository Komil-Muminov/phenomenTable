import type { TableColumnsType } from 'antd';

const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

export const isISODateString = (value: unknown): value is string =>
    typeof value === 'string' && ISO_DATETIME.test(value);

/** ISO-дата → «01.01.2023». Невалидную дату возвращаем как есть */
export const formatDisplayValue = (value: unknown): unknown => {
    if (!isISODateString(value)) return value;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('ru-RU');
};

/** Форматирует даты в копии объекта (исходник не трогаем) */
export const formatDatesInObject = <T extends Record<string, unknown>>(obj: T): T =>
    Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, formatDisplayValue(value)])) as T;

/**
 * Добавляет форматирование дат колонкам без своего render.
 * Форматируем только отображение — в обработчики уходят исходные данные.
 */
export const withDateFormatting = <RecordType>(columns: TableColumnsType<RecordType>): TableColumnsType<RecordType> =>
    columns.map((column) => {
        if ('children' in column && column.children) {
            return { ...column, children: withDateFormatting(column.children) };
        }
        if (column.render) return column;
        return { ...column, render: (value: unknown) => formatDisplayValue(value) as React.ReactNode };
    });
