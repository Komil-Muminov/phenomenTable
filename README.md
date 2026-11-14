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

```tsx
<SmartTable<Order>
    url={ApiRoutes.ORDERS}            // POST { pageInfo, filters, ...queryParams } → { items, total }
    columns={columns}
    filters={[
        { type: FilterType.INPUT, name: 'search', placeholder: 'Поиск' },
        { type: FilterType.DATE_RANGE, name: 'period' }, // в URL: periodFrom / periodTo
    ]}
    enableViewModal
    handleSelectionChange={(keys, rows) => …}  // включает чекбоксы
/>
```

- **Фильтры и пагинация живут в URL** (без засорения истории). Несколько таблиц на странице — задайте `paramsScope`.
- **`dataSource`** — статические данные: запроса нет, пагинация локальная, фильтрация через `localFilter`.
- **`searchButton`** — фильтры применяются по кнопке «Поиск».
- **Даты** ISO-формата в колонках без `render` отображаются как `дд.мм.гггг`; в обработчики уходят исходные данные.
- **Мобилка** (`< 768px`) — карточки вместо таблицы (`enableMobileCards`, `primaryColumnKey`, `renderMobileCard`).

## TableActions

```tsx
createActionsColumn<Order>({
    onEdit,
    onDelete: async (row) => api.remove(row.id),   // подтверждение + лоадер из коробки
    actions: [{ key: 'copy', label: 'Копировать', onClick: copy, disabled: (row) => row.locked }],
    maxVisibleButtons: 3,                           // остальное уходит в меню «⋯»
});
```

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
