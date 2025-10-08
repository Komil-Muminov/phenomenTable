import { FC, useEffect, useState } from 'react';
import { DatePicker } from 'antd';
import { useDynamicSearchParams, useDebouncedCallback } from '@shared/lib';
import dayjs, { Dayjs } from 'dayjs';
import { IFilterItem } from '@shared/model';

const { RangePicker } = DatePicker;

interface IProps {
    config: IFilterItem;
    customClass?: string;
}

export const FilterDate: FC<IProps> = ({ config, customClass }) => {
    const { params, setParams } = useDynamicSearchParams();
    const [value, setValue] = useState<Dayjs | null>(null);
    const [rangeValue, setRangeValue] = useState<[Dayjs | null, Dayjs | null] | null>(null);

    const { placeholder, name, type } = config;
    const isRangeType = type === 'date-range';

    // Debounce для одиночной даты
    const debouncedChange = useDebouncedCallback((value: string) => {
        setParams(name, value);
    }, 400);

    // Debounce для диапазона дат
    const debouncedRangeChange = useDebouncedCallback((startDate: string, endDate: string) => {
        setParams(`${name}From`, startDate);
        setParams(`${name}To`, endDate);
    }, 400);

    // Обработчик для одиночной даты
    const handleChange = (date: Dayjs | null) => {
        if (!date) {
            setValue(null);
            debouncedChange('');
            return;
        }
        setValue(date);
        debouncedChange(date.format('YYYY-MM-DD'));
    };

    // Обработчик для диапазона дат
    const handleRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
        if (!dates || !dates[0] || !dates[1]) {
            setRangeValue(null);
            // Удаляем параметры из URL
            setParams(`${name}From`, '');
            setParams(`${name}To`, '');
            return;
        }
        setRangeValue(dates);
        setParams(`${name}From`, dates[0].format('YYYY-MM-DD'));
        setParams(`${name}To`, dates[1].format('YYYY-MM-DD'));
    };

    // Эффект для одиночной даты
    useEffect(() => {
        if (isRangeType) return;

        const paramValue = params[name];
        if (paramValue && dayjs(paramValue).isValid()) {
            setValue(dayjs(paramValue));
        } else {
            setValue(null);
        }
    }, [params[name], isRangeType]);

    // Эффект для диапазона дат
    useEffect(() => {
        if (!isRangeType) return;

        const fromValue = params[`${name}From`];
        const toValue = params[`${name}To`];

        if (fromValue && toValue && dayjs(fromValue).isValid() && dayjs(toValue).isValid()) {
            setRangeValue([dayjs(fromValue), dayjs(toValue)]);
        } else {
            setRangeValue(null);
        }
    }, [params[`${name}From`], params[`${name}To`], isRangeType]);

    // Рендер RangePicker для диапазона дат
    if (isRangeType) {
        return (
            <RangePicker
                placeholder={[placeholder || 'От', 'До']}
                value={rangeValue}
                onChange={handleRangeChange}
                format="YYYY-MM-DD"
                className={customClass}
            />
        );
    }

    // Рендер обычного DatePicker для одиночной даты
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
