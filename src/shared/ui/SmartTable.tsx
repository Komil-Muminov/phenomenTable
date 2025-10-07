import { TableColumnsType, TableProps } from 'antd';
import { TableRowSelection } from 'antd/es/table/interface';
import { useTableDownload } from '@shared/lib/hooks/hooks';
import { TableContent } from './TableContent';
import { useSmartTable, useTableSelection } from './lib';
import { IFilterItem } from '@shared/model';
import React, { useState } from 'react';
import { ViewModal } from './ViewModal';
import { ViewModalColumn } from './ViewModal'; 

const shallowEqual = (objA: any, objB: any) => {
    if (objA === objB) return true;
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => objA[key] === objB[key]);
};

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
    virtual?: boolean;
    downloadButton?: IDownloadButton;
    downloadPayload?: object;
    showDownloadBtn?: boolean;
    totalCount?: boolean;
    requestTransform?: (params: any) => any;
    responseTransform?: (response: any) => ResponseType;
    offlineMode?: OfflineConfig;
    enableViewModal?: boolean;
    viewModalTitle?: string;
    viewModalColumns?: TableColumnsType<RecordType>;
}

export function SmartTable<RecordType = any, ResponseType = any>(props: IProps<RecordType, ResponseType>) {
    const { downloadButton, downloadPayload, virtual = false, enableViewModal = false } = props;

    // State для модалки
    const [selectedRow, setSelectedRow] = useState<RecordType | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

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
        onSelectionChange: props.handleSelectionChange,
    });

    const { handleDownload, downloadPending } = useTableDownload({ downloadButton });

    const handleDownloadClick = () => {
        handleDownload(tableLogic.transformedFilters, downloadPayload);
    };

    const handlePageChange = (page: number, pageSize: number) => {
        tableLogic.setParams('pageNumber', page);
        tableLogic.setParams('pageSize', pageSize);
    };

    // Обработчик клика на строку
    const handleRowClickInternal = (row: RecordType) => {
        if (enableViewModal) {
            setSelectedRow(row);
            setModalVisible(true);
        }
        props.handleRowClick?.(row);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedRow(null);
    };

    const MemoizedTableContent = React.memo(
        (memoProps: any) => <TableContent {...memoProps} virtual={virtual} />,
        (prev, next) => shallowEqual(prev, next),
    );

    return (
        <>
            <div className="sm:p-4">
                {props.customRender ? (
                    props.customRender(tableLogic.tableData, tableLogic.total)
                ) : (
                    <MemoizedTableContent
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
                        handleRowClick={handleRowClickInternal}
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

            {/* Модалка просмотра */}
            {enableViewModal && (
                <ViewModal
                    visible={modalVisible}
                    onClose={handleCloseModal}
                    data={selectedRow}
                    title={props.viewModalTitle}
                    columns={(props.viewModalColumns || props.columns) as ViewModalColumn<RecordType>[]}
                />
            )}
        </>
    );
}
