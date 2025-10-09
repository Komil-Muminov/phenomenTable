import { FC, useEffect, useState } from 'react';
import { Select } from 'antd';
import { useDynamicSearchParams, useDebouncedCallback } from '@shared/lib';
import { IFilterItem } from '@shared/model';

interface IProps {
    config: IFilterItem;
    customClass?: string;
}

export const FilterSelect: FC<IProps> = ({ config, customClass }) => {
    const { params, setParams } = useDynamicSearchParams();
    const [value, setValue] = useState<string | number | undefined>(undefined);
    const { placeholder, name, options = [], transform } = config;

    const debouncedChange = useDebouncedCallback((value: string | number) => {
        setParams(name, value);
    }, 400);

    const handleChange = (selectedValue: string | number) => {
        if (selectedValue === undefined || selectedValue === null || selectedValue === '') {
            setValue(undefined);
            debouncedChange('');
            return;
        }
        setValue(selectedValue);
        debouncedChange(selectedValue);
    };

    useEffect(() => {
        const paramValue = params[name];
        if (paramValue !== undefined && paramValue !== '') {
            // Преобразуем в number если это число
            const normalizedValue =
                typeof paramValue === 'string' && !isNaN(Number(paramValue)) ? Number(paramValue) : paramValue;
            setValue(normalizedValue);
        } else {
            setValue(undefined);
        }
    }, [params[name], name]);

    return (
        <Select
            placeholder={placeholder}
            options={options}
            value={value}
            onChange={handleChange}
            allowClear
            className={customClass}
        />
    );
};
