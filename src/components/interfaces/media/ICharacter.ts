import { CharacterRarity, CharacterRegion, CharacterElement, CharacterWeaponType, CharacterAscensionStatType } from "../../enums/";
import { Document } from "mongoose";

export interface ICharacter extends Document {
    id: string;
    name: string;
    rarity: CharacterRarity;
    region: CharacterRegion;
    element: CharacterElement;
    weaponType: CharacterWeaponType;
    versionAdded: string;
    releaseDate: Date;
    constellations: Array<{
        level: number;
        name: string;
        description: string;
    }>;
    stats: {
        baseHP: number;
        baseATK: number;
        baseDEF: number;
        ascensionStats: Record<CharacterAscensionStatType, number>;
    },
    talents: {
        normalAttack: {
            name: string;
            description: string;
            energyCost?: number;
            duration?: number;
            cooldown?: number;
        },
        elementSkill: {
            name: string;
            description: string;
            energyCost: number;
            duration: number;
            cooldown: number;
        },
        elementalBurst: {
            name: string;
            description: string;
            energyCost: number;
            duration: number;
            cooldown: number;
        }
    },
};