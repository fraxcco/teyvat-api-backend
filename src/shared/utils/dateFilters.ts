export const applyDateLikeFilter = <T>(filter: Record<string, unknown>, field: keyof T, value: unknown) => {
    if(value === undefined || value === null || value === "") return;

    const stringValue = String(value).trim();
    if(!stringValue) return;

    const parsed = new Date(stringValue);
    
    if(!Number.isNaN(parsed.getTime())) {
        const start = new Date(parsed);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(parsed);
        end.setHours(23, 59, 59, 999);
        
        filter[field as string] = { $gte: start, $lte: end };

        return;
    }

    filter[field as string] = { $regex: new RegExp(`^${stringValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") };
};