import { useCallback } from 'react';

import { toast } from '../../ui/Toast';

import { useMutationQuery } from './useMutationQuery';

import type { IDownloadButton } from '@shared/model';

interface IDownloadResponse {
    url?: string;
}

const DEFAULT_FILE_NAME = 'report.xlsx';

/** Скачивает файл по ссылке через временный <a download> */
export const downloadFile = (url: string, fileName: string) => {
    try {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error('Ошибка при скачивании файла:', error);
        toast.error('Не удалось начать скачивание файла');
    }
};

// Имя файла может прийти в query-параметре fileName ссылки
const resolveFileName = (url: string, fallback: string): string => {
    const match = url.match(/[?&]fileName=([^&]+)/);
    if (!match?.[1]) return fallback;
    try {
        return decodeURIComponent(match[1].replace(/\+/g, ' '));
    } catch {
        return fallback;
    }
};

/** Логика скачивания отчёта: POST с текущими фильтрами → ссылка на файл */
export const useTableDownload = ({ downloadButton }: { downloadButton?: IDownloadButton }) => {
    const url = downloadButton?.url ?? '';

    const { mutateAsync, isPending: downloadPending } = useMutationQuery<object, IDownloadResponse>({
        url,
        method: 'POST',
        messages: downloadButton?.messages,
    });

    const handleDownload = useCallback(
        async (filters: Record<string, unknown>, extraPayload?: object) => {
            if (!url) {
                toast.error('URL для скачивания не указан');
                return;
            }

            try {
                const response = await mutateAsync({ ...extraPayload, filters });
                if (!response?.url) {
                    toast.error('Не удалось получить ссылку на файл');
                    return;
                }
                downloadFile(
                    response.url,
                    resolveFileName(response.url, downloadButton?.fileName ?? DEFAULT_FILE_NAME),
                );
            } catch {
                // Ошибку уже показал useMutationQuery
            }
        },
        [url, mutateAsync, downloadButton?.fileName],
    );

    return { handleDownload, downloadPending };
};
