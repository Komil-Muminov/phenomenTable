import { Checkbox, type TableColumnsType } from 'antd';
import React, { useMemo } from 'react';

import { getValueByDataIndex } from '../lib/rowKey';

import { columnId, splitMobileColumns, type MobileColumn } from './mobileColumns';

interface MobileCardItemProps<RecordType> {
    record: RecordType;
    index: number;
    columns: TableColumnsType<RecordType>;
    primaryColumnKey?: string;
    hiddenInMobileColumns?: string[];
    handleRowClick?: (record: RecordType) => void;
    /** undefined — выделение выключено */
    isSelected?: boolean;
    onToggleSelect?: (record: RecordType, checked: boolean) => void;
    renderMobileCard?: (record: RecordType, index: number) => React.ReactNode;
    rowClassName?: string;
}

const EMPTY = <span className="text-gray-400">—</span>;

export function MobileCardItem<RecordType>(props: MobileCardItemProps<RecordType>) {
    const { record, index, columns, handleRowClick, isSelected, onToggleSelect, renderMobileCard, rowClassName } =
        props;

    const { primary, body, actions } = useMemo(
        () => splitMobileColumns(columns, props.primaryColumnKey, props.hiddenInMobileColumns),
        [columns, props.primaryColumnKey, props.hiddenInMobileColumns],
    );

    const clickable = handleRowClick ? 'cursor-pointer' : '';

    if (renderMobileCard) {
        return (
            <div onClick={() => handleRowClick?.(record)} className={`w-full ${clickable}`}>
                {renderMobileCard(record, index)}
            </div>
        );
    }

    const renderCellValue = (col: MobileColumn<RecordType>): React.ReactNode => {
        const value = getValueByDataIndex(record, col.dataIndex);
        if ('render' in col && col.render) return col.render(value, record, index) as React.ReactNode;
        if (value === null || value === undefined || value === '') return EMPTY;
        if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
        return String(value);
    };

    const labelOf = (col: MobileColumn<RecordType>) => (typeof col.title === 'string' ? col.title : columnId(col));
    const selectable = isSelected !== undefined && Boolean(onToggleSelect);
    const stop = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <div
            onClick={() => handleRowClick?.(record)}
            className={`rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md ${
                isSelected ? '!border-blue-500 !bg-blue-50/20 ring-1 ring-blue-500/20' : ''
            } ${clickable} ${rowClassName ?? ''}`}
        >
            {/* Шапка карточки */}
            <div className="mb-3 flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex min-w-0 items-center gap-3">
                    {selectable && (
                        <div onClick={stop} className="flex items-center">
                            <Checkbox
                                checked={isSelected}
                                onChange={(e) => onToggleSelect?.(record, e.target.checked)}
                                aria-label="Выбрать запись"
                            />
                        </div>
                    )}
                    {primary && (
                        <div className="min-w-0">
                            <span className="block text-xs font-medium uppercase tracking-wider text-gray-500">
                                {typeof primary.title === 'string' ? primary.title : 'Запись'}
                            </span>
                            <div className="truncate text-base font-semibold text-gray-900">
                                {renderCellValue(primary)}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Тело: сетка «поле — значение» */}
            {body.length > 0 && (
                <div className="grid grid-cols-1 gap-2.5 py-1 text-sm sm:grid-cols-2">
                    {body.map((col) => (
                        <div
                            key={columnId(col)}
                            className="flex items-center justify-between gap-2 rounded-lg bg-gray-50/60 p-1.5"
                        >
                            <span className="shrink-0 text-xs font-medium text-gray-600">{labelOf(col)}:</span>
                            <div className="truncate text-right text-xs font-semibold text-gray-800 sm:text-sm">
                                {renderCellValue(col)}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Подвал: действия */}
            {actions.length > 0 && (
                <div
                    onClick={stop}
                    className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-3"
                >
                    {actions.map((col) => (
                        <div key={columnId(col)} className="w-full sm:w-auto">
                            {renderCellValue(col)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
