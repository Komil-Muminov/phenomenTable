import { useDynamicSearchParams } from '@shared/lib';
import { Select } from 'antd';
import { FC, useMemo } from 'react';

import type { IFilterItem, ISelectOption } from '@shared/model';

interface IProps {
    config: IFilterItem;
    customClass?: string;
}

export const FilterSelect: FC<IProps> = ({ config, customClass }) => {
    const { params, setParams } = useDynamicSearchParams();
    const { placeholder, name, options = [] } = config;

    // Значение берём прямо из URL и сопоставляем с опцией — так сохраняется исходный тип value
    const urlValue = params[name];
    const value = useMemo(
        () => options.find((option) => String(option.value) === urlValue)?.value,
        [options, urlValue],
    );

    // Выбор в селекте — дискретное действие, debounce не нужен
    const handleChange = (selected?: ISelectOption['value']) =>
        setParams(name, selected === undefined ? '' : String(selected));

    return (
        <Select
            placeholder={placeholder}
            options={options}
            value={value as string | number | undefined}
            onChange={handleChange}
            allowClear
            className={customClass}
        />
    );
};
