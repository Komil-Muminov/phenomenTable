import { ButtonProps, PopconfirmProps, TableColumnType } from 'antd';
import React from 'react';

export interface ActionConfirmConfig {
    title: React.ReactNode;
    description?: React.ReactNode;
    okText?: string;
    cancelText?: string;
    okType?: 'primary' | 'danger';
    placement?: PopconfirmProps['placement'];
}

export interface TableActionItem<RecordType = any> {
    key?: string;
    label?: React.ReactNode;
    icon?: React.ReactNode;
    danger?: boolean;
    type?: ButtonProps['type'];
    disabled?: boolean | ((record: RecordType) => boolean);
    hidden?: boolean | ((record: RecordType) => boolean);
    tooltip?: React.ReactNode | ((record: RecordType) => React.ReactNode);
    confirm?: ActionConfirmConfig | ((record: RecordType) => ActionConfirmConfig | undefined);
    onClick?: (record: RecordType, event?: React.MouseEvent) => Promise<any> | any;
}

export interface TableActionsProps<RecordType = any> {
    record: RecordType;
    actions?: TableActionItem<RecordType>[];
    onView?: (record: RecordType) => void;
    onEdit?: (record: RecordType) => void;
    onDelete?: (record: RecordType) => Promise<any> | any;
    deleteConfirm?: ActionConfirmConfig;
    mode?: 'buttons' | 'dropdown' | 'auto';
    maxVisibleButtons?: number;
    /** Кнопки в строке — только иконки с тултипом (если у действия есть icon). По умолчанию true */
    iconOnly?: boolean;
    size?: ButtonProps['size'];
    className?: string;
    style?: React.CSSProperties;
}

export interface CreateActionsColumnOptions<RecordType = any>
    extends Omit<TableColumnType<RecordType>, 'render'>,
        Omit<TableActionsProps<RecordType>, 'record'> {
    title?: React.ReactNode;
}

/** Массовое действие: то же, что действие строки, но «запись» — массив выделенных строк */
export interface BulkActionItem<RecordType = any> extends TableActionItem<RecordType[]> {
    /** Не снимать выделение после успешного выполнения (по умолчанию снимается) */
    keepSelection?: boolean;
}
