import { useDebouncedCallback, useDynamicSearchParams } from '@shared/lib';
import { Input } from 'antd';
import { FC, useEffect, useState } from 'react';

import type { IFilterItem } from '@shared/model';

const MAX_LENGTH = 200;

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
        // Режем слишком длинный ввод, в URL пробелы по краям не нужны
        const next = e.target.value.slice(0, MAX_LENGTH);
        setValue(next);
        debouncedChange(next.trim());
    };

    // Синхронизация с URL (назад/вперёд, сброс фильтров)
    const urlValue = params[name] ?? '';
    useEffect(() => {
        setValue((current) => (current.trim() === urlValue ? current : urlValue));
    }, [urlValue]);

    return (
        <Input
            allowClear
            maxLength={MAX_LENGTH}
            {...inputProps}
            value={value}
            placeholder={placeholder}
            onChange={handleChange}
            className={customClass}
        />
    );
};
