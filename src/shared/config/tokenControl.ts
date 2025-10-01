const ACCESS_TOKEN_KEY = 'zudbar/accessToken';
const ACCESS_TOKEN_EXPIRE_KEY = 'zudbar/accessTokenExpire';
const REFRESH_TOKEN_KEY = 'zudbar/refreshToken';
const ROLE_ID_KEY = 'zudbar/roleId';
const USER_ID = 'zudbar/userId';
const USER_LOGIN = 'zudbar/userLogin';
const ORG_ICON = 'orgIcon';

interface IToken {
    accessToken: string;
    refreshToken?: string;
    expireTime?: number;
}

export const tokenControl = {
    set: ({ accessToken, refreshToken, expireTime }: IToken) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken || '');
        if (expireTime) {
            localStorage.setItem(ACCESS_TOKEN_EXPIRE_KEY, String(Date.now() + (expireTime || 0) * 1000));
        }
    },
    get: () => {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },
    isExpired: () => {
        const expireTime = localStorage.getItem(ACCESS_TOKEN_EXPIRE_KEY);
        if (expireTime) {
            return Date.now() > Number(expireTime);
        }
        return false;
    },
    setRoleId: (roleId: any) => {
        localStorage.setItem(ROLE_ID_KEY, roleId);
    },

    getRoleId: () => {
        return localStorage.getItem(ROLE_ID_KEY);
    },

    setLogin: (login: string | number) => {
        localStorage.setItem(USER_LOGIN, String(login));
    },
    getLogin: () => {
        return localStorage.getItem(USER_LOGIN);
    },
    setOrgIcon: (orgIcon: any) => {
        localStorage.setItem(ORG_ICON, orgIcon);
    },

    getOrgIcon: () => {
        return localStorage.getItem(ORG_ICON);
    },

    remove: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(ROLE_ID_KEY);
    },

    setUserId: (userId: any) => {
        localStorage.setItem(USER_ID, userId);
    },
    getUserId: () => {
        return localStorage.getItem(USER_ID);
    },
};
