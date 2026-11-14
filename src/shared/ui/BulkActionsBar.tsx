import { Button } from 'antd';
import { X } from 'lucide-react';
import { useMemo } from 'react';

import { ActionButton, resolveActions, useActionRunner, type BulkActionItem } from './TableActions';

interface BulkActionsBarProps<RecordType> {
    selectedRows: RecordType[];
    selectedCount: number;
    actions: BulkActionItem<RecordType>[];
    onClear: () => void;
}

// «1 запись», «3 записи», «5 записей»
const pluralRecords = (count: number) => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return 'запись';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'записи';
    return 'записей';
};

/**
 * Плавающая панель массовых действий. Висит над контентом снизу,
 * поэтому её появление не сдвигает таблицу.
 */
export function BulkActionsBar<RecordType>({
    selectedRows,
    selectedCount,
    actions,
    onClear,
}: BulkActionsBarProps<RecordType>) {
    const { run, isLoading } = useActionRunner(selectedRows);
    const items = useMemo(() => resolveActions(actions, selectedRows), [actions, selectedRows]);

    if (selectedCount === 0) return null;

    const handleRun = async (item: (typeof items)[number]) => {
        const ok = await run(item.action, item.key);
        if (ok && !(item.action as BulkActionItem<RecordType>).keepSelection) onClear();
    };

    return (
        <div
            role="region"
            aria-label="Действия с выбранными записями"
            className="bulk-bar fixed inset-x-4 bottom-4 z-[1000] mx-auto flex max-w-2xl flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-line bg-surface px-4 py-2.5 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.3)]"
        >
            <span className="text-sm text-ink" aria-live="polite">
                Выбрано <span className="font-semibold">{selectedCount}</span> {pluralRecords(selectedCount)}
            </span>

            <div className="ml-auto flex flex-wrap items-center gap-1">
                {items.map((item) => (
                    <ActionButton<RecordType[]>
                        key={item.key}
                        item={item}
                        size="middle"
                        loading={isLoading(item.key)}
                        onRun={() => void handleRun(item)}
                    />
                ))}
                <Button type="text" aria-label="Снять выделение" icon={<X className="size-4" />} onClick={onClear} />
            </div>
        </div>
    );
}
