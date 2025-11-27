export const removeMongoID = <T>(input: T): T => {
    if(input === null || input === undefined) return input;
    if(input instanceof Date) return input;

    if(Array.isArray(input)) {
        return input.map((item) => removeMongoID(item)) as unknown as T;
    }

    if(typeof input === "object") {
        const clean: Record<string, unknown> = {};
        
        Object.entries(input as Record<string, unknown>).forEach(([key, value]) => {
            if(key === "_id" || key === "__v") return;
            
            clean[key] = removeMongoID(value);
        });

        return clean as T;
    }

    return input;
};

export const normalizeDocumentId = <T extends Record<string, unknown>>(document: T, key: keyof T | string = "id"): T => {
    if(!document) return document;

    const value = document[key as keyof T];

    if(typeof value === "string") {
        return {
            ...document,
            [key]: value.toLowerCase(),
        } as T;
    }

    return document;
};