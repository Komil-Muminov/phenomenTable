import { Table, TableColumnsType, TableProps } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { TableRowSelection } from 'antd/es/table/interface';
import { IFilterItem } from '@shared/model';
import { FiltersContainer } from './Filter/FilterContainer';

interface TableContentProps<RecordType> {
    tableData: RecordType[];
    columns: TableColumnsType<RecordType>;
    total: number;
    isLoading: boolean;
    filters?: IFilterItem[];
    searchButton?: boolean;
    searchButtonText?: string;
    searchButtonIcon?: React.ReactNode;
    onApplyFilters: () => void;
    onResetFilters: () => void;
    handleRowClick?: (row: RecordType) => void;
    rowClassName?: (record: RecordType, index: number) => string;
    rowSelection?: TableRowSelection<RecordType>;
    idColumnHidden?: boolean;
    hideFilters?: boolean;
    title?: string;
    style?: string;
    hiddenPagination?: boolean;
    expandable?: TableProps<RecordType>['expandable'];
    disableScrollX?: boolean;
    pageNumber: number;
    pageSize: number;
    onPageChange: (page: number, pageSize: number) => void;
    className?: string;
    downloadButton?: any;
    downloadPending?: boolean;
    showDownloadBtn?: boolean;
    onDownload?: () => void;
}

export function TableContent<RecordType = any>(props: TableContentProps<RecordType>) {
    const {
        tableData,
        columns,
        total,
        isLoading,
        filters,
        searchButton = false,
        searchButtonText = 'Поиск',
        searchButtonIcon = <SearchOutlined style={{ fontSize: 16 }} />,
        onApplyFilters,
        onResetFilters,
        handleRowClick,
        rowClassName,
        rowSelection,
        idColumnHidden,
        hideFilters,
        title,
        style,
        hiddenPagination,
        expandable,
        disableScrollX,
        pageNumber,
        pageSize,
        onPageChange,
        className,
        downloadButton,
        downloadPending,
        showDownloadBtn,
        onDownload,
    } = props;

    const columnsWithId = idColumnHidden
        ? columns
        : [
              {
                  title: 'ID',
                  dataIndex: 'id',
                  key: 'id',
                  render: (_: any, record: any) => record.id,
                  responsive: ['md'] as any,
                  width: '100px',
              },
              ...columns,
          ];

    return (
        <>
            {/* Filters */}
            {filters && !hideFilters && (
                <div className={`flex flex-col justify-end sm:flex-row sm:items-center ${style} mb-4 gap-4`}>
                    {title && <h2 className="text-base sm:text-lg font-semibold sm:mr-auto">{title}</h2>}
                    <div className="flex !items-center gap-3 w-full sm:w-auto">
                        <FiltersContainer
                            filters={filters}
                            searchMode={searchButton}
                            searchButtonText={searchButtonText}
                            searchButtonIcon={searchButtonIcon}
                            onApplyFilters={onApplyFilters}
                            onResetFilters={onResetFilters}
                            isLoading={isLoading}
                            onDownload={onDownload}
                            downloadPending={downloadPending}
                            showDownloadBtn={showDownloadBtn}
                        />
                    </div>
                </div>
            )}

            {/* Table */}
            <div className={disableScrollX ? '' : 'overflow-x-auto'}>
                <Table
                    expandable={expandable}
                    className={`custom-table cursor-pointer ${className} sm:size-default`}
                    loading={isLoading}
                    dataSource={tableData}
                    columns={columnsWithId}
                    rowKey="id"
                    rowClassName={rowClassName}
                    rowSelection={rowSelection}
                    onRow={(record) => ({
                        onClick: () => handleRowClick?.(record),
                    })}
                    scroll={disableScrollX ? undefined : { x: 'max-content' }}
                    size="small"
                    pagination={
                        !hiddenPagination
                            ? {
                                  total,
                                  current: pageNumber,
                                  pageSize,
                                  pageSizeOptions: [10, 20, 30],
                                  showSizeChanger: true,
                                  responsive: true,
                                  showQuickJumper: false,
                                  showTotal: (total, range) => (
                                      <span className="text-xs sm:text-sm">{`${range[0]}-${range[1]} из ${total}`}</span>
                                  ),
                                  onChange: onPageChange,
                              }
                            : false
                    }
                />
            </div>
        </>
    );
}
