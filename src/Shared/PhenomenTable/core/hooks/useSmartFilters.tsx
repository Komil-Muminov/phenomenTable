import { useState, useMemo, useCallback } from 'react';

export const useSmartFilters = ({
    data,
    columns,
    filters,
    searchable = false,
    filterMode = 'server',
    onFiltersChange,
}: any) => {
    const [globalFilter, setGlobalFilter] = useState('');
    const [columnFilters, setColumnFilters] = useState<any[]>([]);

    // Генерация компонентов фильтров
    const filterComponents = useMemo(() => {
        if (filters === false) return [];

        // Если фильтры переданы вручную
        if (Array.isArray(filters)) {
            return filters?.map((filter) => ({
                ...filter,
                component: getFilterComponent(filter.type),
            }));
        }

        // Автогенерация умных фильтров (ограничено)
        if (filters === 'smart' && columns.length > 0) {
            const smartFilters: any = [];

            // Глобальный поиск только если searchable
            if (searchable) {
                smartFilters.push({
                    id: 'global',
                    type: 'search',
                    label: 'Поиск',
                    placeholder: 'Поиск по всем полям...',
                    component: getFilterComponent('search'),
                });
            }

            // Автофильтры по колонкам (ограничим до 5 для производительности)
            columns.slice(0, 5).forEach((column: any) => {
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

            return smartFilters;
        }

        return [];
    }, [columns, filters, searchable]); // Убрали data из deps для оптимизации

    // Применение фильтров
    const applyFilters = useCallback(
        (filterId: string, value: any) => {
            if (filterId === 'global') {
                setGlobalFilter(value);
                if (onFiltersChange) {
                    onFiltersChange({
                        globalFilter: value,
                        columnFilters,
                        type: 'global',
                    });
                }
                return;
            }

            const newColumnFilters = columnFilters.filter((f) => f.id !== filterId);

            if (value && value !== '' && !(Array.isArray(value) && value.length === 0)) {
                newColumnFilters.push({ id: filterId, value });
            }

            setColumnFilters(newColumnFilters);
            if (onFiltersChange) {
                onFiltersChange({
                    globalFilter,
                    columnFilters: newColumnFilters,
                    type: 'column',
                });
            }
        },
        [columnFilters, globalFilter, onFiltersChange],
    );

    // Сброс фильтров
    const resetFilters = useCallback(() => {
        setGlobalFilter('');
        setColumnFilters([]);
        if (onFiltersChange) {
            onFiltersChange({
                globalFilter: '',
                columnFilters: [],
                type: 'reset',
            });
        }
    }, [onFiltersChange]);

    // Получение активных фильтров (memoized)
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
        filterMode,
    };
};

// Остальные функции без изменений (generateFilterForType, getFilterComponent, getUniqueValues, formatFilterLabel, formatFilterValue)
const generateFilterForType = (columnId: string, type: string, data: any[]): any | null => {
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

const getFilterComponent = (type: string) => {
    const components = {
        search: ({ value, onChange, placeholder }: any) => (
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
            />
        ),

        text: ({ value, onChange, placeholder }: any) => (
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
            />
        ),

        select: ({ value, onChange, options, placeholder }: any) => (
            <select
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
            >
                <option value="">{placeholder || 'Выберите...'}</option>
                {options?.map((opt: any) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        ),

        multiSelect: ({ value, onChange, options }: any) => (
            <div className="relative">
                <select
                    multiple
                    value={value || []}
                    onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                        onChange(selected);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
                    size={3}
                >
                    {options?.map((opt: any) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">Удерживайте Ctrl для выбора нескольких значений</div>
            </div>
        ),

        dateRange: ({ value, onChange }: any) => (
            <div className="space-y-2">
                <div className="text-xs text-gray-500 mb-1">От - До</div>
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={value?.from || ''}
                        onChange={(e) => onChange({ ...value, from: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex-1"
                    />
                    <input
                        type="date"
                        value={value?.to || ''}
                        onChange={(e) => onChange({ ...value, to: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex-1"
                    />
                </div>
            </div>
        ),

        numberRange: ({ value, onChange }: any) => (
            <div className="space-y-2">
                <div className="text-xs text-gray-500 mb-1">Диапазон</div>
                <div className="flex gap-2">
                    <input
                        type="number"
                        value={value?.min || ''}
                        onChange={(e) => onChange({ ...value, min: e.target.value })}
                        placeholder="От"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex-1"
                    />
                    <input
                        type="number"
                        value={value?.max || ''}
                        onChange={(e) => onChange({ ...value, max: e.target.value })}
                        placeholder="До"
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex-1"
                    />
                </div>
            </div>
        ),
    };

    return components[type as keyof typeof components] || components.text;
};

const getUniqueValues = (data: any[], columnId: string): any[] => {
    const values = data.map((row) => row[columnId]).filter((val) => val != null);

    return [...new Set(values)].slice(0, 10);
};

const formatFilterLabel = (columnId: string): string => {
    return columnId
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]/g, ' ')
        .replace(/^\w/, (c) => c.toUpperCase())
        .trim();
};

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
