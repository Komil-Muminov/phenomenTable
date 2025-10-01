import { FC, useEffect, useState } from 'react';
import { Select } from 'antd';
// import { useDebouncedCallback, useDynamicSearchParams } from '@hooks';
import { useDynamicSearchParams, useDebouncedCallback } from '@shared/lib';
import { IFilterItem } from '@shared/model';
interface IProps {
    config: IFilterItem;
    customClass?: string;
}

export const FilterSelect: FC<IProps> = ({ config, customClass }) => {
    const { params, setParams } = useDynamicSearchParams();
    const [value, setValue] = useState<string | undefined>(undefined);

    const { placeholder, name, options = [], transform } = config;

    const debouncedChange = useDebouncedCallback((value: string) => {
        setParams(name, value);
    }, 400);

    const handleChange = (selectedValue: string) => {
        if (!selectedValue) {
            setValue(undefined);
            debouncedChange('');
            return;
        }
        setValue(selectedValue);
        debouncedChange(selectedValue);
    };

    useEffect(() => {
        if (params[name] !== value) {
            setValue(params[name]);
        }
    }, [params[name]]);

    return (
        <Select
            placeholder={placeholder}
            options={options}
            value={transform?.(value) || value}
            onChange={handleChange}
            allowClear
            className={customClass}
        />
    );
};
