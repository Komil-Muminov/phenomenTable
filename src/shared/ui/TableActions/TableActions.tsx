import React, { useState } from 'react';
import { Button, Dropdown, MenuProps, Popconfirm, Space, Tooltip } from 'antd';
import { Edit3, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import { TableActionItem, TableActionsProps } from './types';

export function TableActions<RecordType extends Record<string, any> = any>({
    record,
    actions = [],
    onView,
    onEdit,
    onDelete,
    deleteConfirm = {
        title: 'Удалить эту запись?',
        description: 'Это действие невозможно будет отменить.',
        okText: 'Да, удалить',
        cancelText: 'Отмена',
        okType: 'danger',
    },
    mode = 'auto',
    maxVisibleButtons = 3,
    size = 'small',
    className = '',
    style,
}: TableActionsProps<RecordType>) {
    // Хранение состояния loading для каждого действия по ключу/индексу
    const [loadingKeys, setLoadingKeys] = useState<Record<string, boolean>>({});

    // Формируем объединенный список действий
    const combinedActions: TableActionItem<RecordType>[] = [];

    if (onView) {
        combinedActions.push({
            key: 'preset-view',
            label: 'Просмотр',
            icon: <Eye className="w-3.5 h-3.5" />,
            type: 'text',
            onClick: onView,
        });
    }

    if (onEdit) {
        combinedActions.push({
            key: 'preset-edit',
            label: 'Редактировать',
            icon: <Edit3 className="w-3.5 h-3.5" />,
            type: 'text',
            onClick: onEdit,
        });
    }

    if (actions && actions.length > 0) {
        combinedActions.push(...actions);
    }

    if (onDelete) {
        combinedActions.push({
            key: 'preset-delete',
            label: 'Удалить',
            icon: <Trash2 className="w-3.5 h-3.5" />,
            danger: true,
            type: 'text',
            confirm: deleteConfirm,
            onClick: onDelete,
        });
    }

    // Фильтруем скрытые действия
    const visibleActions = combinedActions.filter((action) => {
        if (typeof action.hidden === 'function') {
            return !action.hidden(record);
        }
        return !action.hidden;
    });

    if (visibleActions.length === 0) {
        return null;
    }

    const executeAction = async (action: TableActionItem<RecordType>, key: string, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        if (!action.onClick) return;

        try {
            const result = action.onClick(record, e);
            if (result && typeof result.then === 'function') {
                setLoadingKeys((prev) => ({ ...prev, [key]: true }));
                await result;
            }
        } finally {
            setLoadingKeys((prev) => ({ ...prev, [key]: false }));
        }
    };

    // Определение кнопок и элементов для dropdown
    const renderActionBtn = (action: TableActionItem<RecordType>, index: number) => {
        const actionKey = action.key || `action-${index}`;
        const isDisabled = typeof action.disabled === 'function' ? action.disabled(record) : !!action.disabled;
        const isLoading = !!loadingKeys[actionKey];

        const confirmConfig =
            typeof action.confirm === 'function' ? action.confirm(record) : action.confirm;

        const buttonElement = (
            <Button
                key={actionKey}
                size={size}
                type={action.type || 'text'}
                danger={action.danger}
                disabled={isDisabled}
                loading={isLoading}
                icon={action.icon}
                className="flex items-center gap-1 text-xs"
                onClick={(e) => {
                    e.stopPropagation();
                    if (!confirmConfig) {
                        executeAction(action, actionKey, e);
                    }
                }}
            >
                {action.label}
            </Button>
        );

        const wrappedWithTooltip = action.tooltip ? (
            <Tooltip key={`tooltip-${actionKey}`} title={action.tooltip}>
                {buttonElement}
            </Tooltip>
        ) : (
            buttonElement
        );

        if (confirmConfig) {
            return (
                <Popconfirm
                    key={`confirm-${actionKey}`}
                    title={confirmConfig.title}
                    description={confirmConfig.description}
                    okText={confirmConfig.okText || 'Да'}
                    cancelText={confirmConfig.cancelText || 'Отмена'}
                    okButtonProps={{ danger: confirmConfig.okType === 'danger' }}
                    placement={confirmConfig.placement || 'topRight'}
                    onConfirm={(e) => {
                        e?.stopPropagation();
                        executeAction(action, actionKey);
                    }}
                    onCancel={(e) => e?.stopPropagation()}
                >
                    <span onClick={(e) => e.stopPropagation()}>{wrappedWithTooltip}</span>
                </Popconfirm>
            );
        }

        return wrappedWithTooltip;
    };

    const isDropdownOnly = mode === 'dropdown';
    const isAutoWithOverflow =
        mode === 'auto' && visibleActions.length > maxVisibleButtons;

    if (isDropdownOnly || isAutoWithOverflow) {
        const directButtonsCount = isDropdownOnly ? 0 : maxVisibleButtons - 1;
        const directButtons = visibleActions.slice(0, directButtonsCount);
        const dropdownItems = visibleActions.slice(directButtonsCount);

        const menuItems: MenuProps['items'] = dropdownItems.map((action, index) => {
            const actionKey = action.key || `dropdown-action-${index}`;
            const isDisabled =
                typeof action.disabled === 'function'
                    ? action.disabled(record)
                    : !!action.disabled;
            const confirmConfig =
                typeof action.confirm === 'function'
                    ? action.confirm(record)
                    : action.confirm;

            return {
                key: actionKey,
                label: confirmConfig ? (
                    <Popconfirm
                        title={confirmConfig.title}
                        description={confirmConfig.description}
                        okText={confirmConfig.okText || 'Да'}
                        cancelText={confirmConfig.cancelText || 'Отмена'}
                        okButtonProps={{ danger: confirmConfig.okType === 'danger' }}
                        placement={confirmConfig.placement || 'topRight'}
                        onConfirm={(e) => {
                            e?.stopPropagation();
                            executeAction(action, actionKey);
                        }}
                        onCancel={(e) => e?.stopPropagation()}
                    >
                        <div
                            className="w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {action.label}
                        </div>
                    </Popconfirm>
                ) : (
                    <span>{action.label}</span>
                ),
                icon: action.icon,
                danger: action.danger,
                disabled: isDisabled,
                onClick: (info) => {
                    info.domEvent.stopPropagation();
                    if (!confirmConfig) {
                        executeAction(action, actionKey);
                    }
                },
            };
        });

        return (
            <div
                className={`flex items-center gap-1.5 ${className}`}
                style={style}
                onClick={(e) => e.stopPropagation()}
            >
                <Space size={4}>
                    {directButtons.map((action, idx) => renderActionBtn(action, idx))}
                    {dropdownItems.length > 0 && (
                        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                            <Button
                                size={size}
                                type="text"
                                icon={<MoreHorizontal className="w-4 h-4 text-gray-500" />}
                                className="flex items-center justify-center p-1"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </Dropdown>
                    )}
                </Space>
            </div>
        );
    }

    return (
        <div
            className={`flex items-center gap-1.5 ${className}`}
            style={style}
            onClick={(e) => e.stopPropagation()}
        >
            <Space size={4}>
                {visibleActions.map((action, idx) => renderActionBtn(action, idx))}
            </Space>
        </div>
    );
}
