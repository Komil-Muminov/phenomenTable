import { SearchOutlined } from '@ant-design/icons';
import { Table, type TableColumnsType, type TableProps } from 'antd';
import React, { useMemo } from 'react';

import { resolveRowKey, useMediaQuery } from './lib';
import { MobileCardList } from './MobileCard';
import { TableToolbar } from './TableToolbar';

import type { IFilterItem, RowKeyGetter } from '@shared/model';
import type { TableRowSelection } from 'antd/es/table/interface';

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50];

export interface TableContentProps<RecordType> {
    tableData: RecordType[];
    columns: TableColumnsType<RecordType>;
    total: number;
    isLoading: boolean;
    rowKey?: RowKeyGetter<RecordType>;
    filters?: IFilterItem[];
    searchButton?: boolean;
    searchButtonText?: string;
    searchButtonIcon?: React.ReactNode;
    onApplyFilters: () => void;
    onResetFilters: () => void;
    handleRowClick?: (row: RecordType) => void;
    rowClassName?: (record: RecordType, index: number) => string;
    rowSelection?: TableRowSelection<RecordType>;
    onToggleSelect?: (record: RecordType, checked: boolean) => void;
    idColumnHidden?: boolean;
    hideFilters?: boolean;
    title?: string;
    style?: string;
    hiddenPagination?: boolean;
    expandable?: TableProps<RecordType>['expandable'];
    disableScrollX?: boolean;
    virtual?: boolean;
    pageNumber: number;
    pageSize: number;
    onPageChange: (page: number, pageSize: number) => void;
    className?: string;
    downloadPending?: boolean;
    showDownloadBtn?: boolean;
    onDownload?: () => void;
    enableMobileCards?: boolean;
    mobileBreakpoint?: number;
    primaryColumnKey?: string;
    hiddenInMobileColumns?: string[];
    renderMobileCard?: (record: RecordType, index: number) => React.ReactNode;
}

const ID_COLUMN = {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    responsive: ['md' as const],
    width: 100,
};

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
        filters,
        searchButton = false,
        searchButtonText = 'Поиск',
        searchButtonIcon = <SearchOutlined style={{ fontSize: 16 }} />,
        handleRowClick,
        idColumnHidden,
        hideFilters,
        hiddenPagination,
        disableScrollX,
        pageNumber,
        pageSize,
        onPageChange,
        enableMobileCards = true,
        mobileBreakpoint = 768,
    } = props;

    const isMobile = useMediaQuery(mobileBreakpoint);
    const showMobileCards = enableMobileCards && isMobile;

    const columnsWithId = useMemo<TableColumnsType<RecordType>>(
        () => (idColumnHidden ? columns : [ID_COLUMN, ...columns]),
        [columns, idColumnHidden],
    );

    const getRowKey = useMemo(() => (record: RecordType) => resolveRowKey(record, rowKey), [rowKey]);

    const pagination: TableProps<RecordType>['pagination'] = hiddenPagination
        ? false
        : {
              total,
              current: pageNumber,
              pageSize,
              pageSizeOptions: PAGE_SIZE_OPTIONS,
              showSizeChanger: true,
              responsive: true,
              showTotal: (count, range) => (
                  <span className="text-xs sm:text-sm">{`${range[0]}-${range[1]} из ${count}`}</span>
              ),
              onChange: onPageChange,
          };

    return (
        <div>
            {filters && !hideFilters && (
                <TableToolbar
                    filters={filters}
                    title={props.title}
                    className={props.style}
                    searchButton={searchButton}
                    searchButtonText={searchButtonText}
                    searchButtonIcon={searchButtonIcon}
                    isLoading={isLoading}
                    onApplyFilters={props.onApplyFilters}
                    onResetFilters={props.onResetFilters}
                    showDownloadBtn={props.showDownloadBtn}
                    downloadPending={props.downloadPending}
                    onDownload={props.onDownload}
                />
            )}

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
                />
            ) : (
                <div className={disableScrollX ? '' : 'overflow-x-auto'}>
                    <Table<RecordType>
                        expandable={props.expandable}
                        virtual={props.virtual}
                        className={`custom-table ${handleRowClick ? 'cursor-pointer' : ''} ${props.className ?? ''}`}
                        loading={isLoading}
                        dataSource={tableData}
                        columns={columnsWithId}
                        rowKey={getRowKey}
                        rowClassName={props.rowClassName}
                        rowSelection={props.rowSelection}
                        onRow={
                            handleRowClick
                                ? (record) => ({
                                      onClick: (event) => !isInteractiveClick(event) && handleRowClick(record),
                                  })
                                : undefined
                        }
                        scroll={disableScrollX ? undefined : { x: 'max-content' }}
                        size="small"
                        pagination={pagination}
                    />
                </div>
            )}
        </div>
    );
}

export const TableContent = React.memo(TableContentComponent) as typeof TableContentComponent;
