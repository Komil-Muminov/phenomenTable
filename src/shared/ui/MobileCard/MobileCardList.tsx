import React from 'react';
import { Empty, Pagination, Skeleton } from 'antd';
import { TableColumnsType } from 'antd';
import { TableRowSelection } from 'antd/es/table/interface';
import { MobileCardItem } from './MobileCardItem';

interface MobileCardListProps<RecordType> {
    tableData: RecordType[];
    columns: TableColumnsType<RecordType>;
    total: number;
    isLoading: boolean;
    pageNumber: number;
    pageSize: number;
    onPageChange: (page: number, pageSize: number) => void;
    handleRowClick?: (row: RecordType) => void;
    rowSelection?: TableRowSelection<RecordType>;
    rowClassName?: (record: RecordType, index: number) => string;
    primaryColumnKey?: string;
    hiddenInMobileColumns?: string[];
    renderMobileCard?: (record: RecordType, index: number) => React.ReactNode;
    hiddenPagination?: boolean;
}

export function MobileCardList<RecordType extends Record<string, any>>(
    props: MobileCardListProps<RecordType>,
) {
    const {
        tableData,
        columns,
        total,
        isLoading,
        pageNumber,
        pageSize,
        onPageChange,
        handleRowClick,
        rowSelection,
        rowClassName,
        primaryColumnKey,
        hiddenInMobileColumns,
        renderMobileCard,
        hiddenPagination,
    } = props;

    return (
        <div className="flex flex-col gap-3 w-full py-2">
            {/* Состояние загрузки (Скелетоны карточек) */}
            {isLoading && (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((skeletonId) => (
                        <div
                            key={skeletonId}
                            className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                        >
                            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-3">
                                <Skeleton.Input active size="small" style={{ width: 140 }} />
                                <Skeleton.Button active size="small" style={{ width: 60 }} />
                            </div>
                            <div className="space-y-2">
                                <Skeleton active paragraph={{ rows: 2 }} title={false} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Пустое состояние */}
            {!isLoading && (!tableData || tableData.length === 0) && (
                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center my-2 shadow-sm">
                    <Empty description="Данные отсутствуют" />
                </div>
            )}

            {/* Список карточек */}
            {!isLoading &&
                tableData &&
                tableData.length > 0 &&
                tableData.map((record, index) => {
                    const rowKey = record.id ?? record.key ?? index;
                    const calculatedClassName = rowClassName ? rowClassName(record, index) : '';
                    return (
                        <MobileCardItem
                            key={rowKey}
                            record={record}
                            index={index}
                            columns={columns}
                            primaryColumnKey={primaryColumnKey}
                            hiddenInMobileColumns={hiddenInMobileColumns}
                            handleRowClick={handleRowClick}
                            rowSelection={rowSelection}
                            renderMobileCard={renderMobileCard}
                            rowClassName={calculatedClassName}
                        />
                    );
                })}

            {/* Серверная мобильная пагинация */}
            {!hiddenPagination && total > 0 && (
                <div className="mt-4 flex flex-col items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-xs text-gray-500 font-medium">
                        Всего записей: <span className="text-gray-900 font-semibold">{total}</span>
                    </div>
                    <Pagination
                        current={pageNumber}
                        pageSize={pageSize}
                        total={total}
                        onChange={onPageChange}
                        simple
                        size="small"
                        showSizeChanger={false}
                    />
                </div>
            )}
        </div>
    );
}
