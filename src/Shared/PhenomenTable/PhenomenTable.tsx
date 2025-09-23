import React from 'react';
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
import { TableSummary } from './ui/components/TableSummary';
import { ExportButton } from './ui/components/ExportButton';

interface PhenomenTableProps {
    // Данные
    dataSource?: any;

    // Колонки
    columns?: 'auto' | any[];
    columnRoles?: any;

    // Фильтры
    filters?: 'smart' | any[] | false;
    hideFilters?: boolean;
    filterMode?: 'client' | 'server';

    // Фичи
    features?: string[];
    showSummary?: boolean;
    showExport?: boolean;

    // Настройки
    pageSize?: number;
    sortable?: boolean;
    searchable?: boolean;

    // События
    onRowClick?: (row: any) => void;
    onDataChange?: (data: any[]) => void;
    onExport?: (data: any[]) => void;
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
}

export const PhenomenTable: React.FC<PhenomenTableProps> = ({
    // Данные
    dataSource,

    // Колонки
    columns = 'auto',
    columnRoles = {},

    // Фильтры
    filters = 'smart',
    hideFilters = false,
    filterMode = 'client',

    // Фичи
    features = [],
    showSummary = true,
    showExport = false,

    // Настройки
    pageSize = 10,
    sortable = true,
    searchable = true,

    // События
    onRowClick,
    onDataChange,
    onExport,
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
}) => {
    // 1. Адаптация данных - универсальная обработка любого формата
    const { data, totalCount, meta, isLoading, refresh } = useDataAdapter({
        dataSource,
        pageSize,
        onDataChange,
    });

    // 2. Генерация колонок - автоматически или по ролям
    const tableColumns = useSmartColumns({
        data,
        columns,
        columnRoles,
        features,
        onRowClick,
    });

    // 3. Умные фильтры - автоматически по типам данных
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
        filters,
        searchable,
        filterMode,
        onFiltersChange,
    });

    // 4. Инициализация TanStack Table
    const table = useReactTable({
        data: data || [],
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: filterMode === 'client' ? getPaginationRowModel() : undefined,
        getSortedRowModel: filterMode === 'client' ? getSortedRowModel() : undefined,
        getFilteredRowModel: filterMode === 'client' ? getFilteredRowModel() : undefined,
        state: {
            globalFilter: filterMode === 'client' ? globalFilter : undefined,
            columnFilters: filterMode === 'client' ? columnFilters : undefined,
            pagination: {
                pageIndex: 0,
                pageSize,
            },
        },
        onGlobalFilterChange: filterMode === 'client' ? setGlobalFilter : undefined,
        onColumnFiltersChange: filterMode === 'client' ? setColumnFilters : undefined,
        enableSorting: sortable,
        enableFilters: filterMode === 'client',
        manualPagination: filterMode === 'server',
        manualSorting: filterMode === 'server',
        manualFiltering: filterMode === 'server',
        pageCount: filterMode === 'server' ? Math.ceil((totalCount || 0) / pageSize) : undefined,
    });

    // 5. Обработка изменений для серверного режима
    React.useEffect(() => {
        if (filterMode === 'server' && onFiltersChange) {
            const serverFilters = {
                globalFilter: globalFilter || '',
                columnFilters: columnFilters || [],
                sorting: table.getState().sorting || [],
                pagination: table.getState().pagination,
            };
            onFiltersChange(serverFilters);
        }
    }, [globalFilter, columnFilters, filterMode, onFiltersChange, table]);

    // 6. Обработка изменений данных
    React.useEffect(() => {
        if (onDataChange && data) {
            onDataChange(data);
        }
    }, [data, onDataChange]);

    // 7. Обработка клика по строке
    const handleRowClick = (row: any) => {
        if (onRowClick) {
            onRowClick(row.original);
        }
    };

    // 8. Обработка экспорта
    const handleExport = () => {
        const exportData =
            filterMode === 'client' ? table.getFilteredRowModel().rows.map((row) => row.original) : data || [];
        if (onExport) {
            onExport(exportData);
        }
    };

    // 9. Проверка на мобильное устройство
    const isMobile = typeof window !== 'undefined' && window.innerWidth < mobileBreakpoint;

    return (
        <div className={`phenomen-table ${className}`} style={style}>
            {/* Аналитика сверху */}
            {showSummary && <TableSummary data={data} meta={meta} totalCount={totalCount} features={features} />}

            {/* Фильтры */}
            {!hideFilters && filters !== false && (
                <div className="phenomen-table-controls">
                    <FilterContainer
                        filters={filterComponents}
                        globalFilter={globalFilter}
                        onGlobalFilterChange={filterMode === 'client' ? setGlobalFilter : applyFilters}
                        onColumnFiltersChange={filterMode === 'client' ? setColumnFilters : applyFilters}
                        onResetFilters={resetFilters}
                        isMobile={isMobile}
                        filterMode={filterMode}
                    />

                    {showExport && <ExportButton onExport={handleExport} data={data} loading={isLoading} />}
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
            />
        </div>
    );
};
