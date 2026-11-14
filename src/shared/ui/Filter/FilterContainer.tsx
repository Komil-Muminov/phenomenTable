import { ClearOutlined, DownloadOutlined } from '@ant-design/icons';
import { FilterType, type IFilterItem } from '@shared/model';
import { Button } from 'antd';

import { FilterDate } from './FilterDate';
import { FilterInput } from './FilterInput';
import { FilterSelect } from './FilterSelect';

import type { ReactNode } from 'react';

interface FiltersContainerProps {
    filters: IFilterItem[];
    searchMode?: boolean;
    searchButtonText?: string;
    searchButtonIcon?: ReactNode;
    onApplyFilters: () => void;
    onResetFilters: () => void;
    isLoading?: boolean;
    onDownload?: () => void;
    downloadPending?: boolean;
    showDownloadBtn?: boolean;
}

export const FiltersContainer = (props: FiltersContainerProps) => {
    const {
        filters,
        searchMode = false,
        searchButtonText = 'Поиск',
        searchButtonIcon,
        onApplyFilters,
        onResetFilters,
        isLoading = false,
        onDownload,
        downloadPending = false,
        showDownloadBtn = false,
    } = props;

    const renderFilter = (filter: IFilterItem) => {
        const key = filter.name;
        switch (filter.type) {
            case FilterType.INPUT:
                return (
                    <div key={key} className="!w-full sm:!w-48">
                        <FilterInput config={filter} customClass="!w-full" />
                    </div>
                );
            case FilterType.SELECT:
                return (
                    <div key={key} className="!w-full sm:!w-48">
                        <FilterSelect config={filter} customClass="!w-full" />
                    </div>
                );
            case FilterType.DATE:
            case FilterType.DATE_RANGE:
                return (
                    <div key={key} className="!w-full sm:!w-48">
                        <FilterDate config={filter} customClass="!w-full" />
                    </div>
                );
            default:
                return null;
        }
    };
    return (
        <div className="!flex !flex-wrap p-4 !gap-2 sm:!gap-3 !w-full sm:!w-auto lg:p-0">
            {/* Фильтры */}
            {filters?.map(renderFilter)}

            {/* Кнопки действий */}
            <div className="!flex !flex-wrap !gap-2 sm:!gap-3 !w-full sm:!w-auto">
                {searchMode && (
                    <Button
                        type="primary"
                        icon={searchButtonIcon}
                        onClick={onApplyFilters}
                        loading={isLoading}
                        className="!flex-1 sm:!flex-none !min-w-[100px]"
                    >
                        <span className="!hidden sm:!inline">{searchButtonText}</span>
                        <span className="!inline sm:!hidden">Поиск</span>
                    </Button>
                )}

                <Button
                    type="primary"
                    danger
                    icon={<ClearOutlined />}
                    onClick={onResetFilters}
                    disabled={isLoading}
                    className="!flex-1 sm:!flex-none !min-w-[100px]"
                >
                    <span className="!hidden sm:!inline">Сбросить</span>
                    <span className="!inline sm:!hidden">Очистить</span>
                </Button>

                {showDownloadBtn && onDownload && (
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={onDownload}
                        loading={downloadPending}
                        type="primary"
                        className="!flex-1 !bg-emerald-500 !text-white sm:!flex-none !min-w-[100px]"
                    >
                        <span className="!hidden sm:!inline">Скачать</span>
                        <span className="!inline sm:!hidden">Excel</span>
                    </Button>
                )}
            </div>
        </div>
    );
};
