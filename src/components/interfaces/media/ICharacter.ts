import { Document } from "mongoose";

export interface ICharacter extends Partial<Document> {
    id: string;
    name: string;
    rarity: 4 | 5;
    region: "Mondstadt" | "Liyue" | "Inazuma" | "Sumeru" | "Fontaine" | "Natlan" | "Nod-Krai" | "Snezhnaya" | "None";
    element: "Anemo" | "Geo" | "Electro" | "Dendro" | "Hydro" | "Pyro" | "Cryo" | "None";
    weaponType: "Sword" | "Polearm" | "Catalyst" | "Claymore" | "Bow";
    versionAdded: string;
    releaseDate: Date;
    constellations: Array<{ level: number; name: string; description: string; }>;
    stats: {
        baseHP: number;
        baseATK: number;
        baseDEF: number;
        ascensionStats: Partial<Record<"hpPercentage" | "attackPercentage" | "defensePercentage" | "elementalMastery" | "energyRecharge" | "healingBonus" | "critRate" | "critDMG" | "bonusDMG", number>>;
    },
    talents?: {
        normalAttack?: { name?: string; description?: string; };
        chargedAttack?: { name?: string; description?: string; };
        plungingAttack?: { name?: string; description?: string; };
        elementalSkill?: { name?: string; description?: string; duration?: number; cooldown?: number; };
        elementalBurst?: { name?: string; description?: string; energyCost?: number; duration?: number; cooldown?: number; }
    },
}