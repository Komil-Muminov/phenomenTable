import { useGetQuery } from '@shared/lib';
import { Select, Spin, type SelectProps } from 'antd';
import { useMemo } from 'react';

type SelectOption = { label: string; value: string | number; [key: string]: unknown };

interface ISmartSelectProps extends Omit<SelectProps, 'options' | 'loading'> {
    url?: string;
    method?: 'GET' | 'POST';
    dataSource?: unknown[];
    queryParams?: Record<string, unknown>;
    /** Своё преобразование ответа в опции */
    transform?: (response: unknown) => SelectOption[];
}

// Ответ может быть массивом или обёрткой { data } / { items }
const extractItems = (raw: unknown): Record<string, unknown>[] => {
    if (Array.isArray(raw)) return raw;
    const wrapper = raw as { data?: unknown; items?: unknown } | null;
    const items = wrapper?.data ?? wrapper?.items;
    return Array.isArray(items) ? items : [];
};

const toOption = (item: Record<string, unknown>): SelectOption | null => {
    const value = item.id ?? item.value;
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    const label = item.name ?? item.label ?? item.title ?? value;
    return { ...item, label: String(label), value };
};

/** Select, который сам грузит опции по url (или берёт из dataSource) */
export const SmartSelect = (props: ISmartSelectProps) => {
    const {
        url,
        method = 'GET',
        dataSource,
        queryParams,
        transform,
        placeholder = 'Выберите значение',
        allowClear = true,
        showSearch = true,
        ...selectProps
    } = props;

    const { data: apiData, isLoading } = useGetQuery<Record<string, unknown> | undefined, unknown>({
        url: url ?? '',
        method,
        params: queryParams,
        options: { enabled: !dataSource && Boolean(url) },
    });

    const options = useMemo(() => {
        const raw = dataSource ?? apiData;
        if (!raw) return [];
        if (transform) return transform(raw);
        return extractItems(raw)
            .map(toOption)
            .filter((option): option is SelectOption => option !== null);
    }, [dataSource, apiData, transform]);

    return (
        <Select
            placeholder={placeholder}
            options={options}
            loading={isLoading}
            allowClear={allowClear}
            showSearch={showSearch}
            optionFilterProp="label"
            notFoundContent={isLoading ? <Spin size="small" /> : 'Нет данных'}
            {...selectProps}
        />
    );
};
