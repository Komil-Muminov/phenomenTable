import type { BulkActionItem } from './ui/TableActions/types';
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

// --- SmartTable: группы пропсов ---

export type RowKeyGetter<RecordType> = string | ((record: RecordType) => Key);

/** Блок можно включить флагом (`true` — настройки по умолчанию) или объектом с настройками */
export type Toggle<Options> = boolean | Options;

/** Как разбирать ответ сервера и готовить запрос */
export interface SmartTableAdapter<RecordType, ResponseType> {
    /** По умолчанию response.items */
    getItems?: (response: ResponseType) => RecordType[];
    /** По умолчанию response.total */
    getTotal?: (response: ResponseType) => number;
    /** Правка тела запроса перед отправкой */
    transformRequest?: (params: Record<string, unknown>) => unknown;
    /** Правка ответа до getItems/getTotal */
    transformResponse?: (response: unknown) => ResponseType;
}

/** Выделение строк. Встроенное включается через onChange или bulkActions */
export interface SmartTableSelection<RecordType> {
    onChange?: (keys: Key[], rows: RecordType[]) => void;
    /** Массовые действия: плавающая панель «Выбрано N» снизу */
    bulkActions?: BulkActionItem<RecordType>[];
    /** Полностью свой rowSelection antd (встроенный тогда не используется) */
    rowSelection?: TableRowSelection<RecordType>;
}

/** Режим «по кнопке»: фильтры применяются только по клику на «Поиск» */
export interface SmartTableSearchButton {
    text?: string;
    icon?: ReactNode;
}

/** Кнопка «Скачать»: POST с текущими фильтрами → ссылка на файл */
export interface SmartTableDownload extends IDownloadButton {
    /** Доп. поля в тело запроса */
    payload?: object;
}

/** Внешний вид таблицы. Все флаги по умолчанию true */
export interface SmartTableView {
    /** Колонка ID слева */
    idColumn?: boolean;
    pagination?: boolean;
    /** Горизонтальный скролл для широких таблиц */
    scrollX?: boolean;
    /** Закреплённая шапка. Число — отступ сверху, например под фикс-хедер */
    stickyHeader?: boolean | number;
    /** Внутренний отступ sm:p-4 вокруг таблицы */
    padded?: boolean;
    /** Виртуальный скролл antd для тысяч строк (по умолчанию false) */
    virtual?: boolean;
    /** Доп. классы для шапки с фильтрами */
    toolbarClassName?: string;
}

/** Модалка просмотра записи по клику на строку */
export interface SmartTableViewModal<RecordType> {
    title?: string;
    /** Свои колонки для модалки; по умолчанию — колонки таблицы */
    columns?: TableColumnsType<RecordType>;
    /** Скрывать пустые поля (по умолчанию true) */
    hideEmpty?: boolean;
}

/** Мобильный вид — карточки вместо таблицы. Включён по умолчанию, `false` — выключить */
export interface SmartTableMobile<RecordType> {
    /** Ширина в px, ниже которой показываются карточки (по умолчанию 768) */
    breakpoint?: number;
    /** Колонка-заголовок карточки */
    primaryColumnKey?: string;
    /** Колонки, которые не показывать в карточке */
    hiddenColumns?: string[];
    /** Полностью своя карточка */
    renderCard?: (record: RecordType, index: number) => ReactNode;
}

// --- SmartTable ---

export interface SmartTableProps<RecordType, ResponseType = IApiResponse<RecordType>> {
    // Данные
    url?: string;
    /** Статические данные. Если заданы — запроса нет, пагинация локальная */
    dataSource?: RecordType[];
    /** Доп. поля в тело каждого запроса */
    queryParams?: Record<string, unknown>;
    adapter?: SmartTableAdapter<RecordType, ResponseType>;
    /** Фильтрация статического dataSource по текущим (уже трансформированным) фильтрам */
    localFilter?: (record: RecordType, filters: Record<string, unknown>) => boolean;
    /** Префикс URL-параметров — нужен, если на странице несколько таблиц */
    paramsScope?: string;

    // Колонки и строки
    columns: TableColumnsType<RecordType>;
    rowKey?: RowKeyGetter<RecordType>;
    rowClassName?: (record: RecordType, index: number) => string;
    expandable?: TableProps<RecordType>['expandable'];
    onRowClick?: (row: RecordType) => void;
    selection?: SmartTableSelection<RecordType>;

    // Фильтры и действия шапки
    filters?: IFilterItem[];
    /** Скрыть шапку с фильтрами (значения из URL при этом продолжают работать) */
    hideFilters?: boolean;
    searchButton?: Toggle<SmartTableSearchButton>;
    download?: SmartTableDownload;

    // Вид
    title?: string;
    className?: string;
    view?: SmartTableView;
    viewModal?: Toggle<SmartTableViewModal<RecordType>>;
    mobile?: Toggle<SmartTableMobile<RecordType>>;
    /** Полностью свой рендер вместо таблицы */
    customRender?: (items: RecordType[], total: number) => ReactNode;
}
