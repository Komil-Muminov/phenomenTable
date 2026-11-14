// Все ключи хранилища под одним префиксом — проще чистить и не пересекаться с чужими данными
const STORAGE_PREFIX = 'phenomen';

const KEYS = {
    accessToken: `${STORAGE_PREFIX}/accessToken`,
    accessTokenExpire: `${STORAGE_PREFIX}/accessTokenExpire`,
    refreshToken: `${STORAGE_PREFIX}/refreshToken`,
    roleId: `${STORAGE_PREFIX}/roleId`,
    userId: `${STORAGE_PREFIX}/userId`,
    userLogin: `${STORAGE_PREFIX}/userLogin`,
    orgIcon: `${STORAGE_PREFIX}/orgIcon`,
} as const;

interface IToken {
    accessToken: string;
    refreshToken?: string;
    /** Время жизни токена в секундах */
    expireTime?: number;
}

type StorableValue = string | number | null | undefined;

// localStorage может бросить (приватный режим, переполнение) — не роняем приложение
const read = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

const write = (key: string, value: StorableValue) => {
    try {
        if (value === null || value === undefined || value === '') localStorage.removeItem(key);
        else localStorage.setItem(key, String(value));
    } catch {
        /* хранилище недоступно — молча пропускаем */
    }
};

export const tokenControl = {
    set: ({ accessToken, refreshToken, expireTime }: IToken) => {
        write(KEYS.accessToken, accessToken);
        write(KEYS.refreshToken, refreshToken);
        const isValidExpire = typeof expireTime === 'number' && Number.isFinite(expireTime) && expireTime > 0;
        write(KEYS.accessTokenExpire, isValidExpire ? Date.now() + expireTime * 1000 : null);
    },
    get: () => read(KEYS.accessToken),
    getRefresh: () => read(KEYS.refreshToken),
    isExpired: () => {
        const expireAt = Number(read(KEYS.accessTokenExpire));
        return expireAt > 0 && Date.now() > expireAt;
    },

    setRoleId: (roleId: StorableValue) => write(KEYS.roleId, roleId),
    getRoleId: () => read(KEYS.roleId),
    setUserId: (userId: StorableValue) => write(KEYS.userId, userId),
    getUserId: () => read(KEYS.userId),
    setLogin: (login: StorableValue) => write(KEYS.userLogin, login),
    getLogin: () => read(KEYS.userLogin),
    setOrgIcon: (orgIcon: StorableValue) => write(KEYS.orgIcon, orgIcon),
    getOrgIcon: () => read(KEYS.orgIcon),

    /** Полный логаут: чистим все ключи сессии */
    remove: () => Object.values(KEYS).forEach((key) => write(key, null)),
};
