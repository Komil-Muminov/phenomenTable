import { Button, Tooltip } from 'antd';
import { Download } from 'lucide-react';
import { useMemo } from 'react';

import { FilterFields } from '../Filter/FilterFields';
import { buildFilterChips } from '../lib/filterChips';

import { ActiveFilterChips } from './ActiveFilterChips';
import { MobileFiltersDrawer } from './MobileFiltersDrawer';
import { ToolbarActions, type ToolbarActionsProps } from './ToolbarActions';

import type { IFilterItem } from '@shared/model';

export interface TableToolbarProps extends Omit<ToolbarActionsProps, 'canReset'> {
    filters: IFilterItem[];
    /** Значения в полях (URL) — для кнопки «Сбросить» */
    filterValues: Record<string, string>;
    /** Применённые значения — для чипсов */
    activeFilters: Record<string, string>;
    onRemoveFilter: (filter: IFilterItem) => void;
    isMobile: boolean;
    title?: string;
    className?: string;
}

/** Шапка таблицы: заголовок, фильтры, действия и чипсы активных фильтров */
export const TableToolbar = (props: TableToolbarProps) => {
    const { filters, filterValues, activeFilters, isMobile, title, className } = props;

    const chips = useMemo(() => buildFilterChips(filters, activeFilters), [filters, activeFilters]);
    const canReset = Object.keys(filterValues).length > 0 || chips.length > 0;

    const chipsRow = (
        <ActiveFilterChips chips={chips} onRemove={props.onRemoveFilter} onClearAll={props.onResetFilters} />
    );

    if (isMobile) {
        return (
            <div className={`mb-3 flex flex-col gap-2 ${className ?? ''}`}>
                <div className="flex items-center gap-2">
                    {title && <h2 className="mr-auto truncate text-base font-semibold text-ink">{title}</h2>}
                    <div className={`flex items-center gap-2 ${title ? '' : 'ml-auto'}`}>
                        {props.showDownloadBtn && props.onDownload && (
                            <Tooltip title="Скачать">
                                <Button
                                    aria-label="Скачать"
                                    icon={<Download className="size-4" />}
                                    loading={props.downloadPending}
                                    onClick={props.onDownload}
                                />
                            </Tooltip>
                        )}
                        <MobileFiltersDrawer
                            filters={filters}
                            activeCount={chips.length}
                            searchButton={props.searchButton}
                            canReset={canReset}
                            onApplyFilters={props.onApplyFilters}
                            onResetFilters={props.onResetFilters}
                        />
                    </div>
                </div>
                {chipsRow}
            </div>
        );
    }

    return (
        <div className={`mb-3 flex flex-col gap-3 ${className ?? ''}`}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {title && <h2 className="mr-auto text-lg font-semibold text-ink">{title}</h2>}
                <div className={`flex flex-wrap items-center gap-2 ${title ? '' : 'w-full'}`}>
                    <FilterFields filters={filters} />
                    <ToolbarActions {...props} canReset={canReset} />
                </div>
            </div>
            {chipsRow}
        </div>
    );
};
