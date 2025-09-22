import { useState, useMemo } from 'react';

interface UseSmartFiltersOptions {
    data: any[];
    columns: any[];
    filters: 'smart' | any[] | false;
    searchable?: boolean;
}

interface FilterComponent {
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    options?: any[];
    component: React.ComponentType<any>;
}

export const useSmartFilters = ({ data, columns, filters, searchable = true }: UseSmartFiltersOptions) => {
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState<any[]>([]);

    // Генерация компонентов фильтров
    const filterComponents = useMemo(() => {
        if (filters === false) return [];

        // Если фильтры переданы вручную
        if (Array.isArray(filters)) {
            return filters.map((filter) => ({
                ...filter,
                component: getFilterComponent(filter.type),
            }));
        }

        // Автогенерация умных фильтров
        if (filters === 'smart' && columns.length > 0) {
            const smartFilters: FilterComponent[] = [];

            // Глобальный поиск
            if (searchable) {
                smartFilters.push({
                    id: 'global',
                    type: 'search',
                    label: 'Поиск',
                    placeholder: 'Поиск по всем полям...',
                    component: getFilterComponent('search'),
                });
            }

            // Автофильтры по колонкам
            columns.forEach((column) => {
                const { id, meta } = column;
                if (!meta || !id) return;

                const { type } = meta;
                const filterConfig = generateFilterForType(id, type, data);

                if (filterConfig) {
                    smartFilters.push({
                        ...filterConfig,
                        component: getFilterComponent(filterConfig.type),
                    });
                }
            });

            return smartFilters.slice(0, 8); // Ограничиваем количество фильтров
        }

        return [];
    }, [data, columns, filters, searchable]);

    // Применение фильтров
    const applyFilters = (filterId: string, value: any) => {
        if (filterId === 'global') {
            setGlobalFilter(value);
            return;
        }

        setColumnFilters((prev) => {
            const existing = prev.find((f) => f.id === filterId);

            if (!value || value === '' || (Array.isArray(value) && value.length === 0)) {
                // Удаляем фильтр если значение пустое
                return prev.filter((f) => f.id !== filterId);
            }

            if (existing) {
                // Обновляем существующий
                return prev.map((f) => (f.id === filterId ? { id: filterId, value } : f));
            } else {
                // Добавляем новый
                return [...prev, { id: filterId, value }];
            }
        });
    };

    // Сброс фильтров
    const resetFilters = () => {
        setGlobalFilter('');
        setColumnFilters([]);
    };

    // Получение активных фильтров
    const activeFilters = useMemo(() => {
        const active: any[] = [];

        if (globalFilter) {
            active.push({ id: 'global', value: globalFilter, label: `Поиск: "${globalFilter}"` });
        }

        columnFilters.forEach((filter) => {
            const filterConfig = filterComponents.find((f) => f.id === filter.id);
            if (filterConfig) {
                active.push({
                    ...filter,
                    label: `${filterConfig.label}: ${formatFilterValue(filter.value, filterConfig.type)}`,
                });
            }
        });

        return active;
    }, [globalFilter, columnFilters, filterComponents]);

    return {
        globalFilter,
        columnFilters,
        setGlobalFilter,
        setColumnFilters,
        filterComponents,
        applyFilters,
        resetFilters,
        activeFilters,
    };
};

// Генерация фильтра для типа колонки
const generateFilterForType = (columnId: string, type: string, data: any[]): FilterComponent | null => {
    const label = formatFilterLabel(columnId);

    switch (type) {
        case 'status':
        case 'boolean':
            const uniqueValues = getUniqueValues(data, columnId);
            if (uniqueValues.length <= 10) {
                return {
                    id: columnId,
                    type: 'select',
                    label,
                    options: uniqueValues.map((val) => ({
                        label: String(val),
                        value: val,
                    })),
                };
            }
            break;

        case 'date':
            return {
                id: columnId,
                type: 'dateRange',
                label,
                placeholder: 'Выберите период',
            };

        case 'number':
        case 'money':
        case 'percent':
            return {
                id: columnId,
                type: 'numberRange',
                label,
                placeholder: 'От - До',
            };

        case 'text':
            return {
                id: columnId,
                type: 'text',
                label,
                placeholder: `Поиск по ${label.toLowerCase()}`,
            };

        case 'array':
            const allArrayValues = data
                .flatMap((row) => row[columnId] || [])
                .filter((val, index, arr) => arr.indexOf(val) === index);

            if (allArrayValues.length <= 20) {
                return {
                    id: columnId,
                    type: 'multiSelect',
                    label,
                    options: allArrayValues.map((val) => ({
                        label: String(val),
                        value: val,
                    })),
                };
            }
            break;
    }

    return null;
};

// Получение компонента фильтра
const getFilterComponent = (type: string) => {
    const components = {
        search: ({ value, onChange, placeholder }: any) => (
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        ),

        text: ({ value, onChange, placeholder }: any) => (
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        ),

        select: ({ value, onChange, options, placeholder }: any) => (
            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">{placeholder || 'Выберите...'}</option>
                {options?.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        ),

        multiSelect: ({ value, onChange, options, placeholder }: any) => (
            <select
                multiple
                value={value || []}
                onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                    onChange(selected);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                size={3}
            >
                {options?.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        ),

        dateRange: ({ value, onChange, placeholder }: any) => (
            <div className="flex gap-2">
                <input
                    type="date"
                    value={value?.from || ''}
                    onChange={(e) => onChange({ ...value, from: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="date"
                    value={value?.to || ''}
                    onChange={(e) => onChange({ ...value, to: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        ),

        numberRange: ({ value, onChange, placeholder }: any) => (
            <div className="flex gap-2">
                <input
                    type="number"
                    value={value?.min || ''}
                    onChange={(e) => onChange({ ...value, min: e.target.value })}
                    placeholder="От"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                    type="number"
                    value={value?.max || ''}
                    onChange={(e) => onChange({ ...value, max: e.target.value })}
                    placeholder="До"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        ),
    };

    return components[type as keyof typeof components] || components.text;
};

// Получение уникальных значений колонки
const getUniqueValues = (data: any[], columnId: string): any[] => {
    const values = data.map((row) => row[columnId]).filter((val) => val != null);

    return [...new Set(values)].slice(0, 10);
};

// Форматирование названия фильтра
const formatFilterLabel = (columnId: string): string => {
    return columnId
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]/g, ' ')
        .replace(/^\w/, (c) => c.toUpperCase())
        .trim();
};

// Форматирование значения фильтра для отображения
const formatFilterValue = (value: any, type: string): string => {
    if (!value) return '';

    switch (type) {
        case 'dateRange':
            return `${value.from || ''} - ${value.to || ''}`;
        case 'numberRange':
            return `${value.min || ''} - ${value.max || ''}`;
        case 'multiSelect':
            return Array.isArray(value) ? value.join(', ') : String(value);
        default:
            return String(value);
    }
};
