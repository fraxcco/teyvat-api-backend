import mongoose from "mongoose";
import { IArtifact } from "../../interfaces/";
import { ArtifactName, ArtifactRarity, ArtifactRegion } from "../../enums/";

const ID_VALUES = Object.keys(ArtifactName).map((key) => key.toLowerCase());
const NAME_VALUES = Object.values(ArtifactName).filter(value => typeof value === "string");
const RARITY_VALUES = Object.values(ArtifactRarity).filter(value => typeof value === "number");
const REGION_VALUES = Object.values(ArtifactRegion).filter(value => typeof value === "string");

const ArtifactSchema = new mongoose.Schema<IArtifact>({
    id: { type: String, enum: ID_VALUES, required: true },
    name: { type: String, enum: NAME_VALUES, required: true },
    rarity: { type: Number, enum: RARITY_VALUES, required: true },
    region: { type: String, enum: REGION_VALUES, required: true },
    versionAdded: { type: String, required: true },
    releaseDate: { type: Date, required: true, set: (value: unknown) => (value ? new Date(value as string) : value), max: new Date() },
    setBonus: { twoPiece: { type: String }, fourPiece: { type: String } },
}, { versionKey: false });

ArtifactSchema.index({ name: "text" });
ArtifactSchema.index({ id: 1 }, { unique: true });
ArtifactSchema.index({ name: 1 }, { collation: { locale: "en", strength: 2 } });
ArtifactSchema.index({ rarity: 1 });
ArtifactSchema.index({ region: 1 });
ArtifactSchema.index({ versionAdded: 1 });
ArtifactSchema.index({ releaseDate: -1 });

export default mongoose.model<IArtifact>("Artifact", ArtifactSchema);