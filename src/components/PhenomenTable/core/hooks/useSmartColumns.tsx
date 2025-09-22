import { useMemo } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { SmartCell } from '../../ui/cells/SmartCell';
import { ChartCell } from '../../ui/cells/ChartCell';

interface UseSmartColumnsOptions {
    data: any[];
    columns: 'auto' | any[];
    columnRoles?: any;
    features?: string[];
    onRowClick?: (row: any) => void;
}

export const useSmartColumns = ({
    data,
    columns,
    columnRoles = {},
    features = [],
    onRowClick,
}: UseSmartColumnsOptions) => {
    const columnHelper = createColumnHelper<any>();

    return useMemo(() => {
        // Если колонки переданы вручную
        if (Array.isArray(columns)) {
            return columns.map((col) => {
                if (col.accessorKey || col.id) {
                    return col;
                }
                // Преобразуем простой формат в TanStack формат
                return columnHelper.accessor(col.key || col.dataIndex || col.id, {
                    header: col.title || col.header || col.label,
                    cell: col.render || col.cell || (({ getValue }) => <SmartCell value={getValue()} />),
                    enableSorting: col.sortable !== false,
                    size: col.width,
                });
            });
        }

        // Автогенерация колонок
        if (columns === 'auto' && data && data.length > 0) {
            const sampleRow = data[0];
            const keys = Object.keys(sampleRow);

            return keys.map((key) => {
                const sampleValue = sampleRow[key];
                const valueType = detectColumnType(key, sampleValue, data);
                const role = getColumnRole(key, columnRoles);

                return columnHelper.accessor(key, {
                    header: formatHeader(key),
                    cell: ({ getValue, row }) => {
                        const value = getValue();

                        // Особые роли колонок
                        if (role === 'chart' || features.includes('charts')) {
                            const chartData = extractChartData(data, key);
                            if (chartData.length > 1) {
                                return <ChartCell data={chartData} value={value} type="sparkline" />;
                            }
                        }

                        if (role === 'action' && onRowClick) {
                            return (
                                <button
                                    onClick={() => onRowClick(row.original)}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Открыть
                                </button>
                            );
                        }

                        return <SmartCell value={value} type={valueType} role={role} options={{ features }} />;
                    },
                    enableSorting: valueType !== 'object' && valueType !== 'array',
                    size: getColumnWidth(valueType, role),
                    meta: {
                        type: valueType,
                        role: role,
                    },
                });
            });
        }

        return [];
    }, [data, columns, columnRoles, features, onRowClick, columnHelper]);
};

// Определение типа колонки по значению
const detectColumnType = (key: string, value: any, allData: any[]): string => {
    // Проверяем ключ на паттерны
    const keyLower = key.toLowerCase();

    // ID колонки
    if (keyLower === 'id' || keyLower.endsWith('_id') || keyLower.endsWith('id')) {
        return 'id';
    }

    // Даты
    if (
        keyLower.includes('date') ||
        keyLower.includes('time') ||
        keyLower.includes('created') ||
        keyLower.includes('updated')
    ) {
        return 'date';
    }

    // Email
    if (keyLower.includes('email') && typeof value === 'string' && value.includes('@')) {
        return 'email';
    }

    // URL
    if (keyLower.includes('url') || keyLower.includes('link')) {
        return 'url';
    }

    // Изображения
    if (keyLower.includes('image') || keyLower.includes('photo') || keyLower.includes('avatar')) {
        return 'image';
    }

    // Статусы
    if (keyLower.includes('status') || keyLower.includes('state') || keyLower.includes('active')) {
        return 'status';
    }

    // Деньги
    if (
        keyLower.includes('price') ||
        keyLower.includes('cost') ||
        keyLower.includes('amount') ||
        keyLower.includes('sum') ||
        keyLower.includes('total') ||
        keyLower.includes('salary')
    ) {
        return 'money';
    }

    // Проценты
    if (
        keyLower.includes('percent') ||
        keyLower.includes('rate') ||
        (typeof value === 'number' && value >= 0 && value <= 100)
    ) {
        return 'percent';
    }

    // Анализ значений
    if (value === null || value === undefined) {
        // Смотрим на другие строки
        const nonNullValue = allData.find((row) => row[key] != null)?.[key];
        if (nonNullValue) {
            return detectColumnType(key, nonNullValue, allData);
        }
        return 'text';
    }

    // Типы по значению
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';

    // Строки - дополнительные проверки
    if (typeof value === 'string') {
        // Дата в строковом формате
        if (isDateString(value)) return 'date';

        // JSON строка
        if (value.startsWith('{') && value.endsWith('}')) return 'json';

        // Длинный текст
        if (value.length > 100) return 'longtext';

        return 'text';
    }

    return 'text';
};

// Получение роли колонки
const getColumnRole = (key: string, columnRoles: any): string => {
    // Прямое указание роли
    if (columnRoles[key]) {
        return columnRoles[key];
    }

    // Роли по группам
    for (const [role, keys] of Object.entries(columnRoles)) {
        if (Array.isArray(keys) && keys.includes(key)) {
            return role;
        }
    }

    return 'default';
};

// Форматирование заголовка
const formatHeader = (key: string): string => {
    return key
        .replace(/([A-Z])/g, ' $1') // camelCase -> camel Case
        .replace(/[_-]/g, ' ') // snake_case, kebab-case -> space
        .replace(/^\w/, (c) => c.toUpperCase()) // Первая буква заглавная
        .trim();
};

// Определение ширины колонки
const getColumnWidth = (type: string, role: string): number => {
    if (role === 'action') return 100;

    switch (type) {
        case 'id':
            return 80;
        case 'boolean':
            return 80;
        case 'date':
            return 120;
        case 'money':
            return 100;
        case 'percent':
            return 80;
        case 'status':
            return 100;
        case 'image':
            return 60;
        case 'longtext':
            return 300;
        case 'email':
            return 200;
        case 'url':
            return 200;
        default:
            return 150;
    }
};

// Проверка строки на дату
const isDateString = (str: string): boolean => {
    if (!str) return false;

    // ISO формат
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) return true;

    // Другие популярные форматы
    const datePatterns = [
        /^\d{1,2}\/\d{1,2}\/\d{4}/, // MM/DD/YYYY
        /^\d{1,2}\.\d{1,2}\.\d{4}/, // DD.MM.YYYY
        /^\d{4}\/\d{1,2}\/\d{1,2}/, // YYYY/MM/DD
    ];

    return datePatterns.some((pattern) => pattern.test(str)) && !isNaN(Date.parse(str));
};

// Извлечение данных для графиков
const extractChartData = (data: any[], key: string): number[] => {
    return data
        .map((row) => row[key])
        .filter((val) => typeof val === 'number' && !isNaN(val))
        .slice(0, 20); // Ограничиваем для производительности
};
