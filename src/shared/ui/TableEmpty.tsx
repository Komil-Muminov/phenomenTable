import { Button } from 'antd';
import { Inbox, SearchX } from 'lucide-react';

interface TableEmptyProps {
    /** Пусто из-за фильтров — предлагаем их сбросить */
    filtered: boolean;
    onResetFilters?: () => void;
}

/** Пустое состояние таблицы и карточек: объясняет причину и даёт выход */
export const TableEmpty = ({ filtered, onResetFilters }: TableEmptyProps) => {
    const Icon = filtered ? SearchX : Inbox;

    return (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <span className="mb-1 flex size-11 items-center justify-center rounded-xl bg-surface-muted text-ink-muted ring-1 ring-line">
                <Icon className="size-5" strokeWidth={1.75} />
            </span>
            <p className="m-0 text-sm font-semibold text-ink">{filtered ? 'Ничего не найдено' : 'Записей пока нет'}</p>
            <p className="m-0 max-w-xs text-[13px] text-ink-muted">
                {filtered
                    ? 'Под выбранные фильтры не подошла ни одна запись. Попробуйте ослабить условия.'
                    : 'Когда появятся данные, они отобразятся здесь.'}
            </p>
            {filtered && onResetFilters && (
                <Button className="mt-2" onClick={onResetFilters}>
                    Сбросить фильтры
                </Button>
            )}
        </div>
    );
};
