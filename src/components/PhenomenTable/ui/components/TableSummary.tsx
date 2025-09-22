import React, { useMemo } from 'react';
import {
    BarChart3Icon,
    TrendingUpIcon,
    TrendingDownIcon,
    UsersIcon,
    DollarSignIcon,
    CalendarIcon,
    AlertCircleIcon,
    CheckCircleIcon,
    ClockIcon,
    EyeIcon,
    EyeOffIcon,
} from 'lucide-react';
import { ChartCell } from '../cells/ChartCell';

interface TableSummaryProps {
    data: any[];
    meta: any;
    totalCount: number;
    features: string[];
}

interface SummaryCard {
    id: string;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: number;
    icon: React.ComponentType<any>;
    color: string;
    chartData?: number[];
}

export const TableSummary: React.FC<TableSummaryProps> = ({ data, meta, totalCount, features }) => {
    const [collapsed, setCollapsed] = React.useState(false);

    // Автоматический расчет метрик
    const summaryCards = useMemo(() => {
        if (!data || data.length === 0) return [];

        const cards: SummaryCard[] = [];

        // 1. Общее количество записей
        cards.push({
            id: 'total',
            title: 'Всего записей',
            value: totalCount || data.length,
            icon: BarChart3Icon,
            color: 'blue',
        });

        // 2. Анализ числовых полей
        const numericFields = findNumericFields(data);
        numericFields.forEach((field) => {
            const values = data.map((row) => row[field.key]).filter((v) => typeof v === 'number');
            if (values.length === 0) return;

            const sum = values.reduce((acc, val) => acc + val, 0);
            const avg = sum / values.length;

            // Денежные поля
            if (field.type === 'money') {
                cards.push({
                    id: `money_${field.key}`,
                    title: field.label,
                    value: formatMoney(sum),
                    subtitle: `Среднее: ${formatMoney(avg)}`,
                    icon: DollarSignIcon,
                    color: 'green',
                    chartData: values.slice(-10),
                });
            }
            // Обычные числовые поля
            else {
                cards.push({
                    id: `numeric_${field.key}`,
                    title: field.label,
                    value: formatNumber(sum),
                    subtitle: `Среднее: ${formatNumber(avg)}`,
                    icon: TrendingUpIcon,
                    color: 'purple',
                    chartData: values.slice(-10),
                });
            }
        });

        // 3. Анализ статусов
        const statusFields = findStatusFields(data);
        statusFields.forEach((field) => {
            const statusCounts = countByStatus(data, field.key);
            if (Object.keys(statusCounts).length > 0) {
                const activeCount = statusCounts.active || statusCounts.completed || statusCounts.true || 0;
                const totalStatusCount = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

                cards.push({
                    id: `status_${field.key}`,
                    title: field.label,
                    value: activeCount,
                    subtitle: `из ${totalStatusCount}`,
                    icon: activeCount > totalStatusCount / 2 ? CheckCircleIcon : AlertCircleIcon,
                    color: activeCount > totalStatusCount / 2 ? 'green' : 'red',
                });
            }
        });

        // 4. Анализ дат (последние записи)
        const dateFields = findDateFields(data);
        if (dateFields.length > 0) {
            const dateField = dateFields[0]; // Берем первое поле даты
            const recentCount = countRecentRecords(data, dateField.key);

            cards.push({
                id: 'recent',
                title: 'За последние 7 дней',
                value: recentCount,
                subtitle: `${((recentCount / data.length) * 100).toFixed(1)}%`,
                icon: CalendarIcon,
                color: 'blue',
            });
        }

        // 5. Мета-информация из API
        if (meta) {
            if (meta.totalSum !== undefined) {
                cards.push({
                    id: 'total_sum',
                    title: 'Общая сумма',
                    value: formatMoney(meta.totalSum),
                    icon: DollarSignIcon,
                    color: 'green',
                });
            }

            if (meta.totalWeight !== undefined) {
                cards.push({
                    id: 'total_weight',
                    title: 'Общий вес',
                    value: `${meta.totalWeight} кг`,
                    icon: BarChart3Icon,
                    color: 'orange',
                });
            }
        }

        return cards.slice(0, 6); // Ограничиваем количество карточек
    }, [data, meta, totalCount]);

    if (summaryCards.length === 0) return null;

    return (
        <div className="bg-white border-b border-gray-200">
            <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3Icon className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-medium text-gray-700">Аналитика</h3>
                </div>

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 rounded"
                >
                    {collapsed ? <EyeIcon className="w-3 h-3" /> : <EyeOffIcon className="w-3 h-3" />}
                    {collapsed ? 'Показать' : 'Скрыть'}
                </button>
            </div>

            {!collapsed && (
                <div className="px-4 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        {summaryCards.map((card) => (
                            <SummaryCard key={card.id} card={card} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Карточка метрики
const SummaryCard: React.FC<{ card: SummaryCard }> = ({ card }) => {
    const { title, value, subtitle, trend, icon: Icon, color, chartData } = card;

    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        green: 'bg-green-50 text-green-600 border-green-200',
        red: 'bg-red-50 text-red-600 border-red-200',
        purple: 'bg-purple-50 text-purple-600 border-purple-200',
        orange: 'bg-orange-50 text-orange-600 border-orange-200',
        gray: 'bg-gray-50 text-gray-600 border-gray-200',
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">{title}</span>
                    </div>

                    <div className="space-y-1">
                        <div className="text-2xl font-bold text-gray-900">{value}</div>

                        {subtitle && <div className="text-sm text-gray-500">{subtitle}</div>}

                        {trend !== undefined && (
                            <div
                                className={`flex items-center gap-1 text-xs font-medium ${
                                    trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
                                }`}
                            >
                                {trend > 0 ? (
                                    <TrendingUpIcon className="w-3 h-3" />
                                ) : trend < 0 ? (
                                    <TrendingDownIcon className="w-3 h-3" />
                                ) : null}
                                {Math.abs(trend)}%
                            </div>
                        )}
                    </div>
                </div>

                {/* Мини-график */}
                {chartData && chartData.length > 1 && (
                    <div className="ml-2">
                        <ChartCell
                            data={chartData}
                            value={chartData[chartData.length - 1]}
                            type="sparkline"
                            options={{
                                width: 60,
                                height: 20,
                                showValue: false,
                                color: getChartColor(color),
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// Утилиты для анализа данных

// Поиск числовых полей
const findNumericFields = (data: any[]) => {
    if (!data[0]) return [];

    return Object.keys(data[0])
        .map((key) => {
            const sampleValue = data[0][key];
            const keyLower = key.toLowerCase();

            if (typeof sampleValue === 'number') {
                // Определяем тип числового поля
                const type =
                    keyLower.includes('price') ||
                    keyLower.includes('cost') ||
                    keyLower.includes('amount') ||
                    keyLower.includes('sum') ||
                    keyLower.includes('total') ||
                    keyLower.includes('salary')
                        ? 'money'
                        : 'number';

                return {
                    key,
                    label: formatFieldName(key),
                    type,
                };
            }
            return null;
        })
        .filter(Boolean) as { key: string; label: string; type: string }[];
};

// Поиск полей статусов
const findStatusFields = (data: any[]) => {
    if (!data[0]) return [];

    return Object.keys(data[0])
        .map((key) => {
            const keyLower = key.toLowerCase();
            const sampleValue = data[0][key];

            if (
                keyLower.includes('status') ||
                keyLower.includes('state') ||
                keyLower.includes('active') ||
                typeof sampleValue === 'boolean'
            ) {
                return {
                    key,
                    label: formatFieldName(key),
                };
            }
            return null;
        })
        .filter(Boolean) as { key: string; label: string }[];
};

// Поиск полей дат
const findDateFields = (data: any[]) => {
    if (!data[0]) return [];

    return Object.keys(data[0])
        .map((key) => {
            const keyLower = key.toLowerCase();
            const sampleValue = data[0][key];

            if (
                keyLower.includes('date') ||
                keyLower.includes('time') ||
                keyLower.includes('created') ||
                keyLower.includes('updated')
            ) {
                return {
                    key,
                    label: formatFieldName(key),
                };
            }

            // Попытка парсинга как дату
            if (typeof sampleValue === 'string' && !isNaN(Date.parse(sampleValue))) {
                return {
                    key,
                    label: formatFieldName(key),
                };
            }

            return null;
        })
        .filter(Boolean) as { key: string; label: string }[];
};

// Подсчет по статусам
const countByStatus = (data: any[], field: string) => {
    const counts: Record<string, number> = {};

    data.forEach((row) => {
        const value = row[field];
        const key = String(value).toLowerCase();
        counts[key] = (counts[key] || 0) + 1;
    });

    return counts;
};

// Подсчет недавних записей (за 7 дней)
const countRecentRecords = (data: any[], dateField: string): number => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return data.filter((row) => {
        const date = new Date(row[dateField]);
        return !isNaN(date.getTime()) && date >= sevenDaysAgo;
    }).length;
};

// Форматирование названий полей
const formatFieldName = (key: string): string => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]/g, ' ')
        .replace(/^\w/, (c) => c.toUpperCase())
        .trim();
};

// Форматирование чисел
const formatNumber = (num: number): string => {
    return num.toLocaleString();
};

// Форматирование денег
const formatMoney = (num: number): string => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
};

// Получение цвета для графика
const getChartColor = (color: string): string => {
    const colors = {
        blue: '#3b82f6',
        green: '#10b981',
        red: '#ef4444',
        purple: '#8b5cf6',
        orange: '#f97316',
        gray: '#6b7280',
    };

    return colors[color as keyof typeof colors] || colors.blue;
};
