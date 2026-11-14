import { formatDisplayValue } from '@shared/utils';
import { Descriptions, Modal, type TableColumnsType } from 'antd';

import { getValueByDataIndex } from './lib/rowKey';

import type { ReactNode } from 'react';

interface ViewModalProps<T> {
    visible: boolean;
    onClose: () => void;
    data: T | null;
    title?: string;
    columns?: TableColumnsType<T>;
}

interface Field<T> {
    key: string;
    label: ReactNode;
    dataIndex: unknown;
    render?: (value: unknown, record: T, index: number) => ReactNode;
}

// Объекты и массивы без своего render показываем как JSON, а не [object Object]
const toDisplay = (value: unknown): ReactNode => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
    if (typeof value === 'object') return JSON.stringify(value);
    return formatDisplayValue(value) as ReactNode;
};

const buildFields = <T,>(columns: TableColumnsType<T>, data: T): Field<T>[] => {
    const withData = columns.filter((col) => 'dataIndex' in col && col.dataIndex !== undefined);

    if (withData.length === 0) {
        // Колонок нет — показываем все поля записи
        return Object.keys(data as object).map((key) => ({ key, label: key, dataIndex: key }));
    }

    return withData.map((col, index) => {
        const dataIndex = 'dataIndex' in col ? col.dataIndex : undefined;
        const path = Array.isArray(dataIndex) ? dataIndex.join('.') : String(dataIndex);
        return {
            key: String(col.key ?? path ?? index),
            label: (col.title as ReactNode) ?? path,
            dataIndex,
            render: col.render as Field<T>['render'],
        };
    });
};

export function ViewModal<T>({ visible, onClose, data, title = 'Просмотр данных', columns = [] }: ViewModalProps<T>) {
    if (!data) return null;

    return (
        <Modal title={title} open={visible} onCancel={onClose} footer={null} width={700} destroyOnClose>
            <Descriptions bordered column={1} size="small">
                {buildFields(columns, data).map((field, index) => {
                    const value = getValueByDataIndex(data, field.dataIndex);
                    return (
                        <Descriptions.Item key={field.key} label={field.label}>
                            {field.render ? field.render(value, data, index) : toDisplay(value)}
                        </Descriptions.Item>
                    );
                })}
            </Descriptions>
        </Modal>
    );
}
