import type { RowKeyGetter } from '@shared/model';
import type { Key } from 'react';

/** Достаёт ключ строки: по имени поля или функцией. Фоллбэк — record.key */
export const resolveRowKey = <RecordType>(record: RecordType, rowKey: RowKeyGetter<RecordType> = 'id'): Key => {
    if (typeof rowKey === 'function') return rowKey(record);
    const source = record as Record<string, unknown>;
    const value = source?.[rowKey] ?? source?.key;
    return typeof value === 'string' || typeof value === 'number' ? value : String(value);
};

/** Значение по dataIndex: строка ('a') или путь (['a', 'b']) */
export const getValueByDataIndex = (record: unknown, dataIndex: unknown): unknown => {
    if (record === null || typeof record !== 'object') return undefined;
    const source = record as Record<string, unknown>;

    if (typeof dataIndex === 'string' || typeof dataIndex === 'number') return source[dataIndex];
    if (Array.isArray(dataIndex)) {
        return dataIndex.reduce<unknown>(
            (acc, key) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined),
            record,
        );
    }
    return undefined;
};
