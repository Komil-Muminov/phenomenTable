import { FC, useMemo } from 'react';
import { Select, SelectProps, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { _axios } from '@shared/config';
import { tokenControl } from '@shared/config/tokenControl';

interface ISmartSelectProps extends Omit<SelectProps, 'options' | 'loading'> {
    url?: string;
    method?: 'GET' | 'POST';
    dataSource?: any[];
    queryParams?: any;
    transform?: (response: any) => Array<{ label: string; value: any; [key: string]: any }>;
}

export const SmartSelect: FC<ISmartSelectProps> = (props) => {
    const {
        url,
        method = 'GET',
        dataSource,
        queryParams,
        placeholder = 'Выберите значение',
        allowClear = true,
        showSearch = true,
        ...selectProps
    } = props;

    // Загрузка данных (только если нет dataSource)
    const { data: apiData, isLoading } = useQuery({
        queryKey: [url, method, queryParams],
        queryFn: async () => {
            const token = tokenControl.get();
            const response = await _axios({
                url,
                method,
                [method === 'POST' ? 'data' : 'params']: queryParams,
                headers: { Authorization: token ? `Bearer ${token}` : undefined },
            });
            return response.data;
        },
        enabled: !dataSource && !!url,
    });

    // Определяем источник данных
    const rawData = dataSource || apiData;

    // Трансформируем в options
    const options = useMemo(() => {
        if (!rawData) return [];

        const items = Array.isArray(rawData) ? rawData : rawData?.data || rawData?.items || [];

        return items.map((item: any) => ({
            label: item.name || item.label || item.title || String(item.id),
            value: item.id || item.value,
            ...item,
        }));
    }, [rawData]);

    return (
        <Select
            placeholder={placeholder}
            options={options}
            loading={isLoading}
            allowClear={allowClear}
            showSearch={showSearch}
            filterOption={(input, option: any) => option?.label?.toLowerCase().includes(input.toLowerCase())}
            notFoundContent={isLoading ? <Spin size="small" /> : 'Нет данных'}
            {...selectProps}
        />
    );
};
