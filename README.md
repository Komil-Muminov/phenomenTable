# PhenomenTable

Набор переиспользуемых компонентов на **React 18 + Ant Design 5 + TanStack Query**: таблица «под ключ», действия строк и собственные тосты.

## Быстрый старт

```bash
npm install
cp .env.example .env   # указать VITE_API_URL
npm run dev
```

| Скрипт              | Что делает                     |
| ------------------- | ------------------------------ |
| `npm run dev`       | dev-сервер Vite                |
| `npm run build`     | проверка типов + прод-сборка   |
| `npm run lint`      | ESLint                         |
| `npm run typecheck` | только `tsc`                   |
| `npm test`          | юнит-тесты (Vitest)            |

## Структура

```
src/
  shared/
    config/   axios, queryClient, env, tokenControl, роуты
    lib/      хуки запросов, URL-параметров, скачивания; getErrorMessage
    ui/       SmartTable, TableActions, Filter, MobileCard, SmartSelect, Toast
    utils/    форматирование дат
    model.ts  все публичные типы SmartTable
  demo/       данные и колонки для демо-страницы
```

## SmartTable

Минимум — `columns` и источник данных (`url` или `dataSource`). Всё остальное включается по мере надобности.

```tsx
<SmartTable<Order>
    url={ApiRoutes.ORDERS}            // POST { pageInfo, filters, ...queryParams } → { items, total }
    columns={columns}
    filters={[
        { type: FilterType.INPUT, name: 'search', placeholder: 'Поиск' },
        { type: FilterType.DATE_RANGE, name: 'period' }, // в URL: periodFrom / periodTo
    ]}
    viewModal                         // модалка просмотра по клику на строку
/>
```

### Пропсы

| Проп | Что делает |
| --- | --- |
| `url` / `dataSource` | Источник: запрос к API или статические данные (локальная пагинация) |
| `columns` | Колонки antd — **единственный обязательный** |
| `queryParams` | Доп. поля в тело каждого запроса |
| `adapter` | `{ getItems, getTotal, transformRequest, transformResponse }` — если ответ не `{ items, total }` |
| `localFilter` | Фильтрация `dataSource` текущими фильтрами |
| `paramsScope` | Префикс URL-параметров для нескольких таблиц на странице |
| `rowKey`, `rowClassName`, `expandable`, `onRowClick` | Строки |
| `selection` | `{ onChange, bulkActions, rowSelection }` — выделение и массовые действия |
| `filters`, `hideFilters` | Фильтры в шапке |
| `searchButton` | `true` или `{ text, icon }` — фильтры применяются по кнопке «Поиск» |
| `download` | `{ url, fileName, messages, payload }` — кнопка «Скачать» |
| `title`, `className` | Заголовок и класс таблицы |
| `view` | `{ idColumn, pagination, scrollX, stickyHeader, padded, virtual, toolbarClassName }` |
| `viewModal` | `true` или `{ title, columns, hideEmpty }` |
| `mobile` | Карточки на мобилке (включены): `false` или `{ breakpoint, primaryColumnKey, hiddenColumns, renderCard }` |
| `customRender` | Полностью свой рендер вместо таблицы |

Флаги в `view` положительные и по умолчанию `true` (кроме `virtual`): чтобы скрыть колонку ID — `view={{ idColumn: false }}`.

### Поведение

- **Фильтры и пагинация живут в URL** (без засорения истории).
- **Даты** ISO-формата в колонках без `render` отображаются как `дд.мм.гггг`; в обработчики уходят исходные данные.
- **Чипсы активных фильтров** под тулбаром — крестиком снимается один фильтр, «Сбросить все» — все.
- **Массовые действия** — плавающая панель «Выбрано N» снизу; выделение помнит строки с других страниц.
- **Закреплённая шапка** и отступ `sm:p-4` по умолчанию (`view.stickyHeader`, `view.padded`).
- **Пустые состояния** различают «записей нет» и «ничего не найдено» (с кнопкой сброса фильтров).
- **Мобилка** (`< 768px`) — карточки вместо таблицы, фильтры в нижней шторке за кнопкой «Фильтры (n)».

```tsx
selection={{
    bulkActions: [
        { key: 'export', label: 'Выгрузить', keepSelection: true, onClick: (rows) => exportRows(rows) },
        { key: 'delete', label: 'Удалить', danger: true, confirm: { title: 'Удалить выбранные?' }, onClick: removeRows },
    ],
}}
```

### Миграция со старых пропсов

| Было | Стало |
| --- | --- |
| `getItemsFromResponse`, `getTotalFromResponse`, `requestTransform`, `responseTransform` | `adapter={{ getItems, getTotal, transformRequest, transformResponse }}` |
| `handleRowClick` | `onRowClick` |
| `rowSelection`, `handleSelectionChange`, `bulkActions` | `selection={{ rowSelection, onChange, bulkActions }}` |
| `searchButton`, `searchButtonText`, `searchButtonIcon` | `searchButton={{ text, icon }}` (или просто `searchButton`) |
| `downloadButton`, `downloadPayload`, `showDownloadBtn` | `download={{ ...downloadButton, payload }}` — кнопка видна, если `download` задан |
| `idColumnHidden`, `hiddenPagination`, `disableScrollX` | `view={{ idColumn: false, pagination: false, scrollX: false }}` |
| `stickyHeader`, `padded`, `virtual`, `style` | `view={{ stickyHeader, padded, virtual, toolbarClassName }}` |
| `enableViewModal`, `viewModalTitle`, `viewModalColumns`, `viewModalHideEmpty` | `viewModal={{ title, columns, hideEmpty }}` |
| `enableMobileCards={false}` | `mobile={false}` |
| `mobileBreakpoint`, `primaryColumnKey`, `hiddenInMobileColumns`, `renderMobileCard` | `mobile={{ breakpoint, primaryColumnKey, hiddenColumns, renderCard }}` |

## Тема

Все цвета и шрифт — в одном файле `shared/config/tokens.ts`. Оттуда их берут:
- `theme.ts` → antd `ConfigProvider`;
- `tailwind.config.ts` (подключён в `index.css` через `@config`) → утилиты `bg-brand`, `text-ink-muted`, `border-line`… и CSS-переменные `--color-*`, `--font-sans`.

Старые переменные (`--text-primary`, `--background-secondary` и т.д.) сохранены для совместимости с исходными значениями (`LEGACY_CSS_VARS`, помечены `@deprecated`).
Стили antd вынесены в `@layer antd` (`StyleProvider layer`), а он стоит перед `utilities`, поэтому Tailwind-классы перекрывают antd **без `!important`**.

Шрифт Inter подключён локально (`@fontsource-variable/inter`) — внешних запросов к Google Fonts нет.

## TableActions

```tsx
createActionsColumn<Order>({
    onEdit,
    onDelete: async (row) => api.remove(row.id),   // подтверждение + лоадер из коробки
    actions: [{ key: 'copy', label: 'Копировать', onClick: copy, disabled: (row) => row.locked }],
    maxVisibleButtons: 3,                           // остальное уходит в меню «⋯»
});
```

Кнопки в строке — иконки с тултипом (`iconOnly`, по умолчанию `true`), подписи остаются в меню «⋯».
Ошибки из `onClick` (sync и async) ловятся и показываются тостом.

## Тосты

`<Toaster />` подключён в `main.tsx`. Вызывать можно откуда угодно, в том числе вне React:

```ts
import { toast } from '@shared/ui';

toast.success('Сохранено', { description: 'Запись #42 обновлена' });
toast.error('Не удалось загрузить');
toast.info('Висит, пока не закроют', { duration: 0 });
toast.loading('Загружаем…', { id: 'job' }); // тот же id → обновит тост
toast.promise(request, { loading: 'Формируем…', success: 'Готово', error: (e) => getErrorMessage(e) });
toast.dismiss(); // закрыть все
```

Таймер ставится на паузу при наведении, держится не больше 5 тостов, `prefers-reduced-motion` учитывается.
Ошибки запросов показываются автоматически (axios interceptor / `useMutationQuery`), без дублей.
