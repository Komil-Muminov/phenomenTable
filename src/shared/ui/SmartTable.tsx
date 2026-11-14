import { SearchParamsScopeContext, useTableDownload } from '@shared/lib';
import { withDateFormatting } from '@shared/utils';
import { useCallback, useMemo, useState } from 'react';

import { BulkActionsBar } from './BulkActionsBar';
import { useSmartTable, useTableSelection } from './lib';
import { TableContent, type TableContentToolbar } from './TableContent';
import { ViewModal } from './ViewModal';

import type { SmartTableProps } from '@shared/model';

/**
 * Таблица «под ключ»: загрузка, фильтры в URL, пагинация, выделение и массовые действия,
 * скачивание отчёта, модалка просмотра и мобильные карточки.
 */
export function SmartTable<RecordType = Record<string, unknown>, ResponseType = unknown>(
    props: SmartTableProps<RecordType, ResponseType>,
) {
    // Скоуп оборачивает всё дерево — фильтры внутри тоже пишут в свои ключи
    return (
        <SearchParamsScopeContext.Provider value={props.paramsScope}>
            <SmartTableInner {...props} />
        </SearchParamsScopeContext.Provider>
    );
}

function SmartTableInner<RecordType, ResponseType>(props: SmartTableProps<RecordType, ResponseType>) {
    const { columns, rowKey = 'id', downloadButton, downloadPayload, enableViewModal = false, handleRowClick } = props;

    const [selectedRow, setSelectedRow] = useState<RecordType | null>(null);

    const table = useSmartTable<RecordType, ResponseType>({
        url: props.url,
        queryParams: props.queryParams,
        filters: props.filters,
        dataSource: props.dataSource,
        getItemsFromResponse: props.getItemsFromResponse,
        getTotalFromResponse: props.getTotalFromResponse,
        searchButton: props.searchButton,
        localFilter: props.localFilter,
        requestTransform: props.requestTransform,
        responseTransform: props.responseTransform,
    });

    // Встроенное выделение включается, только если о нём попросили
    const selection = useTableSelection<RecordType>({
        data: table.tableData,
        rowKey,
        onSelectionChange: props.handleSelectionChange,
    });
    const hasBulk = Boolean(props.bulkActions?.length);
    const builtInSelection = props.handleSelectionChange || hasBulk ? selection : undefined;

    const { handleDownload, downloadPending } = useTableDownload({ downloadButton });
    const { transformedFilters } = table;

    const onDownload = useCallback(
        () => handleDownload(transformedFilters, downloadPayload),
        [handleDownload, transformedFilters, downloadPayload],
    );

    const toolbar = useMemo<TableContentToolbar | undefined>(() => {
        if (!props.filters || props.hideFilters) return undefined;
        return {
            filters: props.filters,
            filterValues: table.filterValues,
            activeFilters: table.activeFilters,
            hasPending: table.hasPendingFilters,
            onApplyFilters: table.handleApplyFilters,
            onResetFilters: table.handleResetFilters,
            onRemoveFilter: table.handleRemoveFilter,
            title: props.title,
            className: props.style,
            searchButton: props.searchButton,
            searchButtonText: props.searchButtonText,
            searchButtonIcon: props.searchButtonIcon,
            showDownloadBtn: props.showDownloadBtn,
            downloadPending,
            onDownload,
        };
    }, [
        props.filters,
        props.hideFilters,
        props.title,
        props.style,
        props.searchButton,
        props.searchButtonText,
        props.searchButtonIcon,
        props.showDownloadBtn,
        table.filterValues,
        table.activeFilters,
        table.hasPendingFilters,
        table.handleApplyFilters,
        table.handleResetFilters,
        table.handleRemoveFilter,
        downloadPending,
        onDownload,
    ]);

    // Даты форматируем только при отображении — в обработчики идут исходные данные
    const displayColumns = useMemo(() => withDateFormatting(columns), [columns]);
    const modalColumns = useMemo(
        () => (props.viewModalColumns ? withDateFormatting(props.viewModalColumns) : displayColumns),
        [props.viewModalColumns, displayColumns],
    );

    const onRowClick = useCallback(
        (row: RecordType) => {
            if (enableViewModal) setSelectedRow(row);
            handleRowClick?.(row);
        },
        [enableViewModal, handleRowClick],
    );
    const hasRowClick = enableViewModal || Boolean(handleRowClick);
    const closeModal = useCallback(() => setSelectedRow(null), []);

    return (
        <>
            {props.customRender ? (
                props.customRender(table.tableData, table.total)
            ) : (
                <TableContent<RecordType>
                    tableData={table.tableData}
                    columns={displayColumns}
                    total={table.total}
                    isLoading={table.isLoading}
                    rowKey={rowKey}
                    toolbar={toolbar}
                    isFiltered={Object.keys(table.activeFilters).length > 0}
                    pageNumber={table.pageNumber}
                    pageSize={table.pageSize}
                    onPageChange={table.setPage}
                    handleRowClick={hasRowClick ? onRowClick : undefined}
                    rowClassName={props.rowClassName}
                    rowSelection={props.rowSelection ?? builtInSelection?.rowSelection}
                    onToggleSelect={props.rowSelection ? undefined : builtInSelection?.toggleSelection}
                    idColumnHidden={props.idColumnHidden}
                    className={props.className}
                    hiddenPagination={props.hiddenPagination}
                    expandable={props.expandable}
                    disableScrollX={props.disableScrollX}
                    stickyHeader={props.stickyHeader}
                    virtual={props.virtual}
                    enableMobileCards={props.enableMobileCards}
                    mobileBreakpoint={props.mobileBreakpoint}
                    primaryColumnKey={props.primaryColumnKey}
                    hiddenInMobileColumns={props.hiddenInMobileColumns}
                    renderMobileCard={props.renderMobileCard}
                />
            )}

            {hasBulk && (
                <BulkActionsBar<RecordType>
                    actions={props.bulkActions!}
                    selectedRows={selection.selectedRows}
                    selectedCount={selection.selectedCount}
                    onClear={selection.deselectAll}
                />
            )}

            {enableViewModal && (
                <ViewModal<RecordType>
                    visible={selectedRow !== null}
                    onClose={closeModal}
                    data={selectedRow}
                    title={props.viewModalTitle}
                    columns={modalColumns}
                    hideEmpty={props.viewModalHideEmpty}
                />
            )}
        </>
    );
}
