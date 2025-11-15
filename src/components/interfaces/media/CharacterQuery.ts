import { CharacterRarity, CharacterRegion, CharacterElement, CharacterWeaponType } from "../../enums";

export interface CharacterQueryDto {
    page?: number;
    limit?: number;
    name?: string;
    rarity?: CharacterRarity;
    region?: CharacterRegion;
    element?: CharacterElement;
    weaponType?: CharacterWeaponType;
    releaseDate?: string;
    versionAdded?: string;
    sortBy?: "name" | "rarity" | "region" | "element" | "weaponType" | "releaseDate" | "versionAdded";
    sortOrder?: "asc" | "desc";
}