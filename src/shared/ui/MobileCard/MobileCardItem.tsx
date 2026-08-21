import React from 'react';
import { Checkbox } from 'antd';
import { TableColumnsType } from 'antd';
import { TableRowSelection } from 'antd/es/table/interface';

interface MobileCardItemProps<RecordType> {
    record: RecordType;
    index: number;
    columns: TableColumnsType<RecordType>;
    primaryColumnKey?: string;
    hiddenInMobileColumns?: string[];
    handleRowClick?: (record: RecordType) => void;
    rowSelection?: TableRowSelection<RecordType>;
    renderMobileCard?: (record: RecordType, index: number) => React.ReactNode;
    rowClassName?: string;
}

export function MobileCardItem<RecordType extends Record<string, any>>(
    props: MobileCardItemProps<RecordType>,
) {
    const {
        record,
        index,
        columns,
        primaryColumnKey,
        hiddenInMobileColumns = [],
        handleRowClick,
        rowSelection,
        renderMobileCard,
        rowClassName,
    } = props;

    // Кастомный рендер карточки, если передан пользователем
    if (renderMobileCard) {
        return (
            <div
                onClick={() => handleRowClick?.(record)}
                className={`w-full ${handleRowClick ? 'cursor-pointer' : ''}`}
            >
                {renderMobileCard(record, index)}
            </div>
        );
    }

    const rowKey = record.id ?? record.key ?? index;
    const isSelected = rowSelection?.selectedRowKeys?.includes(rowKey) ?? false;

    // Разделяем колонки на:
    // 1. Primary (заголовок карточки)
    // 2. Action (действия/кнопки)
    // 3. Body (остальные поля)
    const isActionCol = (col: any) => {
        const titleStr = typeof col.title === 'string' ? col.title.toLowerCase() : '';
        const keyStr = String(col.key || col.dataIndex || '').toLowerCase();
        return (
            titleStr.includes('действие') ||
            titleStr.includes('действия') ||
            titleStr.includes('action') ||
            keyStr.includes('action') ||
            keyStr === 'operations'
        );
    };

    const isPrimaryCol = (col: any) => {
        if (primaryColumnKey) {
            return col.key === primaryColumnKey || col.dataIndex === primaryColumnKey;
        }
        const keyStr = String(col.key || col.dataIndex || '').toLowerCase();
        const titleStr = typeof col.title === 'string' ? col.title.toLowerCase() : '';
        return (
            keyStr === 'title' ||
            keyStr === 'name' ||
            keyStr === 'id' ||
            titleStr === 'id' ||
            titleStr.includes('название') ||
            titleStr.includes('наименование') ||
            titleStr.includes('номер')
        );
    };

    const isHidden = (col: any) => {
        const key = String(col.key || col.dataIndex || '');
        return hiddenInMobileColumns.includes(key);
    };

    const validColumns = columns.filter((col) => !isHidden(col));

    // Находим колонку заголовка
    const primaryCol = validColumns.find(isPrimaryCol) || validColumns[0];
    // Находим колонку действий
    const actionCols = validColumns.filter(isActionCol);
    // Обычные колонки тела карточки
    const bodyCols = validColumns.filter((col) => col !== primaryCol && !isActionCol(col));

    const renderCellValue = (col: any) => {
        const val = col.dataIndex ? record[col.dataIndex] : undefined;
        if (col.render) {
            return col.render(val, record, index);
        }
        if (val === null || val === undefined || val === '') {
            return <span className="text-gray-400">—</span>;
        }
        if (typeof val === 'boolean') {
            return val ? 'Да' : 'Нет';
        }
        return String(val);
    };

    const handleCheckboxChange = (e: any) => {
        e.stopPropagation();
        if (!rowSelection?.onChange) return;

        const currentKeys = (rowSelection.selectedRowKeys || []) as any[];
        let newKeys: any[];
        if (e.target.checked) {
            newKeys = [...currentKeys, rowKey];
        } else {
            newKeys = currentKeys.filter((k) => k !== rowKey);
        }

        (rowSelection.onChange as any)(newKeys, [], { type: 'single' });
    };


    return (
        <div
            onClick={() => handleRowClick?.(record)}
            className={`bg-white rounded-xl border border-gray-100 p-4 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.99] ${
                isSelected ? '!border-blue-500 !bg-blue-50/20 ring-1 ring-blue-500/20' : ''
            } ${handleRowClick ? 'cursor-pointer' : ''} ${rowClassName || ''}`}
        >
            {/* Header карточки */}
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    {rowSelection && (
                        <div onClick={(e) => e.stopPropagation()} className="flex items-center">
                            <Checkbox
                                checked={isSelected}
                                onChange={handleCheckboxChange}
                                className="scale-110"
                            />
                        </div>
                    )}
                    {primaryCol && (
                        <div className="min-w-0">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block">
                                {typeof primaryCol.title === 'string' ? primaryCol.title : 'Запись'}
                            </span>
                            <div className="text-base font-semibold text-gray-900 truncate">
                                {renderCellValue(primaryCol)}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Body карточки (Сетка ключ/значение) */}
            {bodyCols.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm py-1">
                    {bodyCols.map((col: any, colIdx: number) => {
                        const colKey = col.key || col.dataIndex || colIdx;
                        return (
                            <div
                                key={colKey}
                                className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-gray-50/60"
                            >
                                <span className="text-xs text-gray-600 font-medium shrink-0">
                                    {typeof col.title === 'string' ? col.title : colKey}:
                                </span>
                                <div className="text-xs sm:text-sm font-semibold text-gray-800 text-right truncate">
                                    {renderCellValue(col)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer карточки (Действия) */}
            {actionCols.length > 0 && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end gap-2 flex-wrap"
                >
                    {actionCols.map((col: any, actIdx: number) => (
                        <div key={col.key || actIdx} className="w-full sm:w-auto">
                            {renderCellValue(col)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
