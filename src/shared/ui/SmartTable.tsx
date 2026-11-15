import { SearchParamsScopeContext, useTableDownload } from '@shared/lib';
import { withDateFormatting } from '@shared/utils';
import { useCallback, useMemo, useState } from 'react';

import { BulkActionsBar } from './BulkActionsBar';
import { resolveToggle, useSmartTable, useTableSelection } from './lib';
import { TableContent, type TableContentToolbar } from './TableContent';
import { ViewModal } from './ViewModal';

import type { SmartTableMobile, SmartTableProps, SmartTableSearchButton, SmartTableViewModal } from '@shared/model';

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
    const { columns, rowKey = 'id', download, onRowClick, view = {}, adapter = {}, selection: selectionProps } = props;

    // Флаг-или-объект → объект настроек (или undefined, если блок выключен)
    const search = resolveToggle<SmartTableSearchButton>(props.searchButton);
    const viewModal = resolveToggle<SmartTableViewModal<RecordType>>(props.viewModal);
    const mobile = resolveToggle<SmartTableMobile<RecordType>>(props.mobile, true);

    const [selectedRow, setSelectedRow] = useState<RecordType | null>(null);

    const table = useSmartTable<RecordType, ResponseType>({
        url: props.url,
        queryParams: props.queryParams,
        filters: props.filters,
        dataSource: props.dataSource,
        getItemsFromResponse: adapter.getItems,
        getTotalFromResponse: adapter.getTotal,
        requestTransform: adapter.transformRequest,
        responseTransform: adapter.transformResponse,
        searchButton: Boolean(search),
        localFilter: props.localFilter,
    });

    // Встроенное выделение включается, только если о нём попросили
    const selection = useTableSelection<RecordType>({
        data: table.tableData,
        rowKey,
        onSelectionChange: selectionProps?.onChange,
    });
    const bulkActions = selectionProps?.bulkActions;
    const hasBulk = Boolean(bulkActions?.length);
    const builtInSelection = selectionProps?.onChange || hasBulk ? selection : undefined;
    const customRowSelection = selectionProps?.rowSelection;

    const { handleDownload, downloadPending } = useTableDownload({ downloadButton: download });
    const { transformedFilters } = table;
    const downloadPayload = download?.payload;

    const onDownload = useCallback(
        () => handleDownload(transformedFilters, downloadPayload),
        [handleDownload, transformedFilters, downloadPayload],
    );

    const searchText = search?.text;
    const searchIcon = search?.icon;
    const isSearchMode = Boolean(search);

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
            className: view.toolbarClassName,
            searchButton: isSearchMode,
            searchButtonText: searchText,
            searchButtonIcon: searchIcon,
            showDownloadBtn: Boolean(download),
            downloadPending,
            onDownload,
        };
    }, [
        props.filters,
        props.hideFilters,
        props.title,
        view.toolbarClassName,
        isSearchMode,
        searchText,
        searchIcon,
        download,
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
    const modalSourceColumns = viewModal?.columns;
    const modalColumns = useMemo(
        () => (modalSourceColumns ? withDateFormatting(modalSourceColumns) : displayColumns),
        [modalSourceColumns, displayColumns],
    );

    const hasViewModal = Boolean(viewModal);
    const handleRowClick = useCallback(
        (row: RecordType) => {
            if (hasViewModal) setSelectedRow(row);
            onRowClick?.(row);
        },
        [hasViewModal, onRowClick],
    );
    const hasRowClick = hasViewModal || Boolean(onRowClick);
    const closeModal = useCallback(() => setSelectedRow(null), []);

    return (
        <>
            {/* Внутренний отступ sm:p-4; view.padded=false — если отступы задаёт страница */}
            <div className={view.padded === false ? undefined : 'sm:p-4'}>
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
                        handleRowClick={hasRowClick ? handleRowClick : undefined}
                        rowClassName={props.rowClassName}
                        rowSelection={customRowSelection ?? builtInSelection?.rowSelection}
                        onToggleSelect={customRowSelection ? undefined : builtInSelection?.toggleSelection}
                        idColumnHidden={view.idColumn === false}
                        className={props.className}
                        hiddenPagination={view.pagination === false}
                        expandable={props.expandable}
                        disableScrollX={view.scrollX === false}
                        stickyHeader={view.stickyHeader}
                        virtual={view.virtual}
                        enableMobileCards={Boolean(mobile)}
                        mobileBreakpoint={mobile?.breakpoint}
                        primaryColumnKey={mobile?.primaryColumnKey}
                        hiddenInMobileColumns={mobile?.hiddenColumns}
                        renderMobileCard={mobile?.renderCard}
                    />
                )}
            </div>

            {hasBulk && bulkActions && (
                <BulkActionsBar<RecordType>
                    actions={bulkActions}
                    selectedRows={selection.selectedRows}
                    selectedCount={selection.selectedCount}
                    onClear={selection.deselectAll}
                />
            )}

            {viewModal && (
                <ViewModal<RecordType>
                    visible={selectedRow !== null}
                    onClose={closeModal}
                    data={selectedRow}
                    title={viewModal.title}
                    columns={modalColumns}
                    hideEmpty={viewModal.hideEmpty}
                />
            )}
        </>
    );
}
