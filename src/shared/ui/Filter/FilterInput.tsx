import { FC, useEffect, useState } from 'react';
import { Input } from 'antd';
// import { useDebouncedCallback, useDynamicSearchParams } from '@hooks';
import { useDynamicSearchParams, useDebouncedCallback } from '@shared/lib';
// import { IFilterItem } from './';
import { IFilterItem } from '@shared/model';

interface IProps {
    config: IFilterItem;
    customClass?: string;
}

export const FilterInput: FC<IProps> = ({ config, customClass }) => {
    const { params, setParams } = useDynamicSearchParams();
    const [value, setValue] = useState('');

    const { placeholder, name, inputProps } = config;

    const debouncedChange = useDebouncedCallback((value: string) => {
        setParams(name, value);
    }, 400);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        debouncedChange(e.target.value);
    };

    useEffect(() => {
        if (params[name] !== value) {
            setValue(params[name] || '');
        }
    }, [params[name]]);

    return (
        <Input
            value={value}
            {...inputProps}
            placeholder={placeholder}
            onChange={handleChange}
            className={customClass}
        />
    );
};
