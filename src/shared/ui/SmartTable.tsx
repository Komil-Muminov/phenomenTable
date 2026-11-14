import { SearchParamsScopeContext, useTableDownload } from '@shared/lib';
import { withDateFormatting } from '@shared/utils';
import { useCallback, useMemo, useState } from 'react';

import { useSmartTable, useTableSelection } from './lib';
import { TableContent } from './TableContent';
import { ViewModal } from './ViewModal';

import type { SmartTableProps } from '@shared/model';

/**
 * Таблица «под ключ»: загрузка, фильтры в URL, пагинация, выделение,
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

    const tableLogic = useSmartTable<RecordType, ResponseType>({
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
        data: tableLogic.tableData,
        rowKey,
        onSelectionChange: props.handleSelectionChange,
    });
    const builtInSelection = props.handleSelectionChange ? selection : undefined;

    const { handleDownload, downloadPending } = useTableDownload({ downloadButton });
    const { transformedFilters } = tableLogic;

    const onDownload = useCallback(
        () => handleDownload(transformedFilters, downloadPayload),
        [handleDownload, transformedFilters, downloadPayload],
    );

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
            <div className="sm:p-4">
                {props.customRender ? (
                    props.customRender(tableLogic.tableData, tableLogic.total)
                ) : (
                    <TableContent<RecordType>
                        tableData={tableLogic.tableData}
                        columns={displayColumns}
                        total={tableLogic.total}
                        isLoading={tableLogic.isLoading}
                        rowKey={rowKey}
                        pageNumber={tableLogic.pageNumber}
                        pageSize={tableLogic.pageSize}
                        onPageChange={tableLogic.setPage}
                        filters={props.filters}
                        hideFilters={props.hideFilters}
                        searchButton={props.searchButton}
                        searchButtonText={props.searchButtonText}
                        searchButtonIcon={props.searchButtonIcon}
                        onApplyFilters={tableLogic.handleApplyFilters}
                        onResetFilters={tableLogic.handleResetFilters}
                        handleRowClick={hasRowClick ? onRowClick : undefined}
                        rowClassName={props.rowClassName}
                        rowSelection={props.rowSelection ?? builtInSelection?.rowSelection}
                        onToggleSelect={props.rowSelection ? undefined : builtInSelection?.toggleSelection}
                        idColumnHidden={props.idColumnHidden}
                        title={props.title}
                        style={props.style}
                        className={props.className}
                        hiddenPagination={props.hiddenPagination}
                        expandable={props.expandable}
                        disableScrollX={props.disableScrollX}
                        virtual={props.virtual}
                        showDownloadBtn={props.showDownloadBtn}
                        downloadPending={downloadPending}
                        onDownload={onDownload}
                        enableMobileCards={props.enableMobileCards}
                        mobileBreakpoint={props.mobileBreakpoint}
                        primaryColumnKey={props.primaryColumnKey}
                        hiddenInMobileColumns={props.hiddenInMobileColumns}
                        renderMobileCard={props.renderMobileCard}
                    />
                )}
            </div>

            {enableViewModal && (
                <ViewModal<RecordType>
                    visible={selectedRow !== null}
                    onClose={closeModal}
                    data={selectedRow}
                    title={props.viewModalTitle}
                    columns={modalColumns}
                />
            )}
        </>
    );
}
