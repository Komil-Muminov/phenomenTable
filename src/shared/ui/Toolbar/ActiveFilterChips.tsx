import { Button, Tag } from 'antd';

import type { FilterChip } from '../lib/filterChips';
import type { IFilterItem } from '@shared/model';

interface ActiveFilterChipsProps {
    chips: FilterChip[];
    onRemove: (filter: IFilterItem) => void;
    onClearAll: () => void;
}

/** Применённые фильтры чипсами — видно, что отфильтровано, и снимается в один клик */
export const ActiveFilterChips = ({ chips, onRemove, onClearAll }: ActiveFilterChipsProps) => {
    if (chips.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-1.5" aria-label="Активные фильтры">
            {chips.map(({ filter, label, value }) => (
                <Tag
                    key={filter.name}
                    closable
                    onClose={(event) => {
                        event.preventDefault();
                        onRemove(filter);
                    }}
                    closeIcon={<span aria-label={`Убрать фильтр «${label}»`}>×</span>}
                    className="m-0 flex items-center gap-1 rounded-full border-line px-2.5 py-0.5 text-[13px]"
                >
                    <span className="text-ink-muted">{label}:</span>
                    <span className="font-medium text-ink">{value}</span>
                </Tag>
            ))}

            {chips.length > 1 && (
                <Button type="link" size="small" onClick={onClearAll} className="px-1">
                    Сбросить все
                </Button>
            )}
        </div>
    );
};
