// src/shared/SmartTable/model.ts

import { InputProps, TableColumnsType, TableProps } from 'antd';
import { TableRowSelection } from 'antd/es/table/interface';
import React from 'react';

// --- Общие типы для API ---

export interface IApiResponse<RecordType> {
    items: RecordType[];
    total: number;
    totalSum?: string | number;
}

// --- Типы для фильтров ---

export enum FilterType {
    INPUT = 'input',
    SELECT = 'select',
    DATE = 'date',
    DATE_RANGE = 'date-range',
    BUTTON = 'button',
}

export interface ISelectOption {
    label: string;
    value: any;
    disabled?: boolean;
}

export interface IFilterItem {
    type: FilterType;
    name: string;
    label?: string;
    options?: ISelectOption[];
    inputProps?: Partial<InputProps>;
    /** Функция для преобразования значения фильтра перед отправкой на сервер. */
    transform?: (value: any, options?: ISelectOption[]) => any;
    /** Функция для форматирования значения из URL для отображения в компоненте фильтра. */
    formatValue?: (value: any) => any;
    // Для кнопочных фильтров
    text?: string;
    onClick?: () => void;
    loading?: boolean;
    placeholder?: string;
}

// --- Типы для скачивания ---

export interface IDownloadButton {
    url: string;
    fileName?: string;
    messages?: {
        success?: string;
        error?: string;
    };
}

// --- Типы для главного компонента SmartTable ---

export interface IProps<RecordType, ResponseType> {
    url?: string;
    filters?: IFilterItem[];
    columns: TableColumnsType<RecordType>;
    queryParams?: Record<string, any>;
    getItemsFromResponse?: (response: ResponseType) => RecordType[];
    handleRowClick?: (row: RecordType) => void;
    dataSource?: RecordType[]; // Статический источник данных
    rowSelection?: TableRowSelection<RecordType>;
    idColumnHidden?: boolean;
    customRender?: (items: RecordType[], total: number) => React.ReactNode;
    hideFilters?: boolean;
    hiddenPagination?: boolean;
    isBgChanged?: boolean;
    searchButton?: boolean;
    searchButtonText?: string;
    searchButtonIcon?: React.ReactNode;
    disableScrollX?: boolean;
    downloadButton?: IDownloadButton;
    extraDownloadPayload?: object;
    showDownloadBtn?: boolean;
    totalCount?: number;
    totalSum?: string | number | boolean;
    totalInfoRender?: (data: ResponseType) => React.ReactNode;
    // Стили и прочее
    className?: string;
    style?: string;
    title?: string;
    rowClassName?: (record: RecordType, index: number) => string;
    expandable?: TableProps<RecordType>['expandable'];
}
