import { escapeRegex } from "./escapeRegex";

export const applyExactMatchFilter = <TFilter extends Record<string, unknown>>(target: TFilter, field: keyof TFilter | string, raw?: unknown): void => {
    if(typeof raw !== "string") return;

    const value = raw.trim();
    if(!value) return;

    const pattern = `^${escapeRegex(value)}$`;

    target[field as keyof TFilter] = { $regex: new RegExp(pattern, "i") } as never;
};