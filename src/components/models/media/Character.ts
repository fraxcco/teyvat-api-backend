import mongoose from "mongoose";
import { ICharacter } from "../../interfaces/";
import { CharacterRarity, CharacterRegion, CharacterElement, CharacterWeaponType, CharacterAscensionStatType } from "../../enums/";

const RARITY_VALUES = Object.values(CharacterRarity).filter((value) => typeof value === "number");
const REGION_VALUES = Object.values(CharacterRegion).filter((value) => typeof value === "string");
const ELEMENT_VALUES = Object.values(CharacterElement).filter((value) => typeof value === "string");
const WEAPON_TYPE_VALUES = Object.values(CharacterWeaponType).filter((value) => typeof value === "string");
const ASCENSION_STAT_VALUES = Object.values(CharacterAscensionStatType).filter((value) => typeof value === "string");

const createTalentSchema = (type: "basic" | "full"): Record<string, unknown> => {
    const schema: Record<string, unknown> = { name: { type: String }, description: { type: String } };

    if(type === "full") {
        schema.energyCost = { type: Number };
        schema.cooldown = { type: Number };
        schema.duration = { type: Number };
    }

    return schema;
};

const CharacterSchema = new mongoose.Schema<ICharacter>({
    id: { type: String, required: true, lowercase: true },
    name: { type: String, required: true },
    rarity: { type: Number, enum: RARITY_VALUES, required: true },
    region: { type: String, enum: REGION_VALUES, required: true },
    element: { type: String, enum: ELEMENT_VALUES, required: true },
    weaponType: { type: String, enum: WEAPON_TYPE_VALUES, required: true },
    versionAdded: { type: String, required: true },
    releaseDate: { type: Date, required: true, set: (value: unknown) => (value ? new Date(value as string) : value), max: new Date() },
    constellations: [{
        level: { type: Number, required: true, min: 0, max: 6 },
        name: { type: String, required: true },
        description: { type: String, required: true }
    }],
    stats: {
        baseHP: { type: Number, required: true, min: 0 },
        baseATK: { type: Number, required: true, min: 0 },
        baseDEF: { type: Number, required: true, min: 0 },
        ascensionStats: ASCENSION_STAT_VALUES.reduce((schema, statType) => {
            schema[statType] = { type: Number };

            return schema;
        }, {} as Record<string, unknown>)
    },
    talents: {
        normalAttack: createTalentSchema("basic"),
        chargedAttack: createTalentSchema("basic"),
        plungingAttack: createTalentSchema("basic"),
        elementalSkill: createTalentSchema("full"),
        elementalBurst: createTalentSchema("full")
    }
}, { versionKey: false });

CharacterSchema.index({ name: "text" });
CharacterSchema.index({ id: 1 }, { unique: true });
CharacterSchema.index({ name: 1 }, { collation: { locale: "en", strength: 2 } });
CharacterSchema.index({ rarity: 1 });
CharacterSchema.index({ region: 1 });
CharacterSchema.index({ element: 1 });
CharacterSchema.index({ weaponType: 1 });
CharacterSchema.index({ releaseDate: -1 });
CharacterSchema.index({ versionAdded: 1 });

export default mongoose.model<ICharacter>("Character", CharacterSchema);