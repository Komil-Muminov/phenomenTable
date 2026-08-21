import { TableColumnType } from 'antd';
import React from 'react';
import { TableActions } from './TableActions';
import { CreateActionsColumnOptions } from './types';

/**
 * Хелпер для создания стандартной колонки действий в таблице Ant Design.
 *
 * @example
 * ```tsx
 * const columns = [
 *   { title: 'Имя', dataIndex: 'name' },
 *   createActionsColumn({
 *     onEdit: (record) => handleEdit(record),
 *     onDelete: async (record) => await handleDelete(record.id),
 *     actions: [
 *       {
 *         label: 'Копировать',
 *         icon: <CopyOutlined />,
 *         onClick: (record) => handleCopy(record),
 *       }
 *     ]
 *   })
 * ];
 * ```
 */
export function createActionsColumn<RecordType extends Record<string, any> = any>(
    options: CreateActionsColumnOptions<RecordType> = {},
): TableColumnType<RecordType> {
    const {
        title = 'Действия',
        key = 'actions',
        width = 160,
        fixed = 'right',
        align = 'center',
        actions,
        onView,
        onEdit,
        onDelete,
        deleteConfirm,
        mode = 'auto',
        maxVisibleButtons = 3,
        size = 'small',
        className,
        style,
        ...restColumnProps
    } = options;

    return {
        title,
        key,
        width,
        fixed,
        align,
        ...restColumnProps,
        render: (_: any, record: RecordType) => (
            <TableActions<RecordType>
                record={record}
                actions={actions}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                deleteConfirm={deleteConfirm}
                mode={mode}
                maxVisibleButtons={maxVisibleButtons}
                size={size}
                className={className}
                style={style}
            />
        ),
    };
}
