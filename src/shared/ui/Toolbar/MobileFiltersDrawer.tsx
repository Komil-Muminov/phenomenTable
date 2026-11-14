import { Badge, Button, Drawer } from 'antd';
import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { FilterFields } from '../Filter/FilterFields';

import type { IFilterItem } from '@shared/model';

interface MobileFiltersDrawerProps {
    filters: IFilterItem[];
    activeCount: number;
    searchButton?: boolean;
    canReset: boolean;
    onApplyFilters: () => void;
    onResetFilters: () => void;
}

/** На мобилке фильтры прячутся в нижнюю шторку, наружу — только кнопка со счётчиком */
export const MobileFiltersDrawer = (props: MobileFiltersDrawerProps) => {
    const { filters, activeCount, searchButton, canReset } = props;
    const [open, setOpen] = useState(false);

    // В режиме searchButton «Показать» применяет фильтры, иначе они уже применены
    const handleShow = () => {
        if (searchButton) props.onApplyFilters();
        setOpen(false);
    };

    return (
        <>
            <Badge count={activeCount} size="small" color="var(--color-brand)">
                <Button icon={<SlidersHorizontal className="size-4" />} onClick={() => setOpen(true)}>
                    Фильтры
                </Button>
            </Badge>

            <Drawer
                title="Фильтры"
                placement="bottom"
                height="auto"
                open={open}
                onClose={() => setOpen(false)}
                styles={{ body: { paddingBottom: 8 }, wrapper: { maxHeight: '85vh' } }}
                className="rounded-t-2xl"
                footer={
                    <div className="flex gap-2 py-1">
                        <Button className="flex-1" disabled={!canReset} onClick={props.onResetFilters}>
                            Сбросить
                        </Button>
                        <Button type="primary" className="flex-1" onClick={handleShow}>
                            Показать
                        </Button>
                    </div>
                }
            >
                <FilterFields filters={filters} layout="stacked" />
            </Drawer>
        </>
    );
};
