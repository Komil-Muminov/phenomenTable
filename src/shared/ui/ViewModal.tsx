import { formatDisplayValue } from '@shared/utils';
import { Descriptions, Modal, type DescriptionsProps, type TableColumnsType } from 'antd';
import { useRef, type ReactNode } from 'react';

import { getValueByDataIndex } from './lib/rowKey';

interface ViewModalProps<T> {
    visible: boolean;
    onClose: () => void;
    data: T | null;
    title?: string;
    columns?: TableColumnsType<T>;
    /** Скрывать поля без значения (по умолчанию true) */
    hideEmpty?: boolean;
}

interface Field<T> {
    key: string;
    label: ReactNode;
    dataIndex: unknown;
    render?: (value: unknown, record: T, index: number) => ReactNode;
}

const isEmpty = (value: unknown) =>
    value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);

// Объекты и массивы без своего render показываем как JSON, а не [object Object]
const toDisplay = (value: unknown): ReactNode => {
    if (isEmpty(value)) return '—';
    if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
    if (typeof value === 'object') return JSON.stringify(value);
    return formatDisplayValue(value) as ReactNode;
};

// senderCity / sender_city → «Sender city»
const humanizeKey = (key: string) => {
    const words = key
        .replace(/([a-zа-я])([A-ZА-Я])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .trim()
        .toLowerCase();
    return words.charAt(0).toUpperCase() + words.slice(1);
};

const buildFields = <T,>(columns: TableColumnsType<T>, data: T): Field<T>[] => {
    const withData = columns.filter((col) => 'dataIndex' in col && col.dataIndex !== undefined);

    if (withData.length === 0) {
        // Колонок нет — показываем все поля записи с читаемыми подписями
        return Object.keys(data as object).map((key) => ({ key, label: humanizeKey(key), dataIndex: key }));
    }

    return withData.map((col, index) => {
        const dataIndex = 'dataIndex' in col ? col.dataIndex : undefined;
        const path = Array.isArray(dataIndex) ? dataIndex.join('.') : String(dataIndex);
        return {
            key: String(col.key ?? path ?? index),
            label: (col.title as ReactNode) ?? humanizeKey(path),
            dataIndex,
            render: col.render as Field<T>['render'],
        };
    });
};

export function ViewModal<T>({
    visible,
    onClose,
    data,
    title = 'Просмотр данных',
    columns = [],
    hideEmpty = true,
}: ViewModalProps<T>) {
    // Держим последнюю запись, чтобы контент не исчезал во время анимации закрытия
    const lastDataRef = useRef<T | null>(data);
    if (data) lastDataRef.current = data;
    const record = data ?? lastDataRef.current;

    const items: DescriptionsProps['items'] = record
        ? buildFields(columns, record)
              .map((field, index) => ({ field, index, value: getValueByDataIndex(record, field.dataIndex) }))
              .filter(({ value }) => !hideEmpty || !isEmpty(value))
              .map(({ field, index, value }) => ({
                  key: field.key,
                  label: field.label,
                  children: field.render ? field.render(value, record, index) : toDisplay(value),
              }))
        : [];

    return (
        <Modal title={title} open={visible} onCancel={onClose} footer={null} width={640} destroyOnClose>
            {items.length > 0 ? (
                <Descriptions
                    bordered
                    column={1}
                    size="small"
                    items={items}
                    styles={{ label: { width: '38%', color: 'var(--color-ink-muted)' } }}
                />
            ) : (
                <p className="py-6 text-center text-sm text-ink-muted">Нет данных для отображения</p>
            )}
        </Modal>
    );
}
