type EnvKey = keyof ImportMetaEnv;

/** Читает переменную окружения; если её нет — предупреждает и отдаёт дефолт */
export const getEnvVar = (key: EnvKey, defaultValue = ''): string => {
    const value = import.meta.env[key];
    if (value === undefined || value === '') {
        console.warn(`[env] Переменная ${String(key)} не задана, использую "${defaultValue}"`);
        return defaultValue;
    }
    return String(value);
};

export const ENV = {
    IS_DEV: import.meta.env.DEV,
    IS_PROD: import.meta.env.PROD,
    API_URL: getEnvVar('VITE_API_URL'),
};
