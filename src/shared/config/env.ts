export const getEnvVar = (key: string, defaultValue: string | number = '') => {
    if (import.meta && import.meta.env[key] === undefined) {
        console.error(`Env variable ${key} is required`);
        return defaultValue;
    }

    return import.meta.env[key] || defaultValue;
};

export const ENV = {
    IS_DEV: getEnvVar('VITE_MODE') === 'development',
    IS_PROD: getEnvVar('VITE_MODE') === 'production',
    API_URL: getEnvVar('VITE_API_URL'),
};
