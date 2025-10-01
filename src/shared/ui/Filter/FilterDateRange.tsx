import { FC, useEffect, useState } from 'react';
import { DatePicker } from 'antd';
import { IFilterItem } from '@shared/model';
import { useDebouncedCallback, useDynamicSearchParams } from '@shared/config';
import dayjs from 'dayjs';
// import { useDebouncedCallback, useDynamicSearchParams } from '@shared/config';
// import { IFilterItem } from './FilterContainer';

const { RangePicker } = DatePicker;

interface IProps {
    config: IFilterItem;
    customClass?: string;
}

export const FilterDateRange: FC<IProps> = ({ config, customClass }) => {
    const { params, setParams } = useDynamicSearchParams();
    const [value, setValue] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

    const { placeholder, name } = config;

    // Для диапазона дат используем два параметра: name_start и name_end
    const startParamName = `${name}_start`;
    const endParamName = `${name}_end`;

    const debouncedChange = useDebouncedCallback((startDate: string, endDate: string) => {
        setParams(startParamName, startDate);
        setParams(endParamName, endDate);
    }, 400);

    const handleChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
        if (!dates || !dates[0] || !dates[1]) {
            setValue(null);
            debouncedChange('', '');
            return;
        }

        setValue(dates);
        debouncedChange(dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD'));
    };

    useEffect(() => {
        const startValue = params[startParamName];
        const endValue = params[endParamName];

        if (startValue && endValue && dayjs(startValue).isValid() && dayjs(endValue).isValid()) {
            setValue([dayjs(startValue), dayjs(endValue)]);
        } else {
            setValue(null);
        }
    }, [params[startParamName], params[endParamName]]);

    return (
        <RangePicker
            placeholder={
                placeholder
                    ? [placeholder[0] || 'Начальная дата', placeholder[1] || 'Конечная дата']
                    : ['Начальная дата', 'Конечная дата']
            }
            value={value}
            onChange={handleChange}
            format="YYYY-MM-DD"
            className={customClass}
        />
    );
};
