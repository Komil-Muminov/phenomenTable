import { useState } from 'react';
import { DownloadIcon } from 'lucide-react';

export const ExportButton = ({ onExport, data, loading, exportApi }: any) => {
    const [isExporting, setIsExporting] = useState(false);

    // Получение доступных колонок из данных
    const availableColumns = data && data.length > 0 ? Object.keys(data[0]) : [];

    // Быстрый экспорт
    const handleQuickExport = async () => {
        setIsExporting(true);
        try {
            const body = {
                data: filterByDateRange(data, 'all'),
                format: 'csv',
                includeFiltered: true,
                includeHeaders: true,
                selectedColumns: availableColumns,
                dateRange: 'all',
            };
            const response = await exportApi(body);
            downloadFile(response.data, response.filename || 'export.csv', response.contentType || 'text/csv');
            onExport();
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleQuickExport}
                disabled={loading || !data?.length || isExporting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <DownloadIcon className="w-4 h-4" />
                {isExporting ? 'Экспорт...' : 'Экспорт'}
            </button>
        </div>
    );
};

// Утилита для фильтрации по дате
const filterByDateRange = (data: any, range: any) => {
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

    return data.filter((row: any) => {
        const date = new Date(row[dateField]);
        return !isNaN(date.getTime()) && date >= startDate;
    });
};

// Утилита для скачивания файла
const downloadFile = (content: any, filename: any, mimeType: any) => {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
