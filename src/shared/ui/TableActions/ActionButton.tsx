import { Button, Popconfirm, Tooltip, type ButtonProps } from 'antd';

import type { ResolvedAction } from './buildActions';

interface ActionButtonProps<RecordType> {
    item: ResolvedAction<RecordType>;
    size: ButtonProps['size'];
    loading: boolean;
    iconOnly?: boolean;
    onRun: (event?: React.MouseEvent) => void;
}

const stop = (event?: React.MouseEvent<HTMLElement>) => event?.stopPropagation();

/** Кнопка действия: с тултипом и подтверждением, если они заданы */
export function ActionButton<RecordType>({ item, size, loading, iconOnly, onRun }: ActionButtonProps<RecordType>) {
    const { action, disabled, confirm } = item;
    // Иконка без подписи — подпись уезжает в тултип и aria-label
    const compact = Boolean(iconOnly && action.icon);
    const tooltip = item.tooltip ?? (compact ? action.label : undefined);
    const ariaLabel = compact && typeof action.label === 'string' ? action.label : undefined;

    let element = (
        <Button
            size={size}
            type={action.type ?? 'text'}
            danger={action.danger}
            disabled={disabled}
            loading={loading}
            icon={action.icon}
            aria-label={ariaLabel}
            className={compact ? 'flex size-8 items-center justify-center p-0' : 'flex items-center gap-1 text-xs'}
            onClick={(event) => {
                stop(event);
                if (!confirm) onRun(event);
            }}
        >
            {compact ? null : action.label}
        </Button>
    );

    if (tooltip) element = <Tooltip title={tooltip}>{element}</Tooltip>;

    if (!confirm || disabled) return element;

    return (
        <Popconfirm
            title={confirm.title}
            description={confirm.description}
            okText={confirm.okText ?? 'Да'}
            cancelText={confirm.cancelText ?? 'Отмена'}
            okButtonProps={{ danger: confirm.okType === 'danger' }}
            placement={confirm.placement ?? 'topRight'}
            onConfirm={(event) => {
                stop(event);
                onRun();
            }}
            onCancel={stop}
        >
            <span onClick={stop}>{element}</span>
        </Popconfirm>
    );
}
