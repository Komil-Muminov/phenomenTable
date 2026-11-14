import { FilterType, type IFilterItem } from '@shared/model';

import { FilterDate } from './FilterDate';
import { FilterInput } from './FilterInput';
import { FilterSelect } from './FilterSelect';

interface FilterFieldsProps {
    filters: IFilterItem[];
    /** inline — в строку на десктопе, stacked — столбиком (мобильная шторка) */
    layout?: 'inline' | 'stacked';
}

const renderField = (filter: IFilterItem) => {
    switch (filter.type) {
        case FilterType.INPUT:
            return <FilterInput config={filter} customClass="w-full" />;
        case FilterType.SELECT:
            return <FilterSelect config={filter} customClass="w-full" />;
        case FilterType.DATE:
        case FilterType.DATE_RANGE:
            return <FilterDate config={filter} customClass="w-full" />;
        default:
            return null;
    }
};

/** Поля фильтров. Значения живут в URL, поэтому одни и те же поля можно рендерить где угодно */
export const FilterFields = ({ filters, layout = 'inline' }: FilterFieldsProps) => (
    <div className={layout === 'inline' ? 'flex flex-wrap items-center gap-2' : 'flex flex-col gap-3'}>
        {filters.map((filter) => (
            <div key={filter.name} className={layout === 'inline' ? 'w-48' : 'w-full'}>
                {renderField(filter)}
            </div>
        ))}
    </div>
);
