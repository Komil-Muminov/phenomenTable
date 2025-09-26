import React, { useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
} from '@tanstack/react-table';
import { useDataAdapter } from './core/hooks/useDataAdapter';
import { useSmartColumns } from './core/hooks/useSmartColumns';
import { useSmartFilters } from './core/hooks/useSmartFilters';
import { TableRenderer } from './ui/TableRenderer';
import { FilterContainer } from './ui/filters/FilterContainer';

interface PhenomenTableProps {
    // Данные
    dataSource: any; // Обязательный, как объект для fetch от бэка

    // Колонки
    columns?: (deps: any) => any[]; // Функция, принимающая зависимости
    columnDeps?: any; // Объект с зависимостями для колонок
    columnRoles?: any;

    // Фильтры
    filters?: 'smart' | any[] | (() => any[]); // Добавили возможность передачи функции
    hideFilters?: boolean;
    filterMode?: 'server'; // Только 'server' по умолчанию

    // Фичи
    features?: string[];

    // Настройки
    pageSize?: number;
    sortable?: boolean;
    searchable?: boolean;

    // События
    onRowClick?: (row: any) => void;
    onDataChange?: (data: any[]) => void;
    onFiltersChange?: (filters: any) => void;
    onSortChange?: (sorting: any) => void;
    onPaginationChange?: (pagination: any) => void;

    // UI
    className?: string;
    style?: any;
    loading?: boolean;

    // Мобильная версия
    mobileBreakpoint?: number;
    mobileView?: 'cards' | 'scroll';

    // Экспорт
    showExport?: boolean;
    exportApi?: (body: any) => Promise<any>;
}

export const PhenomenTable: React.FC<PhenomenTableProps> = React.memo(
    ({
        // Данные
        dataSource,

        // Колонки
        columns,
        columnDeps = {},
        columnRoles = {},

        // Фильтры
        filters = 'smart',
        hideFilters = false,
        filterMode = 'server',

        // Фичи
        features = [],

        // Настройки
        pageSize = 10,
        sortable = true,
        searchable = false,

        // События
        onRowClick,
        onDataChange,
        onFiltersChange,
        onSortChange,
        onPaginationChange,

        // UI
        className = '',
        style = {},
        loading = false,

        // Мобильная версия
        mobileBreakpoint = 768,
        mobileView = 'cards',

        // Экспорт
        showExport = false,
        exportApi,
    }) => {
        // 1. Адаптация данных
        const { data, totalCount, isLoading, refresh } = useDataAdapter({
            dataSource,
            pageSize,
            onDataChange,
        });

        // 2. Генерация колонок
        const tableColumns = useSmartColumns({
            data,
            columns,
            columnRoles,
            features,
            onRowClick,
        });

        // Обработка фильтров, если это функция
        const resolvedFilters = typeof filters === 'function' ? filters() : filters;

        // 3. Умные фильтры
        const {
            globalFilter,
            columnFilters,
            setGlobalFilter,
            setColumnFilters,
            filterComponents,
            applyFilters,
            resetFilters,
        } = useSmartFilters({
            data,
            columns: tableColumns,
            filters: resolvedFilters,
            searchable,
            filterMode,
            onFiltersChange,
        });

        // 4. Инициализация TanStack Table
        const table = useReactTable({
            data: data || [],
            columns: tableColumns,
            getCoreRowModel: getCoreRowModel(),
            state: {
                pagination: {
                    pageIndex: 0,
                    pageSize,
                },
            },
            enableSorting: sortable,
            manualPagination: true,
            manualSorting: true,
            manualFiltering: true,
            pageCount: Math.ceil((totalCount || 0) / pageSize),
            onSortingChange: onSortChange,
            onPaginationChange: onPaginationChange,
        });

        // 5. Обработка изменений для серверного режима
        React.useEffect(() => {
            if (onFiltersChange) {
                const serverFilters = {
                    globalFilter: globalFilter || '',
                    columnFilters: columnFilters || [],
                    sorting: table.getState().sorting || [],
                    pagination: table.getState().pagination,
                };
                onFiltersChange(serverFilters);
                refresh();
            }
        }, [
            globalFilter,
            columnFilters,
            table.getState().sorting,
            table.getState().pagination,
            onFiltersChange,
            refresh,
        ]);

        // 6. Обработка изменений данных
        React.useEffect(() => {
            if (onDataChange && data) {
                onDataChange(data);
            }
        }, [data, onDataChange]);

        // 7. Обработка клика по строке
        const handleRowClick = React.useCallback(
            (row: any) => {
                if (onRowClick) {
                    onRowClick(row.original);
                }
            },
            [onRowClick],
        );

        // 8. Проверка на мобильное устройство
        const isMobile = typeof window !== 'undefined' && window.innerWidth < mobileBreakpoint;

        return (
            <div className={`phenomen-table ${className}`} style={style}>
                {/* Фильтры */}
                {!hideFilters && resolvedFilters !== false && (
                    <div className="phenomen-table-controls">
                        <FilterContainer
                            filters={filterComponents}
                            globalFilter={globalFilter}
                            onGlobalFilterChange={setGlobalFilter}
                            onColumnFiltersChange={setColumnFilters}
                            onResetFilters={resetFilters}
                            isMobile={isMobile}
                            filterMode={filterMode}
                        />
                    </div>
                )}

                {/* Основная таблица */}
                <TableRenderer
                    table={table}
                    isLoading={isLoading || loading}
                    onRowClick={handleRowClick}
                    isMobile={isMobile}
                    mobileView={mobileView}
                    features={features}
                    showExport={showExport}
                    exportApi={exportApi}
                    data={data}
                    loading={isLoading || loading}
                    onExport={refresh}
                    globalFilter={globalFilter}
                    columnFilters={columnFilters}
                    sorting={table.getState().sorting}
                    pagination={table.getState().pagination}
                    tableColumns={tableColumns}
                />
            </div>
        );
    },
);
