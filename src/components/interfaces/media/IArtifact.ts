import { Document } from "mongoose";
import { ArtifactName, ArtifactRarity, ArtifactRegion } from "../../enums/";

export interface IArtifact extends Document {
    id: string;
    name: ArtifactName;
    rarity: ArtifactRarity;
    region: ArtifactRegion;
    versionAdded: string;
    releaseDate: Date;
    setBonus: {
        twoPiece: string;
        fourPiece: string;
    };
};