export const getEnv = (key: string, def?: string) => {
    const value = process.env[key];

    if(value === undefined || value === "") {
        if(def !== undefined) return def;
        throw new Error(`Environment variable ${key} is not set.`);
    }

    return value;
};

export const getEnvNumber = (key: string, def?: number) => {
    const value = process.env[key];
    const number = value !== undefined && value !== "" ? Number(value) : def;

    if(number === undefined || isNaN(number)) {
        throw new Error(`Environment variable ${key} is not set or is not a valid number.`);
    }

    return number;
};