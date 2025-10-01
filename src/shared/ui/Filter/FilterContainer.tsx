import { Button, Space } from 'antd';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
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
                return <FilterInput key={key} config={filter} customClass="w-full sm:w-48" />;
            case 'select':
                return <FilterSelect key={key} config={filter} customClass="w-full sm:w-48" />;
            case 'date':
                return <FilterDate key={key} config={filter} customClass="w-full sm:w-48" />;
            default:
                return null;
        }
    };

    return (
        <Space wrap className="w-full sm:w-auto">
            {filters.map(renderFilter)}

            {searchMode && (
                <Button type="primary" icon={searchButtonIcon} onClick={onApplyFilters} loading={isLoading}>
                    {searchButtonText}
                </Button>
            )}

            <Button icon={<ReloadOutlined />} onClick={onResetFilters} disabled={isLoading}>
                Сбросить
            </Button>

            {showDownloadBtn && onDownload && (
                <Button icon={<DownloadOutlined />} onClick={onDownload} loading={downloadPending}>
                    Скачать
                </Button>
            )}
        </Space>
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
