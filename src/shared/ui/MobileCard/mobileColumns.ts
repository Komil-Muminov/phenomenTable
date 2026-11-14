import type { TableColumnsType } from 'antd';

type Column<RecordType> = TableColumnsType<RecordType>[number] & { dataIndex?: unknown };

const columnId = (col: { key?: unknown; dataIndex?: unknown }) => {
    const { key, dataIndex } = col;
    if (key !== undefined && key !== null) return String(key);
    return Array.isArray(dataIndex) ? dataIndex.join('.') : String(dataIndex ?? '');
};

const titleText = (col: { title?: unknown }) => (typeof col.title === 'string' ? col.title.toLowerCase() : '');

const ACTION_TITLES = ['действие', 'действия', 'action'];
const PRIMARY_KEYS = ['title', 'name', 'id'];
const PRIMARY_TITLES = ['название', 'наименование', 'номер'];

const isActionColumn = (col: Column<unknown>) => {
    const id = columnId(col).toLowerCase();
    return ACTION_TITLES.some((word) => titleText(col).includes(word)) || id.includes('action') || id === 'operations';
};

const isPrimaryColumn = (col: Column<unknown>, primaryKey?: string) => {
    if (primaryKey) return columnId(col) === primaryKey;
    const id = columnId(col).toLowerCase();
    const title = titleText(col);
    return PRIMARY_KEYS.includes(id) || title === 'id' || PRIMARY_TITLES.some((word) => title.includes(word));
};

/** Раскладывает колонки по зонам карточки: заголовок, тело, действия */
export const splitMobileColumns = <RecordType>(
    columns: TableColumnsType<RecordType>,
    primaryKey?: string,
    hiddenKeys: string[] = [],
) => {
    const visible = (columns as Column<RecordType>[]).filter((col) => !hiddenKeys.includes(columnId(col)));
    const actions = visible.filter((col) => isActionColumn(col as Column<unknown>));
    const rest = visible.filter((col) => !actions.includes(col));
    const primary = rest.find((col) => isPrimaryColumn(col as Column<unknown>, primaryKey)) ?? rest[0];
    const body = rest.filter((col) => col !== primary);

    return { primary, body, actions };
};

export { columnId };
export type { Column as MobileColumn };
