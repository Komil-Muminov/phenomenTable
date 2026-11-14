import { Badge, Button } from 'antd';
import { Download, RotateCcw, Search } from 'lucide-react';

import type { ReactNode } from 'react';

export interface ToolbarActionsProps {
    searchButton?: boolean;
    searchButtonText?: string;
    searchButtonIcon?: ReactNode;
    /** Есть введённые, но не применённые фильтры */
    hasPending?: boolean;
    canReset: boolean;
    isLoading: boolean;
    onApplyFilters: () => void;
    onResetFilters: () => void;
    showDownloadBtn?: boolean;
    downloadPending?: boolean;
    onDownload?: () => void;
}

const ICON = 'size-4';

/** Кнопки тулбара: «Поиск» — главное действие, «Сбросить» и «Скачать» — второстепенные */
export const ToolbarActions = (props: ToolbarActionsProps) => {
    const { searchButton, hasPending, canReset, isLoading, showDownloadBtn, onDownload } = props;

    return (
        <div className="flex items-center gap-2">
            {searchButton && (
                <Badge dot={hasPending} offset={[-4, 4]}>
                    <Button
                        type="primary"
                        icon={props.searchButtonIcon ?? <Search className={ICON} />}
                        loading={isLoading}
                        onClick={props.onApplyFilters}
                    >
                        {props.searchButtonText ?? 'Поиск'}
                    </Button>
                </Badge>
            )}

            <Button
                type="text"
                icon={<RotateCcw className={ICON} />}
                disabled={!canReset || isLoading}
                onClick={props.onResetFilters}
            >
                Сбросить
            </Button>

            {showDownloadBtn && onDownload && (
                <Button icon={<Download className={ICON} />} loading={props.downloadPending} onClick={onDownload}>
                    Скачать
                </Button>
            )}
        </div>
    );
};
