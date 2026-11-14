import { Space } from 'antd';
import { useMemo } from 'react';

import { ActionButton } from './ActionButton';
import { ActionsDropdown } from './ActionsDropdown';
import { buildActions, DEFAULT_DELETE_CONFIRM, resolveActions } from './buildActions';
import { useActionRunner } from './useActionRunner';

import type { TableActionsProps } from './types';

/** Блок действий строки: кнопки в ряд, лишнее уезжает в меню «⋯» */
export function TableActions<RecordType>({
    record,
    actions,
    onView,
    onEdit,
    onDelete,
    deleteConfirm = DEFAULT_DELETE_CONFIRM,
    mode = 'auto',
    maxVisibleButtons = 3,
    iconOnly = true,
    size = 'small',
    className = '',
    style,
}: TableActionsProps<RecordType>) {
    const { run, isLoading } = useActionRunner(record);

    const items = useMemo(
        () => resolveActions(buildActions({ actions, onView, onEdit, onDelete, deleteConfirm }), record),
        [actions, onView, onEdit, onDelete, deleteConfirm, record],
    );

    if (items.length === 0) return null;

    // Сколько кнопок показать в ряд (одно место уходит под «⋯»)
    const safeMax = Math.max(1, Math.floor(maxVisibleButtons) || 1);
    const directCount =
        mode === 'dropdown' ? 0 : mode === 'buttons' || items.length <= safeMax ? items.length : safeMax - 1;

    const direct = items.slice(0, directCount);
    const overflow = items.slice(directCount);

    return (
        <div
            className={`flex items-center gap-1.5 ${className}`}
            style={style}
            onClick={(event) => event.stopPropagation()}
        >
            <Space size={4}>
                {direct.map((item) => (
                    <ActionButton<RecordType>
                        key={item.key}
                        item={item}
                        size={size}
                        loading={isLoading(item.key)}
                        iconOnly={iconOnly}
                        onRun={(event) => void run(item.action, item.key, event)}
                    />
                ))}
                {overflow.length > 0 && (
                    <ActionsDropdown<RecordType>
                        items={overflow}
                        size={size}
                        isLoading={isLoading}
                        onRun={(item) => run(item.action, item.key)}
                    />
                )}
            </Space>
        </div>
    );
}
