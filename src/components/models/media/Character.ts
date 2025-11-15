import mongoose from "mongoose";
import { TalentField } from "../../enums/";
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

const createTalentSchema = (isBasic: boolean = false): Record<string, any> => {
    return Object.values(TalentField).filter((value) => typeof value === "string").reduce((schema, field) => {
        if(field === TalentField.NAME || field === TalentField.DESCRIPTION) {
            schema[field] = { type: String, required: true };
        } else {
            schema[field] = { type: Number, required: !isBasic };
        };
    
        return schema;
    }, {} as Record<string, any>);
};

const CharacterSchema = new mongoose.Schema<ICharacter>({
    id: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 50 },
    rarity: { type: Number, enum: RARITY_VALUES, required: true },
    region: { type: String, enum: REGION_VALUES, required: true },
    element: { type: String, enum: ELEMENT_VALUES, required: true },
    weaponType: { type: String, enum: WEAPON_TYPE_VALUES, required: true },
    versionAdded: { type: String, required: true, trim: true, match: /^\d+\.\d+$/ },
    releaseDate: { type: Date, required: true, set: (value: unknown) => (value ? new Date(value as string) : value), max: new Date() },
    constellations: [{
        level: { type: Number, required: true, min: 0, max: 6 },
        name: { type: String, required: true, trim: true, maxlength: 100 },
        description: { type: String, required: true, trim: true, maxlength: 500 }
    }],
    stats: {
        baseHP: { type: Number, required: true, min: 0 },
        baseATK: { type: Number, required: true, min: 0 },
        baseDEF: { type: Number, required: true, min: 0 },
        ascensionStats: createAscensionStatsSchema()
    },
    talents: {
        normalAttack: createTalentSchema(true),
        elementSkill: createTalentSchema(false),
        elementalBurst: createTalentSchema(false)
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
CharacterSchema.pre("save", function(next) {
    const doc: any = this;
    if(doc.id) doc.id = String(doc.id).toLowerCase();
    next();
});

CharacterSchema.pre("findOneAndUpdate", function(next) {
    const update: any = this.getUpdate() || {};
    if(update.id) update.id = String(update.id).toLowerCase();
    if(update.$set && update.$set.id) update.$set.id = String(update.$set.id).toLowerCase();
    this.setUpdate(update);
    
    next();
});

export default mongoose.model<ICharacter>("Character", CharacterSchema);