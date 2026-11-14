import { Table, type TableColumnsType, type TableProps } from 'antd';
import React, { useMemo } from 'react';

import { resolveRowKey, useMediaQuery } from './lib';
import { MobileCardList } from './MobileCard';
import { TableEmpty } from './TableEmpty';
import { TableToolbar, type TableToolbarProps } from './Toolbar/TableToolbar';

import type { RowKeyGetter } from '@shared/model';
import type { TableRowSelection } from 'antd/es/table/interface';

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

export type TableContentToolbar = Omit<TableToolbarProps, 'isMobile' | 'isLoading'>;

export interface TableContentProps<RecordType> {
    tableData: RecordType[];
    columns: TableColumnsType<RecordType>;
    total: number;
    isLoading: boolean;
    rowKey?: RowKeyGetter<RecordType>;
    /** Шапка с фильтрами; не передан — шапки нет */
    toolbar?: TableContentToolbar;
    /** Пусто из-за фильтров — меняет текст пустого состояния */
    isFiltered?: boolean;
    handleRowClick?: (row: RecordType) => void;
    rowClassName?: (record: RecordType, index: number) => string;
    rowSelection?: TableRowSelection<RecordType>;
    onToggleSelect?: (record: RecordType, checked: boolean) => void;
    idColumnHidden?: boolean;
    hiddenPagination?: boolean;
    expandable?: TableProps<RecordType>['expandable'];
    disableScrollX?: boolean;
    /** Закреплённая шапка: true — у верха окна, число — отступ сверху в px */
    stickyHeader?: boolean | number;
    virtual?: boolean;
    pageNumber: number;
    pageSize: number;
    onPageChange: (page: number, pageSize: number) => void;
    className?: string;
    enableMobileCards?: boolean;
    mobileBreakpoint?: number;
    primaryColumnKey?: string;
    hiddenInMobileColumns?: string[];
    renderMobileCard?: (record: RecordType, index: number) => React.ReactNode;
}

const ID_COLUMN = { title: 'ID', dataIndex: 'id', key: 'id', responsive: ['md' as const], width: 80 };

// Клики по чекбоксам, кнопкам, ссылкам и иконке раскрытия не считаем кликом по строке
const INTERACTIVE_SELECTOR = 'button, a, input, label, .ant-table-selection-column, .ant-table-row-expand-icon';
const isInteractiveClick = (event: React.MouseEvent) =>
    event.target instanceof Element && Boolean(event.target.closest(INTERACTIVE_SELECTOR));

function TableContentComponent<RecordType>(props: TableContentProps<RecordType>) {
    const {
        tableData,
        columns,
        total,
        isLoading,
        rowKey = 'id',
        toolbar,
        handleRowClick,
        hiddenPagination,
        pageNumber,
        pageSize,
        onPageChange,
        stickyHeader = true,
        enableMobileCards = true,
        mobileBreakpoint = 768,
    } = props;

    const isMobile = useMediaQuery(mobileBreakpoint);
    const showMobileCards = enableMobileCards && isMobile;

    const columnsWithId = useMemo<TableColumnsType<RecordType>>(
        () => (props.idColumnHidden ? columns : [ID_COLUMN, ...columns]),
        [columns, props.idColumnHidden],
    );

    const getRowKey = useMemo(() => (record: RecordType) => resolveRowKey(record, rowKey), [rowKey]);

    const empty = <TableEmpty filtered={Boolean(props.isFiltered)} onResetFilters={toolbar?.onResetFilters} />;
    const sticky = stickyHeader ? { offsetHeader: typeof stickyHeader === 'number' ? stickyHeader : 0 } : undefined;

    const pagination: TableProps<RecordType>['pagination'] = hiddenPagination
        ? false
        : {
              total,
              current: pageNumber,
              pageSize,
              pageSizeOptions: PAGE_SIZE_OPTIONS,
              showSizeChanger: true,
              responsive: true,
              className: 'px-4',
              showTotal: (count, range) => (
                  <span className="text-[13px] text-ink-muted">{`${range[0]}–${range[1]} из ${count}`}</span>
              ),
              onChange: onPageChange,
          };

    return (
        <div>
            {toolbar && <TableToolbar {...toolbar} isMobile={isMobile} isLoading={isLoading} />}

            {showMobileCards ? (
                <MobileCardList
                    tableData={tableData}
                    columns={columnsWithId}
                    total={total}
                    isLoading={isLoading}
                    getRowKey={getRowKey}
                    pageNumber={pageNumber}
                    pageSize={pageSize}
                    onPageChange={onPageChange}
                    handleRowClick={handleRowClick}
                    rowSelection={props.rowSelection}
                    onToggleSelect={props.onToggleSelect}
                    rowClassName={props.rowClassName}
                    primaryColumnKey={props.primaryColumnKey}
                    hiddenInMobileColumns={props.hiddenInMobileColumns}
                    renderMobileCard={props.renderMobileCard}
                    hiddenPagination={hiddenPagination}
                    empty={empty}
                />
            ) : (
                // Без overflow на обёртке — иначе ломается sticky-шапка; горизонтальный скролл даёт сам antd
                <div className="rounded-xl border border-line bg-surface">
                    <Table<RecordType>
                        expandable={props.expandable}
                        virtual={props.virtual}
                        className={`${handleRowClick ? '[&_.ant-table-row]:cursor-pointer' : ''} ${props.className ?? ''}`}
                        loading={isLoading}
                        dataSource={tableData}
                        columns={columnsWithId}
                        rowKey={getRowKey}
                        rowClassName={props.rowClassName}
                        rowSelection={props.rowSelection}
                        locale={{ emptyText: isLoading ? ' ' : empty }}
                        sticky={sticky}
                        onRow={
                            handleRowClick
                                ? (record) => ({
                                      onClick: (event) => !isInteractiveClick(event) && handleRowClick(record),
                                  })
                                : undefined
                        }
                        scroll={props.disableScrollX ? undefined : { x: 'max-content' }}
                        size="small"
                        pagination={pagination}
                    />
                </div>
            )}
        </div>
    );
}

export const TableContent = React.memo(TableContentComponent) as typeof TableContentComponent;
