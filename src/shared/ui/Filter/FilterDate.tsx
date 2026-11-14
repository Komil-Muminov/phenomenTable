import { useDynamicSearchParams } from '@shared/lib';
import { FilterType, type IFilterItem } from '@shared/model';
import { DatePicker } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { FC, useMemo } from 'react';

const { RangePicker } = DatePicker;

const URL_FORMAT = 'YYYY-MM-DD';
const DISPLAY_FORMAT = 'DD.MM.YYYY';

interface IProps {
    config: IFilterItem;
    customClass?: string;
}

// Строгий парсинг: мусор из URL не превращается в «Invalid Date» в пикере
const parseDate = (value?: string): Dayjs | null => {
    if (!value) return null;
    const date = dayjs(value, URL_FORMAT, true);
    return date.isValid() ? date : null;
};

/** Одиночная дата (`name`) или диапазон (`nameFrom` + `nameTo`) — значение живёт в URL */
export const FilterDate: FC<IProps> = ({ config, customClass }) => {
    const { params, setParams } = useDynamicSearchParams();
    const { placeholder, name, type } = config;
    const fromKey = `${name}From`;
    const toKey = `${name}To`;

    const single = useMemo(() => parseDate(params[name]), [params, name]);
    const range = useMemo<[Dayjs, Dayjs] | null>(() => {
        const from = parseDate(params[fromKey]);
        const to = parseDate(params[toKey]);
        return from && to ? [from, to] : null;
    }, [params, fromKey, toKey]);

    if (type === FilterType.DATE_RANGE) {
        return (
            <RangePicker
                placeholder={[placeholder || 'От', 'До']}
                value={range}
                format={DISPLAY_FORMAT}
                className={customClass}
                onChange={(dates) => {
                    const [from, to] = dates ?? [];
                    // Записываем только полный диапазон, иначе чистим оба ключа
                    const isFull = Boolean(from && to);
                    setParams({
                        [fromKey]: isFull ? from!.format(URL_FORMAT) : '',
                        [toKey]: isFull ? to!.format(URL_FORMAT) : '',
                    });
                }}
            />
        );
    }

    return (
        <DatePicker
            placeholder={placeholder}
            value={single}
            format={DISPLAY_FORMAT}
            className={customClass}
            onChange={(date) => setParams(name, date ? date.format(URL_FORMAT) : '')}
        />
    );
};
