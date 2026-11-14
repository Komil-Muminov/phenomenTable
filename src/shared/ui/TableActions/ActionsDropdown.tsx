import { Button, Dropdown, Modal, type ButtonProps, type MenuProps } from 'antd';
import { MoreHorizontal } from 'lucide-react';

import type { ResolvedAction } from './buildActions';

interface ActionsDropdownProps<RecordType> {
    items: ResolvedAction<RecordType>[];
    size: ButtonProps['size'];
    isLoading: (key: string) => boolean;
    onRun: (item: ResolvedAction<RecordType>) => Promise<void>;
}

/**
 * Меню «⋯» для действий, не влезших в строку.
 * Подтверждение — через модалку: Popconfirm внутри пункта меню исчезает вместе с меню.
 */
export function ActionsDropdown<RecordType>({ items, size, isLoading, onRun }: ActionsDropdownProps<RecordType>) {
    const [modal, contextHolder] = Modal.useModal();

    const handleSelect = (item: ResolvedAction<RecordType>) => {
        const { confirm } = item;
        if (!confirm) {
            void onRun(item);
            return;
        }
        modal.confirm({
            title: confirm.title,
            content: confirm.description,
            okText: confirm.okText ?? 'Да',
            cancelText: confirm.cancelText ?? 'Отмена',
            okButtonProps: { danger: confirm.okType === 'danger' },
            // Модалка сама покажет лоадер, пока промис не завершится
            onOk: () => onRun(item),
        });
    };

    const menuItems: MenuProps['items'] = items.map((item) => ({
        key: item.key,
        label: item.tooltip ? (
            <span title={typeof item.tooltip === 'string' ? item.tooltip : undefined}>{item.action.label}</span>
        ) : (
            item.action.label
        ),
        icon: item.action.icon,
        danger: item.action.danger,
        disabled: item.disabled || isLoading(item.key),
        onClick: (info) => {
            info.domEvent.stopPropagation();
            handleSelect(item);
        },
    }));

    return (
        <>
            {contextHolder}
            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                <Button
                    size={size}
                    type="text"
                    aria-label="Ещё действия"
                    loading={items.some((item) => isLoading(item.key))}
                    icon={<MoreHorizontal className="h-4 w-4 text-gray-500" />}
                    className="flex items-center justify-center p-1"
                    onClick={(event) => event.stopPropagation()}
                />
            </Dropdown>
        </>
    );
}
