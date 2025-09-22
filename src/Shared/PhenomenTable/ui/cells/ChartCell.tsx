import React, { useMemo } from 'react';
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from 'lucide-react';

interface ChartCellProps {
    data: number[];
    value: number;
    type?: 'sparkline' | 'bar' | 'progress' | 'trend';
    options?: {
        color?: string;
        showValue?: boolean;
        showTrend?: boolean;
        height?: number;
        width?: number;
    };
}

export const ChartCell: React.FC<ChartCellProps> = ({ data, value, type = 'sparkline', options = {} }) => {
    const { color = '#3b82f6', showValue = true, showTrend = false, height = 20, width = 80 } = options;

    // Подготовка данных
    const chartData = useMemo(() => {
        if (!Array.isArray(data) || data.length < 2) return [];

        // Фильтруем валидные числа
        const validData = data.filter((d) => typeof d === 'number' && !isNaN(d));
        if (validData.length < 2) return [];

        return validData;
    }, [data]);

    // Вычисление тренда
    const trend = useMemo(() => {
        if (chartData.length < 2) return 0;

        const first = chartData[0];
        const last = chartData[chartData.length - 1];

        if (first === 0) return last > 0 ? 1 : 0;
        return ((last - first) / first) * 100;
    }, [chartData]);

    // Если нет данных для графика
    if (chartData.length < 2) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900">{value}</span>
                <span className="text-xs text-gray-400">Нет данных</span>
            </div>
        );
    }

    // Рендер по типу графика
    switch (type) {
        case 'sparkline':
            return (
                <SparklineChart
                    data={chartData}
                    value={value}
                    color={color}
                    showValue={showValue}
                    showTrend={showTrend}
                    trend={trend}
                    width={width}
                    height={height}
                />
            );

        case 'bar':
            return (
                <BarChart
                    data={chartData}
                    value={value}
                    color={color}
                    showValue={showValue}
                    width={width}
                    height={height}
                />
            );

        case 'progress':
            return <ProgressChart value={value} max={Math.max(...chartData)} color={color} showValue={showValue} />;

        case 'trend':
            return <TrendChart value={value} trend={trend} color={color} />;

        default:
            return (
                <SparklineChart
                    data={chartData}
                    value={value}
                    color={color}
                    showValue={showValue}
                    showTrend={showTrend}
                    trend={trend}
                    width={width}
                    height={height}
                />
            );
    }
};

// Sparkline график (линия)
const SparklineChart: React.FC<{
    data: number[];
    value: number;
    color: string;
    showValue: boolean;
    showTrend: boolean;
    trend: number;
    width: number;
    height: number;
}> = ({ data, value, color, showValue, showTrend, trend, width, height }) => {
    const pathData = useMemo(() => {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        return data.map((point, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((point - min) / range) * height;
            return { x, y };
        });
    }, [data, width, height]);

    const pathString = pathData.reduce((path, point, index) => {
        const command = index === 0 ? 'M' : 'L';
        return `${path} ${command} ${point.x} ${point.y}`;
    }, '');

    return (
        <div className="flex items-center gap-2">
            <svg width={width} height={height} className="overflow-visible">
                <path d={pathString} stroke={color} strokeWidth="1.5" fill="none" className="drop-shadow-sm" />
                {/* Точки на линии */}
                {pathData.map((point, index) => (
                    <circle key={index} cx={point.x} cy={point.y} r="1.5" fill={color} className="opacity-60" />
                ))}
                {/* Выделение последней точки */}
                <circle
                    cx={pathData[pathData.length - 1]?.x}
                    cy={pathData[pathData.length - 1]?.y}
                    r="2.5"
                    fill={color}
                    className="drop-shadow-sm"
                />
            </svg>

            {showValue && (
                <span className="text-sm font-medium text-gray-900 min-w-[2rem]">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </span>
            )}

            {showTrend && <TrendIndicator trend={trend} />}
        </div>
    );
};

// Столбчатая диаграмма
const BarChart: React.FC<{
    data: number[];
    value: number;
    color: string;
    showValue: boolean;
    width: number;
    height: number;
}> = ({ data, value, color, showValue, width, height }) => {
    const barData = useMemo(() => {
        const max = Math.max(...data);
        const barWidth = width / data.length - 1;

        return data.map((point, index) => ({
            x: index * (barWidth + 1),
            height: (point / max) * height,
            width: barWidth,
        }));
    }, [data, width, height]);

    return (
        <div className="flex items-center gap-2">
            <svg width={width} height={height}>
                {barData.map((bar, index) => (
                    <rect
                        key={index}
                        x={bar.x}
                        y={height - bar.height}
                        width={bar.width}
                        height={bar.height}
                        fill={color}
                        className="opacity-80 hover:opacity-100"
                        rx="1"
                    />
                ))}
            </svg>

            {showValue && (
                <span className="text-sm font-medium text-gray-900 min-w-[2rem]">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </span>
            )}
        </div>
    );
};

// Прогресс бар
const ProgressChart: React.FC<{
    value: number;
    max: number;
    color: string;
    showValue: boolean;
}> = ({ value, max, color, showValue }) => {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div className="flex items-center gap-2 w-full">
            <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
                <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                    }}
                />
            </div>

            {showValue && (
                <span className="text-sm font-medium text-gray-900 min-w-[2rem]">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </span>
            )}
        </div>
    );
};

// Индикатор тренда
const TrendChart: React.FC<{
    value: number;
    trend: number;
    color: string;
}> = ({ value, trend, color }) => {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            <TrendIndicator trend={trend} />
        </div>
    );
};

// Компонент индикатора тренда
const TrendIndicator: React.FC<{ trend: number }> = ({ trend }) => {
    if (Math.abs(trend) < 0.1) {
        return (
            <span className="flex items-center text-xs text-gray-500">
                <MinusIcon className="w-3 h-3" />
                0%
            </span>
        );
    }

    const isPositive = trend > 0;
    const Icon = isPositive ? TrendingUpIcon : TrendingDownIcon;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';

    return (
        <span className={`flex items-center text-xs font-medium ${colorClass}`}>
            <Icon className="w-3 h-3" />
            {Math.abs(trend).toFixed(1)}%
        </span>
    );
};

// Хук для генерации случайных данных (для примера)
export const useGenerateChartData = (length: number = 10): number[] => {
    return useMemo(() => {
        const data: number[] = [];
        let current = Math.random() * 100;

        for (let i = 0; i < length; i++) {
            current += (Math.random() - 0.5) * 20;
            current = Math.max(0, current);
            data.push(Math.round(current));
        }

        return data;
    }, [length]);
};

// Утилита для извлечения данных графика из массива объектов
export const extractTimeSeriesData = (data: any[], valueKey: string, timeKey: string = 'createdAt'): number[] => {
    return data
        .sort((a, b) => new Date(a[timeKey]).getTime() - new Date(b[timeKey]).getTime())
        .map((item) => {
            const value = item[valueKey];
            return typeof value === 'number' ? value : 0;
        })
        .filter((value) => !isNaN(value));
};

// Утилита для группировки данных по периодам
export const groupDataByPeriod = (
    data: any[],
    valueKey: string,
    timeKey: string = 'createdAt',
    period: 'day' | 'week' | 'month' = 'day',
): number[] => {
    const grouped: Record<string, number[]> = {};

    data.forEach((item) => {
        const date = new Date(item[timeKey]);
        let key: string;

        switch (period) {
            case 'week':
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toISOString().split('T')[0];
                break;
            case 'month':
                key = `${date.getFullYear()}-${date.getMonth() + 1}`;
                break;
            default: // day
                key = date.toISOString().split('T')[0];
                break;
        }

        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item[valueKey]);
    });

    return Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, values]) => {
            const validValues = values.filter((v) => typeof v === 'number' && !isNaN(v));
            return validValues.length > 0 ? validValues.reduce((sum, v) => sum + v, 0) / validValues.length : 0;
        });
};
