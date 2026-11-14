import type { InputProps, TableColumnsType, TableProps } from 'antd';
import type { TableRowSelection } from 'antd/es/table/interface';
import type { Key, ReactNode } from 'react';

// --- Общие типы API ---

export interface IApiResponse<RecordType> {
    items: RecordType[];
    total: number;
    totalSum?: string | number;
}

// --- Фильтры ---

export enum FilterType {
    INPUT = 'input',
    SELECT = 'select',
    DATE = 'date',
    DATE_RANGE = 'date-range',
}

export interface ISelectOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

export interface IFilterItem {
    type: FilterType;
    /** Имя параметра. Для DATE_RANGE в URL пишутся `${name}From` и `${name}To` */
    name: string;
    label?: string;
    placeholder?: string;
    options?: ISelectOption[];
    inputProps?: Partial<InputProps>;
    /** Преобразование значения перед отправкой на сервер */
    transform?: (value: string, options?: ISelectOption[]) => unknown;
}

// --- Скачивание ---

export interface IDownloadButton {
    url: string;
    fileName?: string;
    messages?: {
        success?: string;
        error?: string;
    };
}

// --- SmartTable ---

export type RowKeyGetter<RecordType> = string | ((record: RecordType) => Key);

export interface SmartTableProps<RecordType, ResponseType = IApiResponse<RecordType>> {
    // Данные
    url?: string;
    /** Статические данные. Если заданы — запрос по url не делается, пагинация локальная */
    dataSource?: RecordType[];
    queryParams?: Record<string, unknown>;
    getItemsFromResponse?: (response: ResponseType) => RecordType[];
    getTotalFromResponse?: (response: ResponseType) => number;
    requestTransform?: (params: Record<string, unknown>) => unknown;
    responseTransform?: (response: unknown) => ResponseType;
    /** Фильтрация статического dataSource по текущим (уже трансформированным) фильтрам */
    localFilter?: (record: RecordType, filters: Record<string, unknown>) => boolean;
    /** Префикс URL-параметров — нужен, если на странице несколько таблиц */
    paramsScope?: string;

    // Колонки и строки
    columns: TableColumnsType<RecordType>;
    rowKey?: RowKeyGetter<RecordType>;
    idColumnHidden?: boolean;
    rowClassName?: (record: RecordType, index: number) => string;
    expandable?: TableProps<RecordType>['expandable'];
    handleRowClick?: (row: RecordType) => void;

    // Выделение: свой rowSelection или встроенный через handleSelectionChange
    rowSelection?: TableRowSelection<RecordType>;
    handleSelectionChange?: (keys: Key[], rows: RecordType[]) => void;

    // Фильтры
    filters?: IFilterItem[];
    hideFilters?: boolean;
    /** Режим «по кнопке»: фильтры применяются только по клику на «Поиск» */
    searchButton?: boolean;
    searchButtonText?: string;
    searchButtonIcon?: ReactNode;

    // Скачивание
    downloadButton?: IDownloadButton;
    downloadPayload?: object;
    showDownloadBtn?: boolean;

    // Вид
    title?: string;
    className?: string;
    /** Доп. классы для шапки с фильтрами */
    style?: string;
    hiddenPagination?: boolean;
    disableScrollX?: boolean;
    virtual?: boolean;
    customRender?: (items: RecordType[], total: number) => ReactNode;

    // Модалка просмотра
    enableViewModal?: boolean;
    viewModalTitle?: string;
    viewModalColumns?: TableColumnsType<RecordType>;

    // Мобильный вид (карточки)
    enableMobileCards?: boolean;
    mobileBreakpoint?: number;
    primaryColumnKey?: string;
    hiddenInMobileColumns?: string[];
    renderMobileCard?: (record: RecordType, index: number) => ReactNode;
}
