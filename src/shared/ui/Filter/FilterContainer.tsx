import { Button, Space } from 'antd';
import { DownloadOutlined, ClearOutlined } from '@ant-design/icons';
import { FilterInput } from './FilterInput';
import { FilterSelect } from './FilterSelect';
import { FilterDate } from './FilterDate';
import { IFilterItem } from '@shared/model';

interface FiltersContainerProps {
    filters: IFilterItem[];
    searchMode?: boolean;
    searchButtonText?: string;
    searchButtonIcon?: React.ReactNode;
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
            case 'input':
                return (
                    <div key={key} className="!w-full sm:!w-48">
                        <FilterInput config={filter} customClass="!w-full" />
                    </div>
                );
            case 'select':
                return (
                    <div key={key} className="!w-full sm:!w-48">
                        <FilterSelect config={filter} customClass="!w-full" />
                    </div>
                );
            case 'date':
            case 'date-range':
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
        <div className="!flex !flex-wrap !gap-2 sm:!gap-3 !w-full sm:!w-auto">
            {/* Фильтры */}
            {filters.map(renderFilter)}

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
                        className="!flex-1 sm:!flex-none !min-w-[100px]"
                    >
                        <span className="!hidden sm:!inline">Скачать</span>
                        <span className="!inline sm:!hidden">Excel</span>
                    </Button>
                )}
            </div>
        </div>
    );
};

export const useFilterValues = (searchParams: Record<string, any>, filters: IFilterItem[]) => {
    return filters.reduce((acc, filter) => {
        const value = searchParams[filter.name];
        if (value !== undefined && value !== '') {
            acc[filter.name] = value;
        }
        return acc;
    }, {} as Record<string, any>);
};
