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

    // UI
    className = '',
    style = {},
    loading = false,

    // Мобильная версия
    mobileBreakpoint = 768,
    mobileView = 'cards',
}) => {
    // 1. Адаптация данных - универсальная обработка любого формата
    const { data, totalCount, meta, isLoading } = useDataAdapter({
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
    const { globalFilter, columnFilters, setGlobalFilter, setColumnFilters, filterComponents } = useSmartFilters({
        data,
        columns: tableColumns,
        filters,
        searchable,
    });

    // 4. Инициализация TanStack Table
    const table = useReactTable({
        data: data || [],
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            globalFilter,
            columnFilters,
            pagination: {
                pageIndex: 0,
                pageSize,
            },
        },
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        enableSorting: sortable,
        enableFilters: true,
        manualPagination: false,
        pageCount: Math.ceil((totalCount || data?.length || 0) / pageSize),
    });

    // 5. Обработка изменений данных
    React.useEffect(() => {
        if (onDataChange && data) {
            onDataChange(data);
        }
    }, [data, onDataChange]);

    // 6. Обработка клика по строке
    const handleRowClick = (row: any) => {
        if (onRowClick) {
            onRowClick(row.original);
        }
    };

    // 7. Обработка экспорта
    const handleExport = () => {
        const exportData = table.getFilteredRowModel().rows.map((row) => row.original);
        if (onExport) {
            onExport(exportData);
        }
    };

    // 8. Проверка на мобильное устройство
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
                        onGlobalFilterChange={setGlobalFilter}
                        onColumnFiltersChange={setColumnFilters}
                        isMobile={isMobile}
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
