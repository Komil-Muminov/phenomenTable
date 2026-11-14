import { Button, Popconfirm, Tooltip, type ButtonProps } from 'antd';

import type { ResolvedAction } from './buildActions';

interface ActionButtonProps<RecordType> {
    item: ResolvedAction<RecordType>;
    size: ButtonProps['size'];
    loading: boolean;
    onRun: (event?: React.MouseEvent) => void;
}

const stop = (event?: React.MouseEvent<HTMLElement>) => event?.stopPropagation();

/** Кнопка действия: с тултипом и подтверждением, если они заданы */
export function ActionButton<RecordType>({ item, size, loading, onRun }: ActionButtonProps<RecordType>) {
    const { action, disabled, confirm, tooltip } = item;

    let element = (
        <Button
            size={size}
            type={action.type ?? 'text'}
            danger={action.danger}
            disabled={disabled}
            loading={loading}
            icon={action.icon}
            className="flex items-center gap-1 text-xs"
            onClick={(event) => {
                stop(event);
                if (!confirm) onRun(event);
            }}
        >
            {action.label}
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
