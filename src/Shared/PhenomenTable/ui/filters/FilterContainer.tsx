import React, { useState } from 'react';
import { SearchIcon, FilterIcon, XIcon, RefreshCcwIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

export const FilterContainer: React.FC<any> = ({
    filters,
    globalFilter,
    onGlobalFilterChange,
    onColumnFiltersChange,
    isMobile,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    const [showAllFilters, setShowAllFilters] = useState(false);

    // Применение фильтра
    const applyFilter = (filterId: string, value: any) => {
        if (filterId === 'global') {
            onGlobalFilterChange(value);
            return;
        }

        const newActiveFilters = { ...activeFilters };

        if (!value || value === '' || (Array.isArray(value) && value.length === 0)) {
            delete newActiveFilters[filterId];
        } else {
            newActiveFilters[filterId] = value;
        }

        setActiveFilters(newActiveFilters);

        // Преобразуем в формат для TanStack Table
        const columnFilters = Object.entries(newActiveFilters).map(([id, value]) => ({
            id,
            value,
        }));

        onColumnFiltersChange(columnFilters);
    };

    // Сброс всех фильтров
    const resetAllFilters = () => {
        setActiveFilters({});
        onGlobalFilterChange('');
        onColumnFiltersChange([]);
    };

    // Количество активных фильтров
    const activeFilterCount = Object.keys(activeFilters).length + (globalFilter ? 1 : 0);

    // Фильтры для отображения (ограничиваем на мобиле)
    const visibleFilters = isMobile ? (showAllFilters ? filters : filters.slice(0, 2)) : filters;

    if (isMobile) {
        return (
            <MobileFilterContainer
                filters={filters}
                visibleFilters={visibleFilters}
                globalFilter={globalFilter}
                activeFilters={activeFilters}
                activeFilterCount={activeFilterCount}
                showAllFilters={showAllFilters}
                isExpanded={isExpanded}
                onToggleExpanded={() => setIsExpanded(!isExpanded)}
                onToggleShowAll={() => setShowAllFilters(!showAllFilters)}
                onApplyFilter={applyFilter}
                onResetFilters={resetAllFilters}
            />
        );
    }

    return (
        <DesktopFilterContainer
            filters={filters}
            globalFilter={globalFilter}
            activeFilters={activeFilters}
            activeFilterCount={activeFilterCount}
            onApplyFilter={applyFilter}
            onResetFilters={resetAllFilters}
        />
    );
};

// Десктопная версия фильтров
const DesktopFilterContainer: React.FC<{
    filters: FilterComponent[];
    globalFilter: string;
    activeFilters: Record<string, any>;
    activeFilterCount: number;
    onApplyFilter: (id: string, value: any) => void;
    onResetFilters: () => void;
}> = ({ filters, globalFilter, activeFilters, activeFilterCount, onApplyFilter, onResetFilters }) => {
    return (
        <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <FilterIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Фильтры</span>
                    {activeFilterCount > 0 && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </div>

                {activeFilterCount > 0 && (
                    <button
                        onClick={onResetFilters}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    >
                        <RefreshCcwIcon className="w-3 h-3" />
                        Сбросить
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* Глобальный поиск */}
                <div className="col-span-full md:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Поиск</label>
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            value={globalFilter}
                            onChange={(e) => onApplyFilter('global', e.target.value)}
                            placeholder="Поиск по всем полям..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        />
                        {globalFilter && (
                            <button
                                onClick={() => onApplyFilter('global', '')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Остальные фильтры */}
                {filters
                    .filter((f) => f.id !== 'global')
                    .map((filter) => (
                        <FilterField
                            key={filter.id}
                            filter={filter}
                            value={activeFilters[filter.id]}
                            onChange={(value) => onApplyFilter(filter.id, value)}
                        />
                    ))}
            </div>

            {/* Активные фильтры */}
            {activeFilterCount > 0 && (
                <ActiveFiltersList
                    globalFilter={globalFilter}
                    activeFilters={activeFilters}
                    filters={filters}
                    onRemoveFilter={onApplyFilter}
                />
            )}
        </div>
    );
};

// Мобильная версия фильтров
const MobileFilterContainer: React.FC<{
    filters: FilterComponent[];
    visibleFilters: FilterComponent[];
    globalFilter: string;
    activeFilters: Record<string, any>;
    activeFilterCount: number;
    showAllFilters: boolean;
    isExpanded: boolean;
    onToggleExpanded: () => void;
    onToggleShowAll: () => void;
    onApplyFilter: (id: string, value: any) => void;
    onResetFilters: () => void;
}> = ({
    filters,
    visibleFilters,
    globalFilter,
    activeFilters,
    activeFilterCount,
    showAllFilters,
    isExpanded,
    onToggleExpanded,
    onToggleShowAll,
    onApplyFilter,
    onResetFilters,
}) => {
    return (
        <div className="bg-white border-b border-gray-200">
            {/* Заголовок фильтров */}
            <div className="flex items-center justify-between p-4">
                <button
                    onClick={onToggleExpanded}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                    <FilterIcon className="w-4 h-4" />
                    Фильтры
                    {activeFilterCount > 0 && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                    {isExpanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                </button>

                {activeFilterCount > 0 && (
                    <button
                        onClick={onResetFilters}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-800"
                    >
                        <RefreshCcwIcon className="w-3 h-3" />
                        Сбросить
                    </button>
                )}
            </div>

            {/* Контент фильтров */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                    {/* Глобальный поиск */}
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            value={globalFilter}
                            onChange={(e) => onApplyFilter('global', e.target.value)}
                            placeholder="Поиск по всем полям..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>

                    {/* Фильтры */}
                    {visibleFilters
                        .filter((f) => f.id !== 'global')
                        .map((filter) => (
                            <FilterField
                                key={filter.id}
                                filter={filter}
                                value={activeFilters[filter.id]}
                                onChange={(value) => onApplyFilter(filter.id, value)}
                                isMobile
                            />
                        ))}

                    {/* Показать все фильтры */}
                    {filters.length > 3 && (
                        <button
                            onClick={onToggleShowAll}
                            className="w-full py-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                            {showAllFilters ? 'Скрыть фильтры' : `Показать еще ${filters.length - 2} фильтров`}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// Поле фильтра
const FilterField: React.FC<{
    filter: FilterComponent;
    value: any;
    onChange: (value: any) => void;
    isMobile?: boolean;
}> = ({ filter, value, onChange, isMobile = false }) => {
    const Component = filter.component;

    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{filter.label}</label>
            <Component
                value={value}
                onChange={onChange}
                placeholder={filter.placeholder}
                options={filter.options}
                isMobile={isMobile}
            />
        </div>
    );
};

// Список активных фильтров
const ActiveFiltersList: React.FC<{
    globalFilter: string;
    activeFilters: Record<string, any>;
    filters: FilterComponent[];
    onRemoveFilter: (id: string, value: any) => void;
}> = ({ globalFilter, activeFilters, filters, onRemoveFilter }) => {
    const getFilterLabel = (filterId: string, value: any): string => {
        if (filterId === 'global') return `"${value}"`;

        const filter = filters.find((f) => f.id === filterId);
        const label = filter?.label || filterId;

        if (typeof value === 'object') {
            if (value.from && value.to) return `${label}: ${value.from} - ${value.to}`;
            if (value.min && value.max) return `${label}: ${value.min} - ${value.max}`;
            return `${label}: ${JSON.stringify(value)}`;
        }

        return `${label}: ${value}`;
    };

    const allActiveFilters = [
        ...(globalFilter ? [{ id: 'global', value: globalFilter }] : []),
        ...Object.entries(activeFilters).map(([id, value]) => ({ id, value })),
    ];

    if (allActiveFilters.length === 0) return null;

    return (
        <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
                <span className="text-xs text-gray-500 self-center">Активные фильтры:</span>
                {allActiveFilters.map(({ id, value }) => (
                    <span
                        key={id}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                    >
                        {getFilterLabel(id, value)}
                        <button onClick={() => onRemoveFilter(id, '')} className="hover:text-blue-900">
                            <XIcon className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
};
