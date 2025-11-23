import mongoose from "mongoose";
import { ICharacter } from "../../interfaces/";
import { CharacterRarity, CharacterRegion, CharacterElement, CharacterWeaponType, CharacterAscensionStatType } from "../../enums/";

const RARITY_VALUES = Object.values(CharacterRarity).filter((value) => typeof value === "number");
const REGION_VALUES = Object.values(CharacterRegion).filter((value) => typeof value === "string");
const ELEMENT_VALUES = Object.values(CharacterElement).filter((value) => typeof value === "string");
const WEAPON_TYPE_VALUES = Object.values(CharacterWeaponType).filter((value) => typeof value === "string");
const ASCENSION_STAT_VALUES = Object.values(CharacterAscensionStatType).filter((value) => typeof value === "string");

const createAscensionStatsSchema = (): Record<string, any> => {
    return ASCENSION_STAT_VALUES.reduce((schema, statType) => {
        schema[statType] = { type: Number };

        return schema;
    }, {} as Record<string, any>);
};

const createTalentSchema = (type: "basic" | "full"): Record<string, any> => {
    const schema: Record<string, any> = {
        name: { type: String },
        description: { type: String }
    };

    if (type === "full") {
        schema.energyCost = { type: Number };
        schema.cooldown = { type: Number };
        schema.duration = { type: Number };
    };

    return schema;
};

const CharacterSchema = new mongoose.Schema<ICharacter>({
    id: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    rarity: { type: Number, enum: RARITY_VALUES, required: true },
    region: { type: String, enum: REGION_VALUES, required: true },
    element: { type: String, enum: ELEMENT_VALUES, required: true },
    weaponType: { type: String, enum: WEAPON_TYPE_VALUES, required: true },
    versionAdded: { type: String, required: true, trim: true },
    releaseDate: { type: Date, required: true, set: (value: unknown) => (value ? new Date(value as string) : value), max: new Date() },
    constellations: [{
        level: { type: Number, required: true, min: 0, max: 6 },
        name: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true }
    }],
    stats: {
        baseHP: { type: Number, required: true },
        baseATK: { type: Number, required: true },
        baseDEF: { type: Number, required: true },
        ascensionStats: createAscensionStatsSchema()
    },
    talents: {
        normalAttack: createTalentSchema("basic"),
        chargedAttack: createTalentSchema("basic"),
        plungingAttack: createTalentSchema("basic"),
        elementalSkill: createTalentSchema("full"),
        elementalBurst: createTalentSchema("full")
    }
}, {
    versionKey: false,
});

CharacterSchema.index({ name: "text", description: "text" });
CharacterSchema.index({ id: 1 }, { unique: true });
CharacterSchema.index({ region: 1 });
CharacterSchema.index({ element: 1 });
CharacterSchema.index({ weaponType: 1 });
CharacterSchema.index({ rarity: 1 });
CharacterSchema.pre("save", function (next) {
    const doc: any = this;
    if (doc.id) doc.id = String(doc.id).toLowerCase();
    next();
});

CharacterSchema.pre("findOneAndUpdate", function (next) {
    const update: any = this.getUpdate() || {};
    if (update.id) update.id = String(update.id).toLowerCase();
    if (update.$set && update.$set.id) update.$set.id = String(update.$set.id).toLowerCase();
    this.setUpdate(update);

    next();
});

export default mongoose.model<ICharacter>("Character", CharacterSchema);