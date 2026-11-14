import { StyleProvider } from '@ant-design/cssinjs';
import { appTheme, queryClient } from '@shared/config';
import { Toaster } from '@shared/ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './index.css';

// Русская локаль для дат и строгий парсинг форматов в фильтрах
dayjs.extend(customParseFormat);
dayjs.locale('ru');

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Не найден контейнер #root');

createRoot(rootElement).render(
    <StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                {/* layer: стили antd уходят в @layer antd (порядок задан в index.css) */}
                <StyleProvider layer>
                    <ConfigProvider locale={ruRU} theme={appTheme}>
                        <App />
                        <Toaster />
                    </ConfigProvider>
                </StyleProvider>
            </QueryClientProvider>
        </BrowserRouter>
    </StrictMode>,
);
