import { Modal, Descriptions } from 'antd';
import { TableColumnType } from 'antd';
import React from 'react';

export interface ViewModalColumn<T = any> extends TableColumnType<T> {
    title?: React.ReactNode;
    dataIndex?: string | string[];
    key?: string;
    render?: (value: any, record: T, index?: number) => React.ReactNode;
}

interface ViewModalProps<T = any> {
    visible: boolean;
    onClose: () => void;
    data: T | null;
    title?: string;
    columns?: ViewModalColumn<T>[];
}

export function ViewModal<T = any>({
    visible,
    onClose,
    data,
    title = 'Просмотр данных',
    columns = [],
}: ViewModalProps<T>) {
    if (!data) return null;

    const validColumns = columns.filter((col) => col.dataIndex) as ViewModalColumn<T>[];
    // Если columns не переданы или пусты, показываем все поля
    const fields =
        validColumns.length > 0
            ? validColumns
            : (Object.keys(data)?.map((key) => ({
                  title: key,
                  dataIndex: key,
              })) as ViewModalColumn<T>[]); 

    // Функция для получения значения по dataIndex
    const getValueByPath = (obj: any, path: string | string[]): any => {
        if (typeof path === 'string') {
            return obj[path];
        }
        return path.reduce((acc, key) => acc?.[key], obj);
    };

    return (
        <Modal title={title} open={visible} onCancel={onClose} footer={null} width={700}>
            <Descriptions bordered column={1}>
                {fields?.map((field, index) => {
                    const value = getValueByPath(data, field.dataIndex!);
                    const displayValue = field.render ? field.render(value, data, index) : value ?? '-';
                    const key =
                        field.key ||
                        (typeof field.dataIndex === 'string' ? field.dataIndex : field.dataIndex?.join('.')) ||
                        `field-${index}`;

                    return (
                        <Descriptions.Item key={key} label={field.title || 'N/A'}>
                            {displayValue}
                        </Descriptions.Item>
                    );
                })}
            </Descriptions>
        </Modal>
    );
}
