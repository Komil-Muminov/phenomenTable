import { TableColumnsType, TableProps } from 'antd';
import { TableRowSelection } from 'antd/es/table/interface';
import { useTableDownload } from '@shared/lib/hooks/hooks';
import { TableContent } from './TableContent';
import { useSmartTable, useTableSelection } from './lib';
import { IFilterItem } from '@shared/model';

interface IDownloadButton {
    url: string;
    fileName?: string;
    messages?: { success?: string; error?: string };
}

interface OfflineConfig {
    enabled: boolean;
    storeName: string;
}

interface IProps<RecordType, ResponseType> {
    url?: string;
    filters?: IFilterItem[];
    columns: TableColumnsType<RecordType>;
    queryParams?: Record<string, any>;
    style?: string;
    getItemsFromResponse?: (response: ResponseType) => RecordType[];
    handleRowClick?: (row: RecordType) => void;
    handleSelectionChange?: any;
    dataSource?: RecordType[];
    rowClassName?: (record: RecordType, index: number) => string;
    title?: string;
    rowSelection?: TableRowSelection<RecordType>;
    idColumnHidden?: boolean;
    customRender?: (items: RecordType[], total: number) => React.ReactNode;
    hideFilters?: boolean;
    className?: string;
    totalSum?: string | number | boolean;
    hiddenPagination?: boolean;
    searchButton?: boolean;
    searchButtonText?: string;
    searchButtonIcon?: React.ReactNode;
    expandable?: TableProps<RecordType>['expandable'];
    disableScrollX?: boolean;
    downloadButton?: IDownloadButton;
    downloadPayload?: object;
    showDownloadBtn?: boolean;
    totalCount?: boolean;
    requestTransform?: (params: any) => any;
    responseTransform?: (response: any) => ResponseType;
    offlineMode?: OfflineConfig;
}

export function SmartTable<RecordType = any, ResponseType = any>(props: IProps<RecordType, ResponseType>) {
    const { downloadButton, downloadPayload } = props;

    const tableLogic = useSmartTable<RecordType, ResponseType>({
        url: props.url,
        queryParams: props.queryParams,
        filters: props.filters,
        dataSource: props.dataSource,
        getItemsFromResponse: props.getItemsFromResponse,
        searchButton: props.searchButton,
        requestTransform: props.requestTransform,
        responseTransform: props.responseTransform,
    });

    const selection = useTableSelection<any>({
        data: tableLogic.tableData,
        rowKey: 'id',
        onSelectionChange: props.handleSelectionChange, // ← теперь мы используем handleSelectionChange
    });

    const { handleDownload, downloadPending } = useTableDownload({ downloadButton });

    const handleDownloadClick = () => {
        handleDownload(tableLogic.transformedFilters, downloadPayload);
    };

    const handlePageChange = (page: number, pageSize: number) => {
        tableLogic.setParams('pageNumber', page);
        tableLogic.setParams('pageSize', pageSize);
    };

    return (
        <div className="bg-white rounded-2xl py-2 px-2 sm:py-4 sm:px-5">
            {props.customRender ? (
                props.customRender(tableLogic.tableData, tableLogic.total)
            ) : (
                <TableContent
                    tableData={tableLogic.tableData}
                    columns={props.columns}
                    total={tableLogic.total}
                    isLoading={tableLogic.isLoading}
                    filters={props.filters}
                    searchButton={props.searchButton}
                    searchButtonText={props.searchButtonText}
                    searchButtonIcon={props.searchButtonIcon}
                    onApplyFilters={tableLogic.handleApplyFilters}
                    onResetFilters={tableLogic.handleResetFilters}
                    handleRowClick={props.handleRowClick}
                    rowClassName={props.rowClassName}
                    rowSelection={props.rowSelection || selection.rowSelection}
                    idColumnHidden={props.idColumnHidden}
                    hideFilters={props.hideFilters}
                    title={props.title}
                    style={props.style}
                    hiddenPagination={props.hiddenPagination}
                    expandable={props.expandable}
                    disableScrollX={props.disableScrollX}
                    pageNumber={tableLogic.pageNumber}
                    pageSize={tableLogic.pageSize}
                    onPageChange={handlePageChange}
                    className={props.className}
                    downloadButton={downloadButton}
                    downloadPending={downloadPending}
                    showDownloadBtn={props.showDownloadBtn}
                    onDownload={handleDownloadClick}
                />
            )}
        </div>
    );
}
