import { FC, useEffect, useState } from 'react';
import { DatePicker } from 'antd';
import { useDynamicSearchParams, useDebouncedCallback } from '@shared/lib';
import dayjs from 'dayjs';
import { IFilterItem } from '@shared/model';

interface IProps {
    config: IFilterItem;
    customClass?: string;
}

export const FilterDate: FC<IProps> = ({ config, customClass }) => {
    const { params, setParams } = useDynamicSearchParams();
    const [value, setValue] = useState<dayjs.Dayjs | null>(null);

    const { placeholder, name } = config;

    const debouncedChange = useDebouncedCallback((value: string) => {
        setParams(name, value);
    }, 400);

    const handleChange = (date: dayjs.Dayjs | null) => {
        if (!date) {
            setValue(null);
            debouncedChange('');
            return;
        }
        setValue(date);
        debouncedChange(date.format('YYYY-MM-DD'));
    };

    useEffect(() => {
        const paramValue = params[name];
        if (paramValue && dayjs(paramValue).isValid()) {
            setValue(dayjs(paramValue));
        } else {
            setValue(null);
        }
    }, [params[name]]);

    return (
        <DatePicker
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            format="YYYY-MM-DD"
            className={customClass}
        />
    );
};
