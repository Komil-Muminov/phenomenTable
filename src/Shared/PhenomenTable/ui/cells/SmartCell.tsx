import React from 'react';
import { CheckIcon, XIcon, ExternalLinkIcon, MailIcon, CalendarIcon, DollarSignIcon } from 'lucide-react';

interface SmartCellProps {
    value: any;
    type?: string;
    role?: string;
    options?: {
        features?: string[];
        currency?: string;
        dateFormat?: string;
        truncate?: number;
    };
}

export const SmartCell: React.FC<SmartCellProps> = ({ value, type = 'text', role = 'default', options = {} }) => {
    const { features = [], currency = '$', dateFormat = 'short', truncate } = options;

    // Обработка null/undefined значений
    if (value === null || value === undefined) {
        return <span className="text-gray-400 italic">—</span>;
    }

    // Рендер по типу данных
    switch (type) {
        case 'id':
            return <IDCell value={value} />;

        case 'text':
            return <TextCell value={value} truncate={truncate} />;

        case 'longtext':
            return <LongTextCell value={value} />;

        case 'number':
            return <NumberCell value={value} />;

        case 'money':
            return <MoneyCell value={value} currency={currency} />;

        case 'percent':
            return <PercentCell value={value} />;

        case 'boolean':
            return <BooleanCell value={value} />;

        case 'date':
            return <DateCell value={value} format={dateFormat} />;

        case 'email':
            return <EmailCell value={value} />;

        case 'url':
            return <URLCell value={value} />;

        case 'image':
            return <ImageCell value={value} />;

        case 'status':
            return <StatusCell value={value} />;

        case 'array':
            return <ArrayCell value={value} />;

        case 'object':
            return <ObjectCell value={value} />;

        case 'json':
            return <JSONCell value={value} />;

        default:
            return <TextCell value={value} truncate={truncate} />;
    }
};

// ID ячейка - маленькая и приглушенная
const IDCell: React.FC<{ value: any }> = ({ value }) => (
    <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">#{value}</span>
);

// Текстовая ячейка с опциональным обрезанием
const TextCell: React.FC<{ value: any; truncate?: number }> = ({ value, truncate }) => {
    const text = String(value);
    const shouldTruncate = truncate && text.length > truncate;

    if (shouldTruncate) {
        return (
            <span className="group relative">
                <span className="cursor-help">{text.substring(0, truncate)}...</span>
                <div className="invisible group-hover:visible absolute z-10 w-64 p-2 mt-1 text-sm bg-black text-white rounded shadow-lg">
                    {text}
                </div>
            </span>
        );
    }

    return <span>{text}</span>;
};

// Длинный текст с tooltip
const LongTextCell: React.FC<{ value: any }> = ({ value }) => {
    const text = String(value);
    const preview = text.length > 50 ? `${text.substring(0, 50)}...` : text;

    return (
        <span className="group relative cursor-help">
            <span>{preview}</span>
            {text.length > 50 && (
                <div className="invisible group-hover:visible absolute z-10 w-80 p-3 mt-1 text-sm bg-black text-white rounded shadow-lg break-words">
                    {text}
                </div>
            )}
        </span>
    );
};

// Числовая ячейка с форматированием
const NumberCell: React.FC<{ value: any }> = ({ value }) => {
    const num = Number(value);
    if (isNaN(num)) return <span className="text-gray-400">—</span>;

    return <span className="font-mono text-right">{num.toLocaleString()}</span>;
};

// Денежная ячейка
const MoneyCell: React.FC<{ value: any; currency: string }> = ({ value, currency }) => {
    const num = Number(value);
    if (isNaN(num)) return <span className="text-gray-400">—</span>;

    const isNegative = num < 0;
    const formatted = Math.abs(num).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return (
        <span className={`font-mono font-medium flex items-center ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
            <DollarSignIcon className="w-3 h-3 mr-1" />
            {isNegative && '-'}
            {currency !== '$' && currency}
            {formatted}
        </span>
    );
};

// Процентная ячейка
const PercentCell: React.FC<{ value: any }> = ({ value }) => {
    const num = Number(value);
    if (isNaN(num)) return <span className="text-gray-400">—</span>;

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(Math.max(num, 0), 100)}%` }}
                />
            </div>
            <span className="text-sm font-medium min-w-[3rem]">{num}%</span>
        </div>
    );
};

// Булевая ячейка с иконками
const BooleanCell: React.FC<{ value: any }> = ({ value }) => {
    const boolValue = Boolean(value);

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                boolValue ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
        >
            {boolValue ? <CheckIcon className="w-3 h-3" /> : <XIcon className="w-3 h-3" />}
            {boolValue ? 'Да' : 'Нет'}
        </span>
    );
};

// Дата ячейка
const DateCell: React.FC<{ value: any; format: string }> = ({ value, format }) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) return <span className="text-gray-400">—</span>;

    const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
        short: { year: '2-digit', month: 'short', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
        datetime: {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        },
    };

    const formatted = date.toLocaleDateString('ru-RU', formatOptions[format] || formatOptions.short);

    return (
        <span className="flex items-center gap-1 text-sm">
            <CalendarIcon className="w-3 h-3 text-gray-400" />
            {formatted}
        </span>
    );
};

// Email ячейка с ссылкой
const EmailCell: React.FC<{ value: any }> = ({ value }) => {
    const email = String(value);

    return (
        <a
            href={`mailto:${email}`}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
        >
            <MailIcon className="w-3 h-3" />
            {email}
        </a>
    );
};

// URL ячейка с ссылкой
const URLCell: React.FC<{ value: any }> = ({ value }) => {
    const url = String(value);
    const domain = url.replace(/^https?:\/\//, '').replace(/\/.*/, '');

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
        >
            <ExternalLinkIcon className="w-3 h-3" />
            {domain}
        </a>
    );
};

// Изображение ячейка
const ImageCell: React.FC<{ value: any }> = ({ value }) => {
    const imageUrl = String(value);

    return (
        <img
            src={imageUrl}
            alt=""
            className="w-10 h-10 object-cover rounded-full"
            onError={(e) => {
                (e.target as HTMLImageElement).src =
                    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNjY2MiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptLTIgMTVsLTUtNSAxLjQxLTEuNDFMMTAgMTQuMTdsNy41OS03LjU5TDE5IDhsLTkgOXoiLz48L3N2Zz4=';
            }}
        />
    );
};

// Статус ячейка с цветными бейджами
const StatusCell: React.FC<{ value: any }> = ({ value }) => {
    const status = String(value).toLowerCase();

    const statusConfig = {
        active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Активен' },
        inactive: { bg: 'bg-red-100', text: 'text-red-800', label: 'Неактивен' },
        pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Ожидание' },
        completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Завершено' },
        draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Черновик' },
        true: { bg: 'bg-green-100', text: 'text-green-800', label: 'Да' },
        false: { bg: 'bg-red-100', text: 'text-red-800', label: 'Нет' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: String(value),
    };

    return (
        <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
        >
            {config.label}
        </span>
    );
};

// Массив ячейка
const ArrayCell: React.FC<{ value: any }> = ({ value }) => {
    if (!Array.isArray(value)) return <span className="text-gray-400">—</span>;

    return (
        <div className="flex flex-wrap gap-1">
            {value.slice(0, 3).map((item, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-xs">
                    {String(item)}
                </span>
            ))}
            {value.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded bg-gray-200 text-xs text-gray-600">
                    +{value.length - 3}
                </span>
            )}
        </div>
    );
};

// Объект ячейка
const ObjectCell: React.FC<{ value: any }> = ({ value }) => {
    if (typeof value !== 'object') return <span className="text-gray-400">—</span>;

    const keys = Object.keys(value);
    const preview = keys
        .slice(0, 2)
        .map((key) => `${key}: ${value[key]}`)
        .join(', ');

    return (
        <span className="text-xs text-gray-600 font-mono group relative cursor-help">
            {`{${preview}${keys.length > 2 ? '...' : '}'}}`}
            <div className="invisible group-hover:visible absolute z-10 w-80 p-3 mt-1 text-xs bg-black text-white rounded shadow-lg font-mono">
                <pre>{JSON.stringify(value, null, 2)}</pre>
            </div>
        </span>
    );
};

// JSON ячейка с форматированием
const JSONCell: React.FC<{ value: any }> = ({ value }) => {
    let jsonData;
    try {
        jsonData = typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
        return <span className="text-red-400">Некорректный JSON</span>;
    }

    return (
        <span className="group relative cursor-help">
            <span className="text-xs text-blue-600 font-mono">JSON</span>
            <div className="invisible group-hover:visible absolute z-10 w-80 p-3 mt-1 text-xs bg-black text-white rounded shadow-lg font-mono">
                <pre>{JSON.stringify(jsonData, null, 2)}</pre>
            </div>
        </span>
    );
};
