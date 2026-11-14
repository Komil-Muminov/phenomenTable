import { Edit3, Eye, Trash2 } from 'lucide-react';

import type { ActionConfirmConfig, TableActionItem, TableActionsProps } from './types';

export const DEFAULT_DELETE_CONFIRM: ActionConfirmConfig = {
    title: 'Удалить эту запись?',
    description: 'Это действие невозможно будет отменить.',
    okText: 'Да, удалить',
    cancelText: 'Отмена',
    okType: 'danger',
};

const ICON_CLASS = 'size-4';

type PresetSource<RecordType> = Pick<TableActionsProps<RecordType>, 'actions' | 'onView' | 'onEdit' | 'onDelete'> & {
    deleteConfirm: ActionConfirmConfig;
};

/** Собирает итоговый список: просмотр → редактирование → кастомные → удаление */
export const buildActions = <RecordType,>({
    actions = [],
    onView,
    onEdit,
    onDelete,
    deleteConfirm,
}: PresetSource<RecordType>): TableActionItem<RecordType>[] => {
    const list: TableActionItem<RecordType>[] = [];

    if (onView) {
        list.push({ key: 'preset-view', label: 'Просмотр', icon: <Eye className={ICON_CLASS} />, onClick: onView });
    }
    if (onEdit) {
        list.push({
            key: 'preset-edit',
            label: 'Редактировать',
            icon: <Edit3 className={ICON_CLASS} />,
            onClick: onEdit,
        });
    }
    list.push(...actions);
    if (onDelete) {
        list.push({
            key: 'preset-delete',
            label: 'Удалить',
            icon: <Trash2 className={ICON_CLASS} />,
            danger: true,
            confirm: deleteConfirm,
            onClick: onDelete,
        });
    }

    return list;
};

// Поле может быть значением или функцией от записи
const resolve = <V, RecordType>(value: V | ((record: RecordType) => V), record: RecordType): V =>
    typeof value === 'function' ? (value as (record: RecordType) => V)(record) : value;

export interface ResolvedAction<RecordType> {
    action: TableActionItem<RecordType>;
    key: string;
    disabled: boolean;
    confirm?: ActionConfirmConfig;
    tooltip?: React.ReactNode;
}

/** Вычисляет состояние действий для конкретной записи и выкидывает скрытые */
export const resolveActions = <RecordType,>(
    actions: TableActionItem<RecordType>[],
    record: RecordType,
): ResolvedAction<RecordType>[] =>
    actions
        .filter((action) => !resolve(action.hidden ?? false, record))
        .map((action, index) => ({
            action,
            key: action.key ?? `action-${index}`,
            disabled: Boolean(resolve(action.disabled ?? false, record)),
            confirm: action.confirm ? resolve(action.confirm, record) : undefined,
            tooltip: action.tooltip !== undefined ? resolve(action.tooltip, record) : undefined,
        }));
