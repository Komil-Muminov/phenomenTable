import React from 'react';
import { flexRender } from '@tanstack/react-table';
import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';

interface TableRendererProps {
    table: any;
    isLoading: boolean;
    onRowClick?: (row: any) => void;
    isMobile: boolean;
    mobileView: 'cards' | 'scroll';
    features: string[];
}

export const TableRenderer: React.FC<TableRendererProps> = ({
    table,
    isLoading,
    onRowClick,
    isMobile,
    mobileView,
    features,
}) => {
    const rows = table.getRowModel().rows;

    // Загрузочное состояние
    if (isLoading) {
        return <LoadingState />;
    }

    // Пустое состояние
    if (rows.length === 0) {
        return <EmptyState />;
    }

    // Мобильная версия - карточки
    if (isMobile && mobileView === 'cards') {
        return <MobileCardView rows={rows} onRowClick={onRowClick} />;
    }

    // Обычная таблица
    return (
        <div className="phenomen-table-container">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white">
                    <TableHeader table={table} />
                    <TableBody rows={rows} onRowClick={onRowClick} />
                </table>
            </div>

            <TablePagination table={table} />
        </div>
    );
};

// Заголовок таблицы
const TableHeader: React.FC<{ table: any }> = ({ table }) => (
    <thead className="bg-gray-50 border-b border-gray-200">
        {table.getHeaderGroups().map((headerGroup: any) => (
            <tr key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => (
                    <th
                        key={header.id}
                        className={`
              px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
              ${header.column.getCanSort() ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}
            `}
                        onClick={header.column.getToggleSortingHandler()}
                        style={{ width: header.getSize() }}
                    >
                        <div className="flex items-center gap-2">
                            {flexRender(header.column.columnDef.header, header.getContext())}

                            {header.column.getCanSort() && (
                                <div className="flex flex-col">
                                    <ChevronUpIcon
                                        className={`w-3 h-3 ${
                                            header.column.getIsSorted() === 'asc' ? 'text-blue-600' : 'text-gray-400'
                                        }`}
                                    />
                                    <ChevronDownIcon
                                        className={`w-3 h-3 -mt-1 ${
                                            header.column.getIsSorted() === 'desc' ? 'text-blue-600' : 'text-gray-400'
                                        }`}
                                    />
                                </div>
                            )}
                        </div>
                    </th>
                ))}
            </tr>
        ))}
    </thead>
);

// Тело таблицы
const TableBody: React.FC<{ rows: any[]; onRowClick?: (row: any) => void }> = ({ rows, onRowClick }) => (
    <tbody className="bg-white divide-y divide-gray-200">
        {rows.map((row, index) => (
            <tr
                key={row.id}
                className={`
          ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
          ${onRowClick ? 'hover:bg-blue-50 cursor-pointer' : 'hover:bg-gray-100'}
          transition-colors duration-150
        `}
                onClick={() => onRowClick?.(row)}
            >
                {row.getVisibleCells().map((cell: any) => (
                    <td key={cell.id} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                ))}
            </tr>
        ))}
    </tbody>
);

// Мобильная версия - карточки
const MobileCardView: React.FC<{
    rows: any[];
    onRowClick?: (row: any) => void;
}> = ({ rows, onRowClick }) => (
    <div className="space-y-4 p-4">
        {rows.map((row) => (
            <div
                key={row.id}
                className={`
          bg-white rounded-lg shadow-sm border border-gray-200 p-4
          ${onRowClick ? 'cursor-pointer hover:shadow-md' : ''}
          transition-shadow duration-200
        `}
                onClick={() => onRowClick?.(row)}
            >
                {row.getVisibleCells().map((cell: any) => {
                    const header = cell.column.columnDef.header;
                    const value = cell.getValue();

                    // Пропускаем пустые значения и ID
                    if (!value || cell.column.id === 'id') return null;

                    return (
                        <div key={cell.id} className="flex justify-between items-center py-1">
                            <span className="text-sm font-medium text-gray-600">
                                {typeof header === 'string' ? header : cell.column.id}:
                            </span>
                            <span className="text-sm text-gray-900 ml-2">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </span>
                        </div>
                    );
                })}
            </div>
        ))}
    </div>
);

// Пагинация
const TablePagination: React.FC<{ table: any }> = ({ table }) => {
    const pageIndex = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();
    const canPrevious = table.getCanPreviousPage();
    const canNext = table.getCanNextPage();

    if (pageCount <= 1) return null;

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                    Страница {pageIndex + 1} из {pageCount}
                </span>
                <span className="text-sm text-gray-500">({table.getFilteredRowModel().rows.length} записей)</span>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => table.setPageIndex(0)}
                    disabled={!canPrevious}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    ««
                </button>

                <button
                    onClick={() => table.previousPage()}
                    disabled={!canPrevious}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    «
                </button>

                <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                >
                    {[10, 20, 30, 50].map((pageSize) => (
                        <option key={pageSize} value={pageSize}>
                            {pageSize} строк
                        </option>
                    ))}
                </select>

                <button
                    onClick={() => table.nextPage()}
                    disabled={!canNext}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    »
                </button>

                <button
                    onClick={() => table.setPageIndex(pageCount - 1)}
                    disabled={!canNext}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    »»
                </button>
            </div>
        </div>
    );
};

// Загрузочное состояние
const LoadingState: React.FC = () => (
    <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Загрузка данных...</span>
        </div>
    </div>
);

// Пустое состояние
const EmptyState: React.FC = () => (
    <div className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
            </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Нет данных</h3>
        <p className="text-gray-500 text-center">Данные отсутствуют или не соответствуют критериям фильтрации</p>
    </div>
);
