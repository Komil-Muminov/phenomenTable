import React, { useState } from 'react';
import { DownloadIcon, FileTextIcon, FileSpreadsheetIcon, SettingsIcon, XIcon } from 'lucide-react';

interface ExportButtonProps {
    onExport: () => void;
    data: any[];
    loading: boolean;
}

interface ExportOptions {
    format: string;
    includeFiltered: boolean;
    includeHeaders: boolean;
    selectedColumns: string[];
    dateRange: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ onExport, data, loading }) => {
    const [showModal, setShowModal] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [options, setOptions] = useState<ExportOptions>({
        format: 'csv',
        includeFiltered: true,
        includeHeaders: true,
        selectedColumns: [],
        dateRange: 'all',
    });

    // Получение доступных колонок из данных
    const availableColumns =
        data && data.length > 0
            ? Object.keys(data[0]).map((key) => ({
                  key,
                  label: formatColumnName(key),
              }))
            : [];

    // Быстрый экспорт
    const handleQuickExport = async () => {
        setIsExporting(true);
        try {
            await exportData({
                ...options,
                selectedColumns: availableColumns.map((col) => col.key),
            });
            onExport();
        } finally {
            setIsExporting(false);
        }
    };

    // Экспорт с настройками
    const handleCustomExport = async () => {
        setIsExporting(true);
        try {
            const exportOptions = {
                ...options,
                selectedColumns:
                    options.selectedColumns.length > 0
                        ? options.selectedColumns
                        : availableColumns.map((col) => col.key),
            };
            await exportData(exportOptions);
            setShowModal(false);
            onExport();
        } finally {
            setIsExporting(false);
        }
    };

    // Функция экспорта
    const exportData = async (exportOptions: ExportOptions) => {
        let exportData = [...data];

        // Фильтрация по дате
        if (exportOptions.dateRange !== 'all') {
            exportData = filterByDateRange(exportData, exportOptions.dateRange);
        }

        // Выбор колонок
        if (exportOptions.selectedColumns.length > 0) {
            exportData = exportData.map((row) => {
                const filteredRow: any = {};
                exportOptions.selectedColumns.forEach((col) => {
                    filteredRow[col] = row[col];
                });
                return filteredRow;
            });
        }

        // Экспорт в нужном формате
        switch (exportOptions.format) {
            case 'csv':
                downloadCSV(exportData, exportOptions.includeHeaders);
                break;
            case 'json':
                downloadJSON(exportData);
                break;
            case 'excel':
                downloadExcel(exportData, exportOptions.includeHeaders);
                break;
        }
    };

    // Обновление колонок
    const toggleColumn = (columnKey: string) => {
        setOptions((prev) => ({
            ...prev,
            selectedColumns: prev.selectedColumns.includes(columnKey)
                ? prev.selectedColumns.filter((col) => col !== columnKey)
                : [...prev.selectedColumns, columnKey],
        }));
    };

    const selectAllColumns = () => {
        setOptions((prev) => ({
            ...prev,
            selectedColumns: availableColumns.map((col) => col.key),
        }));
    };

    const deselectAllColumns = () => {
        setOptions((prev) => ({
            ...prev,
            selectedColumns: [],
        }));
    };

    return (
        <>
            {/* Кнопка экспорта */}
            <div className="flex items-center gap-2">
                <button
                    onClick={handleQuickExport}
                    disabled={loading || !data?.length || isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <DownloadIcon className="w-4 h-4" />
                    {isExporting ? 'Экспорт...' : 'Экспорт'}
                </button>

                <button
                    onClick={() => setShowModal(true)}
                    disabled={loading || !data?.length}
                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <SettingsIcon className="w-4 h-4" />
                </button>
            </div>

            {/* Модалка настроек экспорта */}
            {showModal && (
                <ExportModal
                    options={options}
                    setOptions={setOptions}
                    availableColumns={availableColumns}
                    isExporting={isExporting}
                    onExport={handleCustomExport}
                    onClose={() => setShowModal(false)}
                    onToggleColumn={toggleColumn}
                    onSelectAll={selectAllColumns}
                    onDeselectAll={deselectAllColumns}
                />
            )}
        </>
    );
};

// Модалка настроек экспорта
const ExportModal: React.FC<{
    options: ExportOptions;
    setOptions: React.Dispatch<React.SetStateAction<ExportOptions>>;
    availableColumns: { key: string; label: string }[];
    isExporting: boolean;
    onExport: () => void;
    onClose: () => void;
    onToggleColumn: (key: string) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
}> = ({
    options,
    setOptions,
    availableColumns,
    isExporting,
    onExport,
    onClose,
    onToggleColumn,
    onSelectAll,
    onDeselectAll,
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
                {/* Заголовок */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Настройки экспорта</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Контент */}
                <div className="p-4 overflow-y-auto max-h-96">
                    <div className="space-y-6">
                        {/* Формат */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Формат файла</label>
                            <div className="grid grid-cols-3 gap-2">
                                <FormatOption
                                    format="csv"
                                    icon={FileTextIcon}
                                    label="CSV"
                                    selected={options.format === 'csv'}
                                    onClick={() => setOptions((prev) => ({ ...prev, format: 'csv' }))}
                                />
                                <FormatOption
                                    format="excel"
                                    icon={FileSpreadsheetIcon}
                                    label="Excel"
                                    selected={options.format === 'excel'}
                                    onClick={() => setOptions((prev) => ({ ...prev, format: 'excel' }))}
                                />
                                <FormatOption
                                    format="json"
                                    icon={FileTextIcon}
                                    label="JSON"
                                    selected={options.format === 'json'}
                                    onClick={() => setOptions((prev) => ({ ...prev, format: 'json' }))}
                                />
                            </div>
                        </div>

                        {/* Опции */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Настройки</label>
                            <div className="space-y-2">
                                <CheckboxOption
                                    checked={options.includeHeaders}
                                    onChange={(checked) => setOptions((prev) => ({ ...prev, includeHeaders: checked }))}
                                    label="Включить заголовки"
                                />
                                <CheckboxOption
                                    checked={options.includeFiltered}
                                    onChange={(checked) =>
                                        setOptions((prev) => ({ ...prev, includeFiltered: checked }))
                                    }
                                    label="Только отфильтрованные данные"
                                />
                            </div>
                        </div>

                        {/* Период */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Период данных</label>
                            <select
                                value={options.dateRange}
                                onChange={(e) => setOptions((prev) => ({ ...prev, dateRange: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Все данные</option>
                                <option value="today">Сегодня</option>
                                <option value="week">Последняя неделя</option>
                                <option value="month">Последний месяц</option>
                                <option value="quarter">Последний квартал</option>
                            </select>
                        </div>

                        {/* Колонки */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Колонки для экспорта ({options.selectedColumns.length}/{availableColumns.length})
                                </label>
                                <div className="flex gap-2">
                                    <button onClick={onSelectAll} className="text-xs text-blue-600 hover:text-blue-800">
                                        Все
                                    </button>
                                    <button
                                        onClick={onDeselectAll}
                                        className="text-xs text-gray-600 hover:text-gray-800"
                                    >
                                        Ничего
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                                {availableColumns.map((column) => (
                                    <div key={column.key} className="flex items-center p-2 hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={options.selectedColumns.includes(column.key)}
                                            onChange={() => onToggleColumn(column.key)}
                                            className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">{column.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Футер */}
                <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:text-gray-900">
                        Отмена
                    </button>
                    <button
                        onClick={onExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        {isExporting ? 'Экспорт...' : 'Экспортировать'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Компонент выбора формата
const FormatOption: React.FC<{
    format: string;
    icon: React.ComponentType<any>;
    label: string;
    selected: boolean;
    onClick: () => void;
}> = ({ format, icon: Icon, label, selected, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center p-3 border rounded-lg transition-colors ${
            selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'
        }`}
    >
        <Icon className="w-5 h-5 mb-1" />
        <span className="text-xs font-medium">{label}</span>
    </button>
);

// Компонент чекбокса
const CheckboxOption: React.FC<{
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
}> = ({ checked, onChange, label }) => (
    <label className="flex items-center">
        <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">{label}</span>
    </label>
);

// Утилиты экспорта

const formatColumnName = (key: string): string => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]/g, ' ')
        .replace(/^\w/, (c) => c.toUpperCase())
        .trim();
};

const filterByDateRange = (data: any[], range: string): any[] => {
    if (range === 'all') return data;

    const now = new Date();
    let startDate = new Date();

    switch (range) {
        case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        case 'quarter':
            startDate.setMonth(now.getMonth() - 3);
            break;
    }

    // Находим поле с датой
    const dateField =
        data.length > 0
            ? Object.keys(data[0]).find(
                  (key) =>
                      key.toLowerCase().includes('date') ||
                      key.toLowerCase().includes('created') ||
                      key.toLowerCase().includes('updated'),
              )
            : null;

    if (!dateField) return data;

    return data.filter((row) => {
        const date = new Date(row[dateField]);
        return !isNaN(date.getTime()) && date >= startDate;
    });
};

const downloadCSV = (data: any[], includeHeaders: boolean) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
        ...(includeHeaders ? [headers.join(',')] : []),
        ...data.map((row) =>
            headers
                .map((header) => {
                    const value = row[header];
                    // Экранируем запятые и кавычки
                    const stringValue = String(value || '');
                    return stringValue.includes(',') || stringValue.includes('"')
                        ? `"${stringValue.replace(/"/g, '""')}"`
                        : stringValue;
                })
                .join(','),
        ),
    ].join('\n');

    downloadFile(csvContent, 'export.csv', 'text/csv');
};

const downloadJSON = (data: any[]) => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, 'export.json', 'application/json');
};

const downloadExcel = (data: any[], includeHeaders: boolean) => {
    // Простая реализация - можно расширить с помощью библиотеки типа xlsx
    downloadCSV(data, includeHeaders); // Fallback к CSV
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
