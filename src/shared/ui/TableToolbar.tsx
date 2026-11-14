import { FiltersContainer } from './Filter/FilterContainer';

import type { IFilterItem } from '@shared/model';
import type { ReactNode } from 'react';

interface TableToolbarProps {
    filters: IFilterItem[];
    title?: string;
    className?: string;
    searchButton?: boolean;
    searchButtonText?: string;
    searchButtonIcon?: ReactNode;
    isLoading: boolean;
    onApplyFilters: () => void;
    onResetFilters: () => void;
    showDownloadBtn?: boolean;
    downloadPending?: boolean;
    onDownload?: () => void;
}

/** Шапка таблицы: заголовок + фильтры + кнопки */
export const TableToolbar = ({ filters, title, className, searchButton, ...rest }: TableToolbarProps) => (
    <div className={`flex flex-col items-end sm:flex-row sm:items-center ${className ?? ''}`}>
        {title && <h2 className="mb-2 text-base font-semibold sm:mb-0 sm:mr-auto sm:text-lg">{title}</h2>}
        <div className="flex w-full items-center gap-3 sm:w-auto">
            <FiltersContainer filters={filters} searchMode={searchButton} {...rest} />
        </div>
    </div>
);
