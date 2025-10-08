import { useMemo } from 'react';
import { message } from 'antd';
import { IFilterItem, IDownloadButton } from '@shared/model';
import { useMutationQuery } from './useMutationQuery';
export const downloadFile = async (url: string, filename: string) => {
    try {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        console.error('Ошибка при скачивании файла:', e);
        message.error('Не удалось начать скачивание файла.');
    }
};

/**
 * Извлекает значения фильтров из параметров URL, применяя formatValue.
 */
export const useFilterValues = (params: Record<string, any>, filters: IFilterItem[]) => {
    // Массив зависимостей для useMemo
    const deps = filters?.map((filter) => params[filter.name]);

    return useMemo(
        () =>
            filters.reduce((acc, filter) => {
                const paramValue = params[filter.name];

                if (paramValue !== undefined) {
                    const value = filter.formatValue ? filter.formatValue(paramValue) : paramValue;

                    if (
                        value !== '' &&
                        value !== null &&
                        value !== undefined &&
                        (typeof value === 'number' || (Array.isArray(value) ? value.length > 0 : true))
                    ) {
                        acc[filter.name] = value;
                    }
                }
                return acc;
            }, {} as Record<string, any>),
        [...deps, filters],
    );
};

/**
 * Хук для управления логикой скачивания отчетов.
 */
export const useTableDownload = ({ downloadButton }: { downloadButton?: IDownloadButton }) => {
    const url = downloadButton?.url || '';

    // Используем реальный useMutationQuery
    const { mutateAsync: downloadMutate, isPending: downloadPending } = useMutationQuery({
        url,
        method: 'POST',
        messages: downloadButton?.messages,
    });

    const handleDownload = async (transformedFilters: Record<string, any>, extraPayload?: object) => {
        if (url === '') {
            message.error('URL для скачивания не указан');
            return;
        }

        const payload = { ...extraPayload, filters: transformedFilters, pageInfo: undefined };

        try {
            const response = await downloadMutate(payload);

            if (response && response.url !== undefined) {
                let fileName = downloadButton?.fileName || 'report.xlsx';
                const fileNameMatch = response.url.match(/[?&]fileName=([^&]+)/);

                // Извлекаем имя файла из URL, если оно там есть
                if (fileNameMatch && fileNameMatch[1]) {
                    fileName = decodeURIComponent(fileNameMatch[1].replace(/\+/g, ' '));
                }
                await downloadFile(response.url, fileName);
            } else {
                message.error('Не удалось получить URL файла');
            }
        } catch (err) {
            // Ошибка обработана в useMutationQuery
            console.error('Ошибка в handleDownload:', err);
        }
    };

    return { handleDownload, downloadPending };
};
